// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.4;

import { OwnableWithManagers } from "../../access/OwnableWithManagers.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import { IERC721 } from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../../lib/strings.sol";

interface IBlast {
  function configureClaimableGas() external;
  function configureGovernor(address _governor) external;
}

interface IFlexiPunkTLD is IERC721 {

  function mint(
    string memory _domainName,
    address _domainHolder,
    address _referrer
  ) external payable returns(uint256);

}

interface ITldStats {
  function addWeiSpent(address _user, uint256 _weiSpent) external;
}

// BlastChat ID minter contract
contract BlastSniperzIdMinter is OwnableWithManagers, ReentrancyGuard {
  address public distributorAddress; // revenue distributor contract address
  address public immutable nftAddress; // BlastSniperz NFT contract address
  address public statsAddress; // stats contract address

  bool public paused = false;

  uint256 public referralFee = 1000; // share of each domain purchase (in bips) that goes to the referrer
  uint256 public constant MAX_BPS = 10_000;

  uint256 public price1char; // 1 char domain price
  uint256 public price2char; // 2 chars domain price
  uint256 public price3char; // 3 chars domain price
  uint256 public price4char; // 4 chars domain price
  uint256 public price5char; // 5+ chars domain price

  IFlexiPunkTLD public immutable tldContract;

  mapping (uint256 => bool) public alreadyMinted; // mapping of NFT IDs that already minted a domain

  // CONSTRUCTOR
  constructor(
    address _nftAddress, 
    address _distributorAddress,
    address _gov,
    address _statsAddress,
    address _tldAddress,
    uint256 _price1char,
    uint256 _price2char,
    uint256 _price3char,
    uint256 _price4char,
    uint256 _price5char
  ) {
    IBlast(0x4300000000000000000000000000000000000002).configureClaimableGas();
    IBlast(0x4300000000000000000000000000000000000002).configureGovernor(_gov);

    nftAddress = _nftAddress;
    distributorAddress = _distributorAddress;
    statsAddress = _statsAddress;
    tldContract = IFlexiPunkTLD(_tldAddress);

    price1char = _price1char;
    price2char = _price2char;
    price3char = _price3char;
    price4char = _price4char;
    price5char = _price5char;
  }

  // WRITE

  /// @notice Domain minting function for BlastSniperz NFT holders
  function holderFreeMint(
    string memory _domainName,
    address _domainHolder,
    uint256 _nftId
  ) external nonReentrant returns(uint256 tokenId) {
    require(!paused, "Minting paused");
    require(!alreadyMinted[_nftId], "Already minted a domain");
    require(IERC721(nftAddress).ownerOf(_nftId) == msg.sender, "Not the owner of the NFT");

    alreadyMinted[_nftId] = true;

    // mint a domain
    tokenId = tldContract.mint{value: 0}(_domainName, _domainHolder, address(0));
  }

  /// @notice Public domain minting function
  function mint(
    string memory _domainName,
    address _domainHolder,
    address _referrer
  ) external nonReentrant payable returns(uint256 tokenId) {
    require(!paused, "Minting paused");

    // find price
    uint256 domainLength = strings.len(strings.toSlice(_domainName));
    uint256 selectedPrice;

    if (domainLength == 1) {
      selectedPrice = price1char;
    } else if (domainLength == 2) {
      selectedPrice = price2char;
    } else if (domainLength == 3) {
      selectedPrice = price3char;
    } else if (domainLength == 4) {
      selectedPrice = price4char;
    } else {
      selectedPrice = price5char;
    }

    require(msg.value >= selectedPrice, "Value below price");

    // send referral fee
    if (referralFee > 0 && _referrer != address(0)) {
      uint256 referralPayment = (selectedPrice * referralFee) / MAX_BPS;
      (bool sentReferralFee, ) = _referrer.call{value: referralPayment}("");
      require(sentReferralFee, "Failed to send referral fee");
      ITldStats(statsAddress).addWeiSpent(msg.sender, referralPayment);
      selectedPrice -= referralPayment;
    }

    // send the rest to distributor
    (bool sent, ) = distributorAddress.call{value: address(this).balance}("");
    require(sent, "Failed to send domain payment to distributor contract");

    // mint a domain
    tokenId = tldContract.mint{value: 0}(_domainName, _domainHolder, address(0));

    // add wei spent to stats
    ITldStats(statsAddress).addWeiSpent(msg.sender, selectedPrice);
  }

  // OWNER

  /// @notice This changes price in the minter contract
  function changePrice(uint256 _price, uint256 _chars) external onlyManagerOrOwner {
    require(_price > 0, "Cannot be zero");

    if (_chars == 1) {
      price1char = _price;
    } else if (_chars == 2) {
      price2char = _price;
    } else if (_chars == 3) {
      price3char = _price;
    } else if (_chars == 4) {
      price4char = _price;
    } else if (_chars == 5) {
      price5char = _price;
    }
  }

  /// @notice This changes referral fee in the minter contract
  function changeReferralFee(uint256 _referralFee) external onlyManagerOrOwner {
    require(_referralFee <= 2000, "Cannot exceed 20%");
    referralFee = _referralFee;
  }

  function ownerFreeMint(
    string memory _domainName,
    address _domainHolder
  ) external nonReentrant onlyManagerOrOwner returns(uint256 tokenId) {
    // mint a domain
    tokenId = tldContract.mint{value: 0}(_domainName, _domainHolder, address(0));
  }

  /// @notice Recover any ERC-20 token mistakenly sent to this contract address
  function recoverERC20(address tokenAddress_, uint256 tokenAmount_, address recipient_) external onlyManagerOrOwner {
    IERC20(tokenAddress_).transfer(recipient_, tokenAmount_);
  }

  /// @notice This changes the distributor address in the minter contract
  function setDistributorAddress(address _distributorAddress) external onlyManagerOrOwner {
    distributorAddress = _distributorAddress;
  }

  function togglePaused() external onlyManagerOrOwner {
    paused = !paused;
  }

  // withdraw ETH from contract
  function withdraw() external onlyManagerOrOwner {
    (bool success, ) = owner().call{value: address(this).balance}("");
    require(success, "Failed to withdraw ETH from contract");
  }

  // RECEIVE & FALLBACK
  receive() external payable {}
  fallback() external payable {}
 
}