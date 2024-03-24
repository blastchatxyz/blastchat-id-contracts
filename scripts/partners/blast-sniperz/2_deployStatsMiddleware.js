// Deploy metadata contract
// npx hardhat run scripts/partners/blast-sniperz/2_deployStatsMiddleware.js --network blast

const blastAddress = "0x4300000000000000000000000000000000000002";
const blastGovernor = "0x7A84e7f48DCe4ab212c3511eC5ade0982eaBa8c4";
const statsAddress = "0xd65594168FAe4cBEbFedAb83f44c65A8FF41b683";
const managerAddress = "0xb29050965A5AC70ab487aa47546cdCBc97dAE45D"; // TODO: add iggy address here

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

  // get stats contract
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