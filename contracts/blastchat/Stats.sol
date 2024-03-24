// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.4;

import { OwnableWithManagers } from "../access/OwnableWithManagers.sol";

interface IBlast {
  function configureClaimableGas() external;
  function configureGovernor(address _governor) external;
}

/** 
@title Stats contract
@author Tempe Techie
*/
contract Stats is OwnableWithManagers {
  address public statsWriterAddress;
  uint256 public totalVolumeWei;
  mapping (address => uint256) public weiSpentPerAddress;

  // CONSTRUCTOR
  constructor(address blastAddress_, address gov_) {
    IBlast(blastAddress_).configureClaimableGas();
    IBlast(blastAddress_).configureGovernor(gov_);
  }
  
  // READ

  function getWeiSpent(address user_) external view returns (uint256) {
    return weiSpentPerAddress[user_];
  }

  function weiSpentTotal() external view returns (uint256) {
    return totalVolumeWei;
  }

  // WRITE

  function addWeiSpent(address user_, uint256 weiSpent_) external {
    require(msg.sender == statsWriterAddress, "Not a stats writer");
    
    weiSpentPerAddress[user_] += weiSpent_;
    totalVolumeWei += weiSpent_;
  }
  
  // OWNER

  function addWriter(address statsWriterAddress_) external onlyManagerOrOwner {
    // for compatibility with deployment scripts, in case someone wants to use the stats contract directly, without the middleware contract
    statsWriterAddress = statsWriterAddress_;
  }

  function setStatsWriterAddress(address statsWriterAddress_) external onlyManagerOrOwner {
    statsWriterAddress = statsWriterAddress_;
  }

}