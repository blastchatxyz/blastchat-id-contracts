// npx hardhat run scripts/partners/blast-sniperz/3_deployMinter.js --network blast
// it automatically adds minter address to the TLD contract as minter

const contractNameFactory = "BlastSniperzIdMinter";

const nftAddress = "0x4d910a7eE24a04A6eeebDFe50dd52902AA2Ff0B4"; // Blast Sniperz NFT contract address
const blastGovernor = "0x7A84e7f48DCe4ab212c3511eC5ade0982eaBa8c4";
const statsAddress = "0x7f46BB50861D204789998FD691150A017541739D"; // stats middleware contract address

const distributorAddress = "0xAf8f43705B2642E8f15393485F7308C2b37C503F";
const tldAddress = "0xB241f801DFBa4a109EFA3f31C9269D437F2270aa";

const paymentTokenDecimals = 18;

const price1char = ethers.utils.parseUnits("0.1", paymentTokenDecimals);
const price2char = ethers.utils.parseUnits("0.06", paymentTokenDecimals);
const price3char = ethers.utils.parseUnits("0.03", paymentTokenDecimals);
const price4char = ethers.utils.parseUnits("0.008", paymentTokenDecimals);
const price5char = ethers.utils.parseUnits("0.0006", paymentTokenDecimals);

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // deploy contract
  const contract = await ethers.getContractFactory(contractNameFactory);
  const instance = await contract.deploy(
    nftAddress, distributorAddress, blastGovernor, statsAddress, tldAddress,
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
  console.log("npx hardhat verify --network " + network.name + " " + instance.address + " " + nftAddress + " " + distributorAddress + " " + blastGovernor + " " + statsAddress + " " + tldAddress + ' "' + price1char + '" "' + price2char + '" "' + price3char + '" "' + price4char + '" "' + price5char + '"');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });