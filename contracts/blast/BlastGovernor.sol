// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.4;

import { OwnableWithManagers } from "../access/OwnableWithManagers.sol";
import { GasMode, IBlast } from "./IBlast.sol";

/// @title Blast Governor contract
/// @author Tempe Techie
/// @notice Contract that governs Blast smart contract gas claims
contract BlastGovernor is OwnableWithManagers {
  address public blastAddress; // 0x4300000000000000000000000000000000000002
  address public feeReceiver;

  // CONSTRUCTOR
  constructor(address blastAddress_, address feeReceiver_) {
    IBlast(blastAddress_).configureClaimableGas();
    
    blastAddress = blastAddress_;
    feeReceiver = feeReceiver_;
  }

  // READ

  // read how much gas you can claim etc. per smart contract
  function readGasParams(address _contractAddress) public view returns(uint256 etherSeconds, uint256 etherBalance, uint256 lastUpdated, GasMode) {
    return IBlast(blastAddress).readGasParams(_contractAddress);
  }

  // WRITE
  
  /// @notice Claim only fully vested gas for a given smart contract. Anyone can call this function, ETH will be sent to the fee receiver.
  function claimMaxGas(address _contractAddress) external {
    IBlast(blastAddress).claimMaxGas(_contractAddress, feeReceiver);
  }

  /// @notice Claim max gas for multiple smart contracts. Anyone can call this function, ETH will be sent to the fee receiver.
  function claimMaxGasMultiple(address[] calldata _contractAddresses) external {
    for (uint256 i = 0; i < _contractAddresses.length; i++) {
      IBlast(blastAddress).claimMaxGas(_contractAddresses[i], feeReceiver);
    }
  }

  /// @notice Recover ETH that is stuck in this contract. Anyone can call this function, ETH will be sent to the fee receiver.
  function recoverETH() external {
    (bool success, ) = feeReceiver.call{value: address(this).balance}("");
    require(success, "Failed to withdraw ETH from contract");
  }

  // OWNER

  /// @notice Change blast address
  function changeBlastAddress(address _newBlastAddress) external onlyOwner {
    IBlast(_newBlastAddress).configureClaimableGas();
    blastAddress = _newBlastAddress;
  }

  /// @notice Change fee receiver
  function changeFeeReceiver(address _newFeeReceiver) external onlyOwner {
    feeReceiver = _newFeeReceiver;
  }

  /// @notice Change governor in a given smart contract
  function changeGovernorInContract(address _newGovernor, address _contractAddress) external onlyOwner {
    IBlast(blastAddress).configureGovernorOnBehalf(_newGovernor, _contractAddress);
  }

  /// @notice Change governor in multiple smart contracts
  function changeGovernorInMultipleContracts(address _newGovernor, address[] calldata _contractAddresses) external onlyOwner {
    uint256 cLength = _contractAddresses.length;

    for (uint256 i = 0; i < cLength;) {
      IBlast(blastAddress).configureGovernorOnBehalf(_newGovernor, _contractAddresses[i]);
      unchecked {
        i++;
      }
    }
  }

  /// @notice More gas efficient version of claimMaxGasMultiple, but only owner/manager can call it due to unchecked
  function claimMaxGasMultipleOwner(address[] calldata _contractAddresses) external onlyManagerOrOwner {
    uint256 cLength = _contractAddresses.length;

    for (uint256 i = 0; i < cLength;) {
      IBlast(blastAddress).claimMaxGas(_contractAddresses[i], feeReceiver);
      unchecked {
        i++;
      }
    }
  }

  // RECEIVE & FALLBACK
  receive() external payable {}
  fallback() external payable {}
  
}