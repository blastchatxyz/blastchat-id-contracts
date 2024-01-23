// Deploy forbidden contract
// contractForb.deploy({nonce: 0}); if you want to set nonce manually
// npx hardhat run scripts/blast/2_deployForbiddenTlds.js --network blastSepolia

async function main() {
  const contractName = "PunkForbiddenTlds";

  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const contract = await ethers.getContractFactory(contractName);
  const instance = await contract.deploy();
  
  console.log(contractName, "contract address:", instance.address);

  console.log("Wait a minute and then run this command to verify contracts on block explorer:");
  console.log("npx hardhat verify --network " + network.name + " " + instance.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });