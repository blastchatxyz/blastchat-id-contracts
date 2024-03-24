// Run: npx hardhat run scripts/blast/verify/manualTldVerification.js --network blast

const tldAddress = "0xB241f801DFBa4a109EFA3f31C9269D437F2270aa";

async function main() {
  console.log("Copy the line below and paste it in your terminal to verify the TLD contract on Etherscan:");
  console.log("");
  console.log("npx hardhat verify --network " + network.name + " --constructor-args scripts/blast/verify/arguments.js " + tldAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });