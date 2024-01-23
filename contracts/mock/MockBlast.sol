// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.4;

/// @title Mock Blast contract
/// @author Tempe Techie
/// @notice Mock Blast contract for testing purposes
contract MockBlast {
  enum GasMode { VOID, CLAIMABLE }

  // READ

  function readGasParams(address _contractAddress) public view returns(uint256 etherSeconds, uint256 etherBalance, uint256 lastUpdated, GasMode) {
    return (0, 1 ether, 0, GasMode.CLAIMABLE);
  }

  // WRITE

  function configureClaimableGas() external {}

  function configureGovernor(address _governor) external {}

  function configureGovernorOnBehalf(address _newGovernor, address contractAddress) external {}

  function claimMaxGas(address contractAddress, address recipientOfGas) external returns (uint256) {
    if (address(this).balance > 1 ether) {
      (bool success, ) = recipientOfGas.call{value: 1 ether}("");
      require(success, "Failed to send ETH to gas recipient");
      return 1 ether;
    }

    return 0;
  }

  // RECEIVE & FALLBACK
  receive() external payable {}
  fallback() external payable {}
}