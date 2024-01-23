// Deploy metadata contract
// npx hardhat run scripts/blast/6_deployStatsMiddleware.js --network blastSepolia

const blastAddress = "0x4300000000000000000000000000000000000002";
const blastGovernor = "0xC6c17896fa051083324f2aD0Ed4555dC46D96E7f";
const statsAddress = "0x1D882E64bb7f4D49e67018d81254236A2A6465a3";

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