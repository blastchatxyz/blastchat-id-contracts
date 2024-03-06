// Run: npx hardhat run scripts/blast/verify/manualTldVerification.js --network blast

const networkName = "blastSepolia";
const tldAddress = "0x32749Ab66ef1B85aFfF3425d5766d8025E407769";

async function main() {
  console.log("Copy the line below and paste it in your terminal to verify the TLD contract on Etherscan:");
  console.log("");
  console.log("npx hardhat verify --network " + networkName + " --constructor-args scripts/blast/verify/arguments.js " + tldAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });