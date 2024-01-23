// Deploy FlexiPunkMetadata contract
// npx hardhat run scripts/blast/8_deployCustomMetadata.js --network blastSepolia

const tldAddress = "0x32749Ab66ef1B85aFfF3425d5766d8025E407769";

async function main() {
  const contractName = "BlastChatIdMetadata";

  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // deploy contract
  const contract = await ethers.getContractFactory(contractName);
  const instance = await contract.deploy();

  await instance.deployed();

  console.log("Metadata contract address:", instance.address);

  // add metadata contract address to the TLD contract
  console.log("Adding metadata contract address to the TLD contract...");
  const contractTld = await ethers.getContractFactory("FlexiPunkTLD");
  const instanceTld = await contractTld.attach(tldAddress);

  const tx1 = await instanceTld.changeMetadataAddress(instance.address);
  await tx1.wait();

  console.log("Wait a minute and then run this command to verify contracts on Etherscan:");
  console.log("npx hardhat verify --network " + network.name + " " + instance.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });