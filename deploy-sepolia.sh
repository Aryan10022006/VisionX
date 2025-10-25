#!/bin/bash

echo "🚀 PropShare - Sepolia Testnet Deployment"
echo "=========================================="
echo ""

# Check if .env exists and has required variables
if [ ! -f "packages/foundry/.env" ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create packages/foundry/.env file"
    exit 1
fi

# Source the .env file
source packages/foundry/.env

# Check if DEPLOYER_PRIVATE_KEY is set
if [ -z "$DEPLOYER_PRIVATE_KEY" ]; then
    echo "❌ Error: DEPLOYER_PRIVATE_KEY not set in .env file!"
    echo ""
    echo "📝 To fix:"
    echo "1. Open MetaMask"
    echo "2. Click Account Details"
    echo "3. Export Private Key"
    echo "4. Add to packages/foundry/.env:"
    echo "   DEPLOYER_PRIVATE_KEY=your_private_key_here"
    exit 1
fi

# Check if ALCHEMY_API_KEY is set
if [ -z "$ALCHEMY_API_KEY" ]; then
    echo "❌ Error: ALCHEMY_API_KEY not set in .env file!"
    echo ""
    echo "📝 To fix:"
    echo "1. Go to https://www.alchemy.com"
    echo "2. Create app for Sepolia"
    echo "3. Copy API key"
    echo "4. Add to packages/foundry/.env:"
    echo "   ALCHEMY_API_KEY=your_api_key_here"
    exit 1
fi

echo "✅ Environment variables loaded"
echo ""

# Get deployer address from private key
DEPLOYER_ADDRESS=$(cast wallet address $DEPLOYER_PRIVATE_KEY)
echo "👤 Deployer Address: $DEPLOYER_ADDRESS"
echo ""

# Check balance
echo "💰 Checking Sepolia ETH balance..."
BALANCE=$(cast balance $DEPLOYER_ADDRESS --rpc-url https://eth-sepolia.g.alchemy.com/v2/$ALCHEMY_API_KEY)
BALANCE_ETH=$(cast to-unit $BALANCE ether)
echo "Balance: $BALANCE_ETH ETH"
echo ""

# Check if balance is sufficient
if (( $(echo "$BALANCE_ETH < 0.01" | bc -l) )); then
    echo "❌ Insufficient balance! You need at least 0.01 ETH"
    echo ""
    echo "📝 To get FREE Sepolia ETH:"
    echo "1. Go to: https://sepoliafaucet.com"
    echo "2. Enter your address: $DEPLOYER_ADDRESS"
    echo "3. Click 'Send Me ETH'"
    echo "4. Wait 30 seconds and run this script again"
    exit 1
fi

echo "✅ Sufficient balance for deployment"
echo ""
echo "🔨 Deploying PropShare contract to Sepolia..."
echo ""

# Deploy to Sepolia
cd packages/foundry
forge script script/Deploy.s.sol:Deploy \
    --rpc-url https://eth-sepolia.g.alchemy.com/v2/$ALCHEMY_API_KEY \
    --private-key $DEPLOYER_PRIVATE_KEY \
    --broadcast \
    --verify \
    --etherscan-api-key $ETHERSCAN_API_KEY \
    -vvvv

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 SUCCESS! Contract deployed to Sepolia testnet!"
    echo ""
    echo "📝 Next steps:"
    echo "1. Check deployment in: packages/foundry/broadcast/Deploy.s.sol/11155111/run-latest.json"
    echo "2. Update packages/nextjs/contracts/deployedContracts.ts with Sepolia config"
    echo "3. Run: yarn start"
    echo "4. Connect MetaMask to Sepolia network"
    echo "5. You are ADMIN! (address: $DEPLOYER_ADDRESS)"
    echo ""
    echo "🔍 View on Etherscan:"
    echo "https://sepolia.etherscan.io/address/YOUR_CONTRACT_ADDRESS"
else
    echo ""
    echo "❌ Deployment failed! Check the error above."
    exit 1
fi
