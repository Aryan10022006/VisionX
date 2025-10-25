# 🚀 PropShare - Quick Commands

## Development Commands

### Start Everything (3 Terminals Required)

**Terminal 1 - Local Blockchain**:
```bash
cd /home/aryan/Projects/visionx
yarn chain
```
- Starts Anvil local node on http://127.0.0.1:8545
- Provides test accounts with 10,000 ETH each
- Keep this running

**Terminal 2 - Deploy Contracts**:
```bash
cd /home/aryan/Projects/visionx
yarn deploy
```
- Compiles PropShare.sol
- Deploys to local network
- Generates TypeScript ABI
- Run this after starting chain

**Terminal 3 - Start Frontend**:
```bash
cd /home/aryan/Projects/visionx
yarn start
```
- Starts Next.js on http://localhost:3000
- Hot reload enabled
- Keep this running

## Testing Commands

### Run Smart Contract Tests:
```bash
cd /home/aryan/Projects/visionx/packages/foundry
forge test
```

### Verbose Test Output:
```bash
forge test -vvv
```

### Test Specific Contract:
```bash
forge test --match-contract PropShareTest
```

### Test Specific Function:
```bash
forge test --match-test testBuyShares
```

## Build Commands

### Compile Contracts:
```bash
cd /home/aryan/Projects/visionx/packages/foundry
forge build
```

### Clean Build Artifacts:
```bash
forge clean
```

### Build Frontend:
```bash
cd /home/aryan/Projects/visionx
yarn build
```

## Debugging Commands

### Check Contract Size:
```bash
forge build --sizes
```

### View Gas Report:
```bash
forge test --gas-report
```

### Generate Coverage Report:
```bash
forge coverage
```

## MetaMask Setup

### Add Local Network:
1. Open MetaMask
2. Click network dropdown → Add Network
3. Network Name: `Localhost 8545`
4. RPC URL: `http://127.0.0.1:8545`
5. Chain ID: `31337`
6. Currency Symbol: `ETH`

### Import Test Account:
1. Copy private key from `yarn chain` output
2. MetaMask → Import Account
3. Paste private key
4. You'll have 10,000 ETH to test

## Common Issues & Fixes

### Issue: "Error: connect ECONNREFUSED"
**Fix**: Start yarn chain first
```bash
yarn chain
```

### Issue: "Contract not deployed"
**Fix**: Redeploy contracts
```bash
yarn deploy
```

### Issue: "Transaction failed"
**Fix**: 
1. Reset MetaMask account (Settings → Advanced → Reset Account)
2. Restart yarn chain
3. Redeploy contracts

### Issue: "Frontend not updating"
**Fix**: 
```bash
# Clear cache
rm -rf packages/nextjs/.next

# Restart
yarn start
```

### Issue: "Build errors"
**Fix**:
```bash
# Clean everything
yarn clean

# Reinstall
rm -rf node_modules
yarn install
```

## Useful Shortcuts

### View Logs:
```bash
# Anvil logs (Terminal 1)
# Deploy logs (Terminal 2)
# Next.js logs (Terminal 3)
```

### Stop All:
```bash
# Press Ctrl+C in each terminal
```

### Restart All:
```bash
# Terminal 1
yarn chain

# Terminal 2
yarn deploy

# Terminal 3
yarn start
```

## File Locations

### Smart Contracts:
- `packages/foundry/contracts/PropShare.sol`

### Tests:
- `packages/foundry/test/PropShare.t.sol`

### Frontend:
- `packages/nextjs/app/page.tsx` (Main UI)
- `packages/nextjs/contracts/deployedContracts.ts` (ABI)

### Deployment Scripts:
- `packages/foundry/script/DeployPropShare.s.sol`
- `packages/foundry/script/Deploy.s.sol`

## Environment Variables

Create `.env` if needed:
```bash
# packages/nextjs/.env
NEXT_PUBLIC_ALCHEMY_API_KEY=your_key_here

# packages/foundry/.env
DEPLOYER_PRIVATE_KEY=your_key_here
ETHERSCAN_API_KEY=your_key_here
```

## Production Deployment

### Deploy to Sepolia:
```bash
cd packages/foundry
forge script script/Deploy.s.sol --rpc-url sepolia --broadcast --verify
```

### Deploy to Polygon:
```bash
forge script script/Deploy.s.sol --rpc-url polygon --broadcast --verify
```

## Verify Contract

```bash
forge verify-contract \
  --chain-id 11155111 \
  --etherscan-api-key YOUR_KEY \
  CONTRACT_ADDRESS \
  PropShare
```

## Documentation

- **Setup Guide**: `SETUP_GUIDE.md`
- **Quick Start**: `QUICK_START.md`
- **Demo Script**: `HACKATHON_DEMO.md`
- **Status**: `STATUS.md`
- **Main README**: `README.md`

## Help & Support

### Scaffold-ETH Docs:
https://docs.scaffoldeth.io

### Foundry Docs:
https://book.getfoundry.sh

### Next.js Docs:
https://nextjs.org/docs

---

**Quick Reference Card Printed! Keep this handy during the hackathon! 📋**
