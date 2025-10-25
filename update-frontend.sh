#!/bin/bash

echo "📝 PropShare - Update Frontend with Sepolia Contract"
echo "===================================================="
echo ""

# Check if deployment exists
DEPLOYMENT_FILE="packages/foundry/broadcast/Deploy.s.sol/11155111/run-latest.json"

if [ ! -f "$DEPLOYMENT_FILE" ]; then
    echo "❌ Error: Deployment file not found!"
    echo ""
    echo "Expected: $DEPLOYMENT_FILE"
    echo ""
    echo "📝 Please run deployment first:"
    echo "   ./deploy-sepolia.sh"
    exit 1
fi

echo "✅ Found deployment file"
echo ""

# Extract contract address using jq
CONTRACT_ADDRESS=$(jq -r '.transactions[] | select(.transactionType == "CREATE") | .contractAddress' "$DEPLOYMENT_FILE" | head -n 1)

if [ -z "$CONTRACT_ADDRESS" ]; then
    echo "❌ Error: Could not find contract address in deployment file"
    exit 1
fi

echo "📍 Deployed Contract Address: $CONTRACT_ADDRESS"
echo ""

# Get ABI from compiled contract
ABI_FILE="packages/foundry/out/PropShare.sol/PropShare.json"

if [ ! -f "$ABI_FILE" ]; then
    echo "❌ Error: Contract ABI not found!"
    echo "Expected: $ABI_FILE"
    echo ""
    echo "📝 Please compile contracts first:"
    echo "   cd packages/foundry && forge build"
    exit 1
fi

echo "✅ Found contract ABI"
echo ""

# Extract ABI
ABI=$(jq '.abi' "$ABI_FILE")

# Create backup of deployedContracts.ts
CONTRACTS_FILE="packages/nextjs/contracts/deployedContracts.ts"
BACKUP_FILE="packages/nextjs/contracts/deployedContracts.ts.backup"

cp "$CONTRACTS_FILE" "$BACKUP_FILE"
echo "✅ Created backup: $BACKUP_FILE"
echo ""

# Check if Sepolia config already exists
if grep -q "11155111" "$CONTRACTS_FILE"; then
    echo "⚠️  Sepolia config already exists in deployedContracts.ts"
    echo ""
    echo "📝 Manual update required:"
    echo "1. Open: $CONTRACTS_FILE"
    echo "2. Find the 11155111 section"
    echo "3. Update address to: $CONTRACT_ADDRESS"
    echo ""
else
    echo "🔧 Adding Sepolia configuration..."
    echo ""
    
    # TODO: Implement automatic addition of Sepolia config
    echo "📝 Manual update required:"
    echo "1. Open: $CONTRACTS_FILE"
    echo "2. Add Sepolia configuration:"
    echo ""
    echo "11155111: {"
    echo "  PropShare: {"
    echo "    address: \"$CONTRACT_ADDRESS\","
    echo "    abi: // Copy from localhost config or $ABI_FILE"
    echo "  }"
    echo "}"
    echo ""
fi

echo "📋 Contract Information:"
echo "========================"
echo ""
echo "Network: Sepolia Testnet"
echo "Chain ID: 11155111"
echo "Contract Address: $CONTRACT_ADDRESS"
echo ""
echo "🔍 View on Etherscan:"
echo "https://sepolia.etherscan.io/address/$CONTRACT_ADDRESS"
echo ""
echo "✅ Next steps:"
echo "1. Update $CONTRACTS_FILE with the address above"
echo "2. Run: yarn start"
echo "3. Connect MetaMask to Sepolia"
echo "4. You are ADMIN!"
