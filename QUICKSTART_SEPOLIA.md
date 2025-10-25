# 🚀 Quick Start - Sepolia Testnet Deployment

## ⚡ 5-Minute Setup

### 1. Get Alchemy API Key
- Visit: https://dashboard.alchemy.com/
- Create app → Ethereum Sepolia
- Copy API key

### 2. Create .env.local
```bash
cd packages/nextjs
cp .env.local.example .env.local
# Edit and add your Alchemy key
```

### 3. Get Sepolia ETH
- Visit: https://sepoliafaucet.com/
- Enter your wallet address
- Wait for 0.5 ETH to arrive

### 4. Import Deployment Account
```bash
yarn foundry:account-import
# Enter your private key
# Create password
# Name: sepolia-deployer
```

### 5. Deploy Contract
```bash
yarn deploy --network sepolia
# Copy the deployed contract address!
```

### 6. Update Contract Address
Edit `packages/nextjs/contracts/deployedContracts.ts`:
```typescript
11155111: {
  PropShare: {
    address: "0xYourDeployedAddress", // <-- PASTE HERE
```

### 7. Test Locally
```bash
yarn start
# Visit http://localhost:3000
# Connect MetaMask (Sepolia network)
# Test tokenization, buying, etc.
```

### 8. Deploy to Vercel
```bash
git add .
git commit -m "Deploy to Sepolia"
git push origin main
```

- Go to Vercel.com
- Import repository
- Root: `packages/nextjs`
- Add env var: `NEXT_PUBLIC_ALCHEMY_API_KEY`
- Deploy!

---

## 🎯 Your Live URLs

After deployment:
- **Live Site**: `https://your-project.vercel.app`
- **Contract**: `https://sepolia.etherscan.io/address/0xYourAddress`
- **GitHub**: `https://github.com/Aryan10022006/VisionX`

---

## 🐛 Quick Fixes

**"Insufficient funds"** → Get more Sepolia ETH from faucets

**"Wrong network"** → Switch MetaMask to Sepolia

**"Transaction failed"** → Check contract address is correct

**Vercel build fails** → Verify env variables are set

---

## 📚 Full Guide

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed step-by-step instructions.

---

## ✅ Features to Test

- [ ] Tokenize property (admin only)
- [ ] Buy shares (any user)
- [ ] Deposit rent (manager only)
- [ ] Withdraw yield (shareholders)
- [ ] Create proposal (shareholders)
- [ ] Vote on proposal (shareholders)
- [ ] View on Etherscan

---

Good luck! 🎉
