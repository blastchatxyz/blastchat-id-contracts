// Deploy metadata contract
// npx hardhat run scripts/blast/5_deployStats.js --network blast

const blastAddress = "0x4300000000000000000000000000000000000002";
const blastGovernor = "0xA33dCbE04278706248891931537Dd56B795c3663";

async function main() {
  const contractName = "Stats";

  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // deploy contract
  const contract = await ethers.getContractFactory(contractName);
  const instance = await contract.deploy(
    blastAddress,
    blastGovernor
  );

  await instance.deployed();

  console.log("Contract address:", instance.address);

  console.log("Wait a minute and then run this command to verify contracts on block explorer:");
  console.log("npx hardhat verify --network " + network.name + " " + instance.address + " " + blastAddress + " " + blastGovernor);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });