# 🚀 How to Access PropShare Platform

## Quick Start Guide

### 1. Start the Application

```bash
# Terminal 1: Start local blockchain
yarn chain

# Terminal 2: Deploy contracts
yarn deploy

# Terminal 3: Start frontend
yarn start
```

### 2. Connect Your Wallet

1. Open http://localhost:3000
2. Click **"Connect Wallet"** button in top-right corner
3. Select your wallet (MetaMask, Coinbase, etc.)
4. Approve the connection

### 3. Complete Registration (First Time Only)

When you connect for the first time, a **registration modal** will appear:

1. Enter your **Full Name**
2. Enter your **Email Address**
3. Click **"Complete Registration"**
4. ✅ You're now registered!

> **Note:** Registration is stored in browser localStorage (for demo purposes). In production, this would integrate with KYC/AML verification.

---

## 🗺️ Platform Navigation

After registration, you can access all platform features:

### 🏠 **Marketplace** (Home)
- **Path:** `/` or click "Marketplace" in header
- **Features:**
  - Browse available properties
  - View property details
  - Buy property shares
  - Filter and search properties

### 💼 **My Portfolio**
- **Path:** `/portfolio` or click "My Portfolio"
- **Features:**
  - View your property investments
  - See share balances
  - Claim rental yields
  - Track investment performance
  - View transaction history

### ⚖️ **Governance**
- **Path:** `/governance` or click "Governance"
- **Features:**
  - Create proposals for properties you manage
  - Vote on active proposals
  - Execute passed proposals
  - View proposal history

### 🔧 **Admin Panel** (Admin Only)
- **Path:** `/admin` or click "Admin Panel"
- **Visibility:** Only visible to contract owner
- **Features:**
  - Tokenize new properties
  - Manage oracle verifier address
  - Submit verified rent payments
  - Monitor platform activity

---

## 👥 User Roles

### Regular User (Investor)
**Access:** All connected and registered users

**Can:**
- ✅ Browse and buy property shares
- ✅ Claim rental yields
- ✅ Vote on proposals
- ✅ View portfolio
- ❌ Cannot tokenize properties
- ❌ Cannot access admin panel

### Admin (Contract Owner)
**Access:** The wallet address that deployed the contract

**Can:**
- ✅ All regular user features
- ✅ Access Admin Panel
- ✅ Tokenize new properties
- ✅ Set oracle verifier
- ✅ Submit verified rent
- ✅ View special "Admin" badge in navigation

---

## 🔐 How to Become Admin

The **admin** is the wallet address that **deployed the PropShare contract**.

### Check Current Admin:
```bash
# In terminal
cast call <CONTRACT_ADDRESS> "owner()(address)" --rpc-url http://localhost:8545
```

### To Get Admin Access:

**Option 1: Deploy with Your Wallet (Recommended)**
```bash
# Make sure you're using the wallet you want as admin
yarn deploy
```

**Option 2: Transfer Ownership (After Deployment)**
```solidity
// Call this from current owner's wallet
propShare.transferOwnership(newAdminAddress);
```

### Verify Admin Status:
1. Connect with admin wallet
2. Look for **"Admin Panel"** in navigation
3. Should see **"Admin"** badge next to menu item

---

## 🧪 Testing the Platform

### Test as Regular User:
1. Connect with Account #2 from Hardhat (not deployer)
2. Complete registration
3. Buy shares from marketplace
4. Claim yields from portfolio
5. Vote on proposals

### Test as Admin:
1. Connect with Account #1 (deployer)
2. Complete registration
3. Access **Admin Panel**
4. Tokenize a new property
5. Submit verified rent
6. Manage oracle settings

---

## 🐛 Troubleshooting

### Issue: "Registration modal won't close"
**Solution:** You must complete registration to access the platform. Fill in name and email, then click "Complete Registration".

### Issue: "Can't see Admin Panel"
**Solution:** 
- Verify you're connected with the wallet that deployed the contract
- Check contract owner: `yarn hardhat console` → `(await ethers.getContract("PropShare")).owner()`
- Only contract owner sees Admin Panel link

### Issue: "Hydration error in console"
**Solution:** 
- This is a warning from browser extensions (password managers, ad blockers)
- Add `suppressHydrationWarning` to HTML elements (already done)
- Safe to ignore - doesn't affect functionality

### Issue: "Not registered" even after registration
**Solution:**
- Registration uses localStorage - check if browser blocks it
- Try clearing browser cache and re-registering
- Ensure you're on the same wallet address

### Issue: "Transaction fails"
**Solution:**
- Ensure you have enough ETH (get from faucet on localhost)
- Check that local blockchain is running (`yarn chain`)
- Verify contract is deployed (`yarn deploy`)

---

## 📱 Browser Extension Conflicts

Some browser extensions may cause hydration warnings:
- **Password managers** (LastPass, 1Password, Dashlane)
- **Form fillers** (Autofill extensions)
- **Ad blockers** (uBlock, AdBlock)

These are **safe to ignore** - the platform adds `suppressHydrationWarning` to prevent issues.

---

## 🔄 Registration Flow Diagram

```
┌─────────────────────────────────────────┐
│   User Opens PropShare Platform        │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   Is Wallet Connected?                  │
└──────────────┬──────────────────────────┘
               │
        ┌──────┴──────┐
        │             │
       NO            YES
        │             │
        ▼             ▼
   Show Connect   ┌─────────────────────────┐
   Wallet Button  │  Is User Registered?     │
                  └──────────┬───────────────┘
                             │
                      ┌──────┴──────┐
                      │             │
                     NO            YES
                      │             │
                      ▼             ▼
              ┌───────────────┐   ┌─────────────────┐
              │ Show          │   │ Grant Full      │
              │ Registration  │   │ Platform Access │
              │ Modal         │   └─────────────────┘
              └───────┬───────┘
                      │
                      ▼
              ┌───────────────┐
              │ User Submits  │
              │ Name & Email  │
              └───────┬───────┘
                      │
                      ▼
              ┌───────────────┐
              │ Save to       │
              │ localStorage  │
              └───────┬───────┘
                      │
                      ▼
              ┌───────────────┐
              │ Reload Page   │
              │ → Full Access │
              └───────────────┘
```

---

## 📞 Need Help?

If you encounter issues:

1. **Check logs:** Browser console (F12) and terminal output
2. **Verify setup:** Blockchain running, contracts deployed, frontend started
3. **Reset state:** Clear browser localStorage, redeploy contracts
4. **Check wallet:** Correct network (localhost:8545), sufficient ETH balance

---

## 🎯 Quick Feature Summary

| Feature | User Access | Admin Access | Page |
|---------|-------------|--------------|------|
| View Properties | ✅ | ✅ | Marketplace |
| Buy Shares | ✅ | ✅ | Property Details |
| Claim Yields | ✅ | ✅ | Portfolio |
| Vote on Proposals | ✅ | ✅ | Governance |
| Create Proposals | ✅ (if manager) | ✅ | Governance |
| Tokenize Property | ❌ | ✅ | Admin Panel |
| Set Verifier | ❌ | ✅ | Admin Panel |
| Submit Verified Rent | ❌ | ✅ (if verifier) | Admin Panel |

**Legend:** ✅ = Available, ❌ = Not Available

---

Happy investing! 🏡💎
