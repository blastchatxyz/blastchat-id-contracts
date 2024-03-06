// Deploy metadata contract
// npx hardhat run scripts/blast/6_deployStatsMiddleware.js --network blast

const blastAddress = "0x4300000000000000000000000000000000000002";
const blastGovernor = "0xA33dCbE04278706248891931537Dd56B795c3663";
const statsAddress = "";
const managerAddress = ""; // TODO: add iggy address here

async function main() {
  const contractName = "StatsMiddleware";

  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // deploy contract
  const contract = await ethers.getContractFactory(contractName);
  const instance = await contract.deploy(
    blastAddress,
    blastGovernor,
    statsAddress
  );

  await instance.deployed();

  // add manager address
  const tx1 = await instance.addManager(managerAddress);
  await tx1.wait();

  // create stats contract
  const stats = await ethers.getContractFactory("Stats");
  const statsInstance = await stats.attach(statsAddress);

  // set middleware contract address as setStatsWriterAddress
  await statsInstance.setStatsWriterAddress(instance.address);

  console.log("Contract address:", instance.address);

  console.log("Wait a minute and then run this command to verify contracts on block explorer:");
  console.log("npx hardhat verify --network " + network.name + " " + instance.address + " " + blastAddress + " " + blastGovernor + " " + statsAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });