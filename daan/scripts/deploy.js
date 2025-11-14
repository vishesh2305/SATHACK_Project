const { ethers } = require("hardhat");

async function main() {
  // --- OFFICIAL AAVE V3 SEPOLIA ADDRESSES ---
  
  // Constructor argument 1: Aave v3 WETH Gateway Address (Sepolia)
  // Source: https://docs.aave.com/developers/deployed-contracts/v3-testnet-addresses
const wethGatewayAddress = "0x387d311e47E80b498169E6FB51D3193167d89F12";
  
  // Constructor argument 2: Aave v3 Pool Address (Sepolia)
  // Source: https://docs.aave.com/developers/deployed-contracts/v3-testnet-addresses
const aavePoolAddress = "0x6ae43d3271ff6888e7fc4397ea9112e83638bcff";

  // --- END OF CORRECTIONS ---

  console.log("Getting the CrowdFunding contract factory...");
  const CrowdFundingFactory = await ethers.getContractFactory("CrowdFunding");

  console.log("Deploying CrowdFunding contract...");
  console.log(`Using constructor arguments for Sepolia:`);
  console.log(`  WETH Gateway (wethGatewayAddress): ${wethGatewayAddress}`);
  console.log(`  Aave Pool (aavePoolAddress): ${aavePoolAddress}`);

  const crowdFundingContract = await CrowdFundingFactory.deploy(
    wethGatewayAddress,
    aavePoolAddress
  );

  console.log("\nWaiting for contract to be deployed...");
  await crowdFundingContract.waitForDeployment();

  const deployedAddress = await crowdFundingContract.getAddress();
  console.log(`\n✅ Contract deployed successfully to: ${deployedAddress}`);
}

// Standard Hardhat script runner
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });