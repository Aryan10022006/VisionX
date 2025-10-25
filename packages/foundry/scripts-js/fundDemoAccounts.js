#!/usr/bin/env node

/**
 * Fund Demo Accounts with ETH
 * Transfers ETH from Hardhat test account #0 to other demo accounts
 * 
 * Usage: node scripts-js/fundDemoAccounts.js
 */

const { ethers } = require("ethers");

// Hardhat/Anvil default accounts (these come with 10000 ETH each on localhost)
const TEST_ACCOUNTS = [
  {
    name: "Account #0 (Deployer/Admin)",
    address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    privateKey: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
  },
  {
    name: "Account #1 (Demo Investor 1)",
    address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    privateKey: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
  },
  {
    name: "Account #2 (Demo Investor 2)",
    address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    privateKey: "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"
  },
  {
    name: "Account #3 (Demo Investor 3)",
    address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    privateKey: "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6"
  }
];

async function main() {
  try {
    console.log("🚀 PropShare Demo Account Funding Script\n");
    console.log("=" .repeat(60));

    // Connect to local network
    const provider = new ethers.JsonRpcProvider("http://localhost:8545");
    
    console.log("\n📡 Connected to localhost:8545");

    // Check if blockchain is running
    try {
      const network = await provider.getNetwork();
      console.log(`✅ Network: ${network.name} (Chain ID: ${network.chainId})`);
    } catch (error) {
      console.error("❌ Cannot connect to blockchain!");
      console.error("💡 Make sure you run: yarn chain");
      process.exit(1);
    }

    console.log("\n💰 Account Balances:");
    console.log("-" .repeat(60));

    // Check balances of all accounts
    for (const account of TEST_ACCOUNTS) {
      const balance = await provider.getBalance(account.address);
      const ethBalance = ethers.formatEther(balance);
      console.log(`${account.name}:`);
      console.log(`  Address: ${account.address}`);
      console.log(`  Balance: ${ethBalance} ETH`);
      console.log();
    }

    console.log("=" .repeat(60));
    console.log("\n✅ All test accounts are ready!");
    console.log("\n📋 DEMO INSTRUCTIONS:");
    console.log("-" .repeat(60));
    console.log("1. Import any of these private keys into MetaMask");
    console.log("2. Connect to 'Localhost 8545' network in MetaMask");
    console.log("3. Account #0 is the contract owner (admin)");
    console.log("4. Accounts #1-#3 are for testing user features");
    console.log("\n🔑 To import in MetaMask:");
    console.log("   - Click account icon → Import Account");
    console.log("   - Paste private key → Import");
    console.log("\n⚠️  NEVER use these keys on mainnet or testnets!");
    console.log("=" .repeat(60));

    // Display admin address specifically
    console.log("\n🎯 ADMIN ACCOUNT (Contract Owner):");
    console.log(`   Address: ${TEST_ACCOUNTS[0].address}`);
    console.log(`   This is Account #0 in MetaMask on localhost`);
    console.log(`   Use this account to access Admin Panel\n`);

  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
