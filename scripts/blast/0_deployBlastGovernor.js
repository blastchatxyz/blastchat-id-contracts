// Deploy FlexiPunkMetadata contract
// npx hardhat run scripts/blast/0_deployBlastGovernor.js --network blast

const blastAddress = "0x4300000000000000000000000000000000000002";
const feeReceiver = "0xE08033d0bDBcEbE7e619c3aE165E7957Ab577961";

async function main() {
  const contractName = "BlastGovernor";

  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // deploy contract
  const contract = await ethers.getContractFactory(contractName);
  const instance = await contract.deploy(
    blastAddress,
    feeReceiver
  );
  
  console.log(contractName, "contract address:", instance.address);

  console.log("Wait a minute and then run this command to verify contracts on Etherscan:");
  console.log("npx hardhat verify --network " + network.name + " " + instance.address + " " + blastAddress + " " + feeReceiver);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });