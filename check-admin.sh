#!/bin/bash

# Check who is the admin of PropShare contract

echo "🔍 Checking PropShare Admin..."
echo ""

# Get the contract address
CONTRACT_ADDRESS=$(grep -r "PropShare" packages/nextjs/contracts/deployedContracts.ts | grep "address:" | head -1 | cut -d'"' -f2)

if [ -z "$CONTRACT_ADDRESS" ]; then
    echo "❌ Contract not deployed yet!"
    echo ""
    echo "📝 Steps to deploy:"
    echo "1. Run: yarn chain (in terminal 1)"
    echo "2. Run: yarn deploy (in terminal 2)"
    echo "3. Run this script again"
    exit 1
fi

echo "📍 Contract Address: $CONTRACT_ADDRESS"
echo ""

# Check the owner
OWNER=$(cast call $CONTRACT_ADDRESS "owner()(address)" --rpc-url http://localhost:8545 2>/dev/null)

if [ $? -eq 0 ]; then
    echo "👑 ADMIN ADDRESS: $OWNER"
    echo ""
    echo "✅ To access admin panel:"
    echo "   1. Open MetaMask"
    echo "   2. Make sure you're on account: $OWNER"
    echo "   3. Connect to website"
    echo "   4. Look for 'Admin Panel' in navigation"
    echo ""
else
    echo "❌ Cannot connect to blockchain"
    echo ""
    echo "Make sure 'yarn chain' is running!"
fi
