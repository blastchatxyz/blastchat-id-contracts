// npx hardhat run scripts/blast/7_deployMinter.js --network blastSepolia
// it automatically adds minter address to the TLD contract as minter

const contractNameFactory = "BlastChatIdMinter";

const blastAddress = "0x4300000000000000000000000000000000000002";
const blastGovernor = "0xC6c17896fa051083324f2aD0Ed4555dC46D96E7f";
const statsAddress = "0x1f8cf0bc042308677838fB50f264992A4e783610"; // stats middleware contract address

const distributorAddress = "0xb29050965A5AC70ab487aa47546cdCBc97dAE45D";
const tldAddress = "0x32749Ab66ef1B85aFfF3425d5766d8025E407769";

const paymentTokenDecimals = 18;

const price1char = ethers.utils.parseUnits("1", paymentTokenDecimals);
const price2char = ethers.utils.parseUnits("0.1", paymentTokenDecimals);
const price3char = ethers.utils.parseUnits("0.03", paymentTokenDecimals);
const price4char = ethers.utils.parseUnits("0.008", paymentTokenDecimals);
const price5char = ethers.utils.parseUnits("0.002", paymentTokenDecimals);

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // deploy contract
  const contract = await ethers.getContractFactory(contractNameFactory);
  const instance = await contract.deploy(
    blastAddress, distributorAddress, blastGovernor, statsAddress, tldAddress,
    price1char, price2char, price3char, price4char, price5char
  );

  await instance.deployed();

  console.log("Contract address:", instance.address);

  // add minter address to the TLD contract
  console.log("Adding minter address to the TLD contract...");
  const contractTld = await ethers.getContractFactory("FlexiPunkTLD");
  const instanceTld = await contractTld.attach(tldAddress);

  const tx1 = await instanceTld.changeMinter(instance.address);
  await tx1.wait();

  // add minter address to the stats middleware contract
  console.log("Adding minter address to the stats middleware contract...");
  const contractStats = await ethers.getContractFactory("StatsMiddleware");
  const instanceStats = await contractStats.attach(statsAddress);

  const tx2 = await instanceStats.addWriter(instance.address);
  await tx2.wait();

  console.log("Done!");

  console.log("Wait a minute and then run this command to verify contract on the block explorer:");
  console.log("npx hardhat verify --network " + network.name + " " + instance.address + " " + blastAddress + " " + distributorAddress + " " + blastGovernor + " " + statsAddress + " " + tldAddress + ' "' + price1char + '" "' + price2char + '" "' + price3char + '" "' + price4char + '" "' + price5char + '"');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });