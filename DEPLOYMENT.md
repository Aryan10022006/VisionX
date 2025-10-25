# 🚀 PropShare - Complete Testnet & Live Deployment Guide

This guide will walk you through deploying PropShare to **Sepolia testnet** and then to **Vercel** for a live demo.

## 📋 Prerequisites

- Node.js 18+ and Yarn installed
- MetaMask wallet
- GitHub account
- Vercel account (free tier is fine)
- Alchemy account (free tier)

---

## Part 1: Setup & Configuration

### Step 1: Get Alchemy API Key

1. Visit [Alchemy Dashboard](https://dashboard.alchemy.com/)
2. Sign up or log in
3. Click "Create New App"
   - **Chain**: Ethereum
   - **Network**: Sepolia
   - **Name**: PropShare Sepolia
4. Copy your **API Key** (not the full URL, just the key part)

### Step 2: Create Environment File

```bash
# Navigate to nextjs package
cd packages/nextjs

# Copy example file
cp .env.local.example .env.local

# Edit .env.local
nano .env.local  # or use any text editor
```

**Add your Alchemy API key:**
```env
NEXT_PUBLIC_ALCHEMY_API_KEY=your_actual_alchemy_key_here
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=3a8170812b534d0ff9d794f19a901d64
```

---

## Part 2: Get Testnet ETH

### Step 3: Fund Your Deployer Wallet

You need Sepolia ETH to deploy the contract (~$0 in real money, just testnet tokens).

**Recommended Faucets:**

1. **Alchemy Sepolia Faucet** (Best option)
   - URL: https://sepoliafaucet.com/
   - Login with Alchemy account
   - Enter your wallet address
   - Get 0.5 Sepolia ETH per day

2. **QuickNode Faucet**
   - URL: https://faucet.quicknode.com/ethereum/sepolia
   - No login required
   - Enter wallet address

3. **Infura Faucet**
   - URL: https://www.infura.io/faucet/sepolia
   - Requires Twitter verification
   - Get 0.5 Sepolia ETH

**How to get your wallet address:**
- Open MetaMask
- Click on account name to copy address
- Should look like: `0xYourAddress...`

**Wait for ETH to arrive** (usually 1-2 minutes)

---

## Part 3: Deploy Smart Contract to Sepolia

### Step 4: Prepare Deployment Account

```bash
# Return to project root
cd ../..

# Generate a deployer account keystore (or import existing)
yarn foundry:account-import
```

When prompted:
1. Enter your **private key** (from MetaMask: Settings → Security & Privacy → Reveal Private Key)
2. Create a **password** to encrypt the keystore
3. Give it a **name**: `sepolia-deployer`

**⚠️ Security Warning:** Never commit your private key or keystore password!

### Step 5: Deploy to Sepolia

```bash
# Deploy the PropShare contract
yarn deploy --network sepolia
```

**What happens:**
1. Script connects to Sepolia via Alchemy
2. Deploys PropShare.sol contract
3. Sets your address as owner
4. Saves deployment info to `packages/foundry/deployments/`

**Expected Output:**
```
Deploying PropShare to Sepolia...
✓ Contract deployed at: 0xYourContractAddress...
✓ Transaction hash: 0x...
✓ Gas used: ~2,500,000
✓ Deployment saved to deployments/sepolia.json
```

**Copy the contract address!** You'll need it next.

---

## Part 4: Update Frontend Configuration

### Step 6: Add Sepolia Contract Address

Open `packages/nextjs/contracts/deployedContracts.ts`:

Find line 2 where it says:
```typescript
11155111: {  // Sepolia chain ID
  PropShare: {
    address: "0x0000000000000000000000000000000000000000", // REPLACE
```

**Replace with your actual deployed address:**
```typescript
address: "0xYourActualContractAddressFromStep5",
```

### Step 7: Verify Configuration

Check `packages/nextjs/scaffold.config.ts`:
```typescript
targetNetworks: [chains.sepolia],  // ✓ Should be Sepolia
onlyLocalBurnerWallet: false,      // ✓ Should be false
```

---

## Part 5: Test Locally Before Deploying

### Step 8: Run Frontend Locally

```bash
# Start the Next.js development server
yarn start
```

Visit: http://localhost:3000

### Step 9: Test All Features

**Configure MetaMask:**
1. Switch to **Sepolia Test Network**
2. Ensure you have Sepolia ETH

**Test Admin Features (with deployer wallet):**
1. ✅ Connect with deployer wallet
2. ✅ Go to http://localhost:3000/admin
3. ✅ Tokenize a property:
   - **Name**: Sunset Villa
   - **Property URI**: https://example.com/property/1
   - **Total Shares**: 100
   - **Price Per Share**: 0.1 (ETH)
   - **Manager Address**: (your address or another test address)
4. ✅ Verify transaction on Sepolia Etherscan

**Test User Features (switch to different MetaMask account):**
1. ✅ View property on homepage
2. ✅ Buy shares (10 shares = 1 ETH)
3. ✅ Verify shares appear in "Your Shares"

**Test Manager Features (switch to manager wallet):**
1. ✅ Go to property detail page
2. ✅ Deposit rent (e.g., 0.5 ETH)
3. ✅ Verify rent balance updates

**Test Yield Withdrawal:**
1. ✅ Switch back to shareholder wallet
2. ✅ View claimable yield
3. ✅ Withdraw yield
4. ✅ Verify ETH received in wallet

**Test Governance:**
1. ✅ Create proposal
2. ✅ Vote on proposal
3. ✅ Verify vote weight matches shares

---

## Part 6: Deploy to Vercel (Live Production)

### Step 10: Push to GitHub

```bash
# Commit all changes
git add .
git commit -m "Configure for Sepolia testnet deployment"
git push origin main
```

### Step 11: Deploy on Vercel

1. **Go to [Vercel Dashboard](https://vercel.com/)**
2. Click **"Add New Project"**
3. Import `VisionX` repository from GitHub
4. **Configure Project:**
   - **Framework Preset**: Next.js
   - **Root Directory**: `packages/nextjs`
   - **Build Command**: `cd ../.. && yarn workspace @se-2/nextjs build`
   - **Output Directory**: `.next`

5. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add:
     ```
     NEXT_PUBLIC_ALCHEMY_API_KEY = your_alchemy_key
     NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID = 3a8170812b534d0ff9d794f19a901d64
     ```

6. Click **"Deploy"**

### Step 12: Wait for Deployment

- Build takes ~3-5 minutes
- Watch the build logs
- If errors occur, check:
  - ✓ Environment variables are set
  - ✓ Contract address is correct in deployedContracts.ts
  - ✓ All files are committed and pushed

### Step 13: Get Your Live URL

Once deployed:
- Vercel gives you: `https://your-project-name.vercel.app`
- Share this URL for your hackathon demo!

---

## Part 7: Final Testing on Live Site

### Step 14: Test Live Deployment

1. Visit your Vercel URL
2. Connect MetaMask (ensure Sepolia network)
3. Test all features again:
   - ✅ Admin panel (tokenize property)
   - ✅ Buy shares
   - ✅ Deposit rent
   - ✅ Withdraw yield
   - ✅ Governance

---

## 🎥 Recording Your Demo

### Tips for Hackathon Video:

1. **Open Etherscan in tab** to show real transactions
2. **Use separate browsers** for admin vs user accounts
3. **Show wallet balance changes** in real-time
4. **Highlight the problem → solution** narrative

### Demo Script (2 minutes):

**00:00-00:20** - Problem Statement
- "Real estate requires $50K+ minimum"
- "PropShare enables $10 fractional ownership"

**00:20-00:50** - Admin Demo
- Connect wallet
- Tokenize property (100 shares @ 0.1 ETH)
- Show on Etherscan

**00:50-01:20** - Investor Demo
- Switch account
- Buy 10 shares for 1 ETH
- Show shares balance update

**01:20-01:45** - Rent & Yield
- Deposit 0.5 ETH rent
- Withdraw proportional yield
- Show ETH received

**01:45-02:00** - Governance
- Create proposal
- Vote with share weight
- Closing statement

---

## 📊 Troubleshooting

### Contract Deployment Fails

**Error:** "Insufficient funds"
- **Fix:** Get more Sepolia ETH from faucets

**Error:** "Invalid keystore password"
- **Fix:** Re-import account with correct password

### Frontend Shows Wrong Network

**Error:** "Please connect to Sepolia"
- **Fix:** Check scaffold.config.ts has `chains.sepolia`

### Transactions Fail

**Error:** "User rejected transaction"
- **Fix:** Ensure MetaMask is on Sepolia network

**Error:** "Execution reverted"
- **Fix:** Check contract address is correct
- **Fix:** Verify you're using admin/owner wallet for admin functions

### Vercel Build Fails

**Error:** "Module not found"
- **Fix:** Ensure all dependencies are in package.json
- **Fix:** Run `yarn install` locally first

**Error:** "Environment variable undefined"
- **Fix:** Add env vars in Vercel project settings

---

## 🔗 Important Links

- **Sepolia Etherscan**: https://sepolia.etherscan.io/
  - Search your contract: `0xYourContractAddress`
  - Verify all transactions

- **Alchemy Dashboard**: https://dashboard.alchemy.com/
  - Monitor API usage
  - View requests

- **Vercel Dashboard**: https://vercel.com/dashboard
  - Check deployment logs
  - Update env variables

---

## 📝 Post-Deployment Checklist

- [ ] Contract deployed to Sepolia
- [ ] Contract address updated in deployedContracts.ts
- [ ] Frontend tested locally
- [ ] All features work (tokenize, buy, rent, yield, governance)
- [ ] Pushed to GitHub
- [ ] Deployed to Vercel
- [ ] Live site tested
- [ ] Demo video recorded
- [ ] Etherscan links prepared for judges

---

## 🎉 You're Live!

Your PropShare dApp is now:
- ✅ Deployed on Sepolia testnet
- ✅ Live on Vercel
- ✅ Ready for demo
- ✅ Shareable with judges

**Share your live demo:**
- Vercel URL: `https://your-project.vercel.app`
- Contract: `https://sepolia.etherscan.io/address/0xYourContract`
- GitHub: `https://github.com/Aryan10022006/VisionX`

---

## 💡 Optional Enhancements

### Add Contract Verification (Etherscan)

```bash
cd packages/foundry
forge verify-contract \
  --chain sepolia \
  --constructor-args $(cast abi-encode "constructor(address)" "0xYourAddress") \
  0xYourContractAddress \
  contracts/PropShare.sol:PropShare \
  --etherscan-api-key YOUR_ETHERSCAN_API_KEY
```

Benefits:
- ✓ Source code visible on Etherscan
- ✓ Users can read contract directly
- ✓ Increases trust and transparency

---

Good luck with your hackathon! 🚀
