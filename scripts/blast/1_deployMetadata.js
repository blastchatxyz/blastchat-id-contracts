// Deploy FlexiPunkMetadata contract
// npx hardhat run scripts/blast/1_deployMetadata.js --network blastSepolia

const blastAddress = "0x4300000000000000000000000000000000000002";
const blastGovernor = "0xC6c17896fa051083324f2aD0Ed4555dC46D96E7f";

async function main() {
  const contractName = "FlexiPunkMetadata";

  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // deploy contract
  const contract = await ethers.getContractFactory(contractName);
  const instance = await contract.deploy(
    blastAddress,
    blastGovernor
  );
  
  console.log(contractName, "contract address:", instance.address);

  console.log("Wait a minute and then run this command to verify contracts on Etherscan:");
  console.log("npx hardhat verify --network " + network.name + " " + instance.address + " " + blastAddress + " " + blastGovernor);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });