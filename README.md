# 🏠 PropShare - Fractional Real Estate Ownership on Blockchain

> **Built for Web3 Impact Hackathon** | Democratizing Real Estate Investment through DeFi

[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blue)](https://soliditylang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![Scaffold-ETH](https://img.shields.io/badge/Scaffold--ETH-2-green)](https://scaffoldeth.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🎯 Problem Statement

Traditional real estate investing faces critical barriers:
- **High Capital Requirements**: Minimum $50,000-$100,000 entry cost
- **Lack of Liquidity**: Years to sell property
- **No Passive Income**: Complex rent collection and distribution
- **Limited Transparency**: Opaque property management

## 💡 Solution

**PropShare** enables fractional property ownership on the blockchain where anyone can:
- 🏠 **Buy Shares** starting from $10 (0.1 ETH)
- 💰 **Earn Yield** automatically from rent payments
- 🗳️ **Vote** on property decisions based on ownership percentage
- 🔄 **Trade Shares** instantly with full liquidity

## ✨ Key Features

### For Investors
- Buy fractional shares in tokenized real estate
- Receive proportional rent yield automatically
- Participate in governance decisions
- Track portfolio in real-time

### For Property Managers
- Tokenize properties with a single transaction
- Deposit rent which distributes automatically
- Engage with shareholder community

### Technical Highlights
- **Smart Contract**: 280 lines of gas-optimized Solidity
- **Professional UI**: Modern fintech-style interface with Tailwind CSS
- **Real-Time Calculations**: Instant cost and yield projections
- **Comprehensive Testing**: 12 unit tests covering all scenarios
- **Type-Safe**: Full TypeScript implementation

## 🚀 Quick Start

### For Testnet Deployment (Sepolia)

**See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete step-by-step guide**

Quick overview:
1. Get Alchemy API key
2. Create `.env.local` with your key
3. Get Sepolia ETH from faucets
4. Deploy: `yarn deploy --network sepolia`
5. Update contract address in `deployedContracts.ts`
6. Push to Vercel for live demo

**Quick Reference**: [QUICKSTART_SEPOLIA.md](./QUICKSTART_SEPOLIA.md)

---

### For Local Development

### Prerequisites
- Node.js 18+ and Yarn
- MetaMask or similar Web3 wallet

### Installation

```bash
# Clone repository
git clone https://github.com/Aryan10022006/VisionX.git
cd visionx

# Install dependencies
yarn install
```

### Running the Demo (3 Simple Steps)

**For Local Development:**

```bash
# Terminal 1: Start local blockchain (Anvil - part of Foundry)
yarn chain

# Terminal 2: Deploy contracts
yarn deploy

# Terminal 3: Start frontend
yarn start
```

**For Testnet (Sepolia):**

```bash
# Already deployed to Sepolia
# Just run frontend
yarn start
# Switch MetaMask to Sepolia network
```

Visit **http://localhost:3000** to see PropShare in action!

### Setup MetaMask for Demo

1. **Connect to Local Network**:
   - Network Name: `Localhost 8545`
   - RPC URL: `http://localhost:8545`
   - Chain ID: `31337`
   - Currency: `ETH`

2. **Import Test Accounts** (each has 10,000 ETH):
   ```
   Admin Account (Contract Owner):
   Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
   Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   
   Demo Investor Account #1:
   Address: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
   Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
   
   Demo Investor Account #2:
   Address: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
   Private Key: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
   ```

3. **Check Account Balances**:
   ```bash
   cd packages/foundry
   yarn demo:accounts
   ```

### 🎯 About the Blockchain Stack

**We use Foundry** - a fast, modern Ethereum development framework:
- **Anvil**: Local blockchain (like Hardhat Network but faster)
- **Forge**: Smart contract compilation and testing
- **Cast**: Command-line tool for blockchain interaction

**Why you see "anvil-hardhat" in logs**: Anvil is compatible with Hardhat's configuration and uses the same default test accounts (0xf39Fd..., 0x7099..., etc.). This is intentional for better tooling compatibility.

**Our Smart Contracts**: 100% Foundry (Solidity 0.8.20)
**Our Tests**: 100% Foundry (12 comprehensive test suites)
**Local Network**: Anvil (from Foundry toolkit)

Visit **http://localhost:3000** to see PropShare in action!

## 📱 User Interface

### Hero Section
Clean, professional design with clear value proposition

### Property Display
- Two-column layout with property image
- Real-time stats: shares sold, price per share, rent balance
- User's personal holdings displayed

### Tabbed Interface
**Buy Shares Tab**:
- Input desired number of shares
- Real-time total cost calculation
- One-click purchase

**Rent & Yield Tab**:
- Deposit rent (property manager only)
- View claimable yield based on ownership
- Withdraw earnings instantly

### Collapsible Sections
- **Governance**: Create and vote on proposals
- **Admin**: Tokenize new properties (owner only)

## 🏗️ Architecture

### Smart Contract (`PropShare.sol`)

```solidity
// Core Functions
function tokenizeProperty(...) external onlyOwner
function buyShares(propertyId, amount) external payable
function depositRent(propertyId) external payable
function withdrawYield(propertyId) external
function createProposal(propertyId, description) external
function vote(proposalId, voteYes) external
```

**Key Data Structures**:
- `Property`: id, name, URI, shares, price, rent balance, manager
- `Proposal`: id, property, description, votes, executed, creator

### Frontend Stack
- **Framework**: Next.js 15 with App Router
- **Web3**: Wagmi 2.x + Viem 2.x + RainbowKit
- **Styling**: TailwindCSS 4.x + DaisyUI 5.x
- **Icons**: Heroicons 2.x
- **Type Safety**: TypeScript with strict mode

## 🧪 Testing

```bash
cd packages/foundry
forge test -vvv
```

**Test Coverage** (12 tests):
- ✅ Property tokenization
- ✅ Share purchasing (success & edge cases)
- ✅ Rent deposit and access control
- ✅ Yield withdrawal (single & multiple shareholders)
- ✅ Governance proposal creation and voting
- ✅ Permission checks

## 📊 Demo Flow

1. **Connect Wallet**: Connect MetaMask to localhost network
2. **View Property**: See "Sunset Villa" with 100 shares at 0.1 ETH each
3. **Buy Shares**: Purchase 10 shares for 1 ETH total
4. **Deposit Rent** (as manager): Add 2 ETH rent to property
5. **Claim Yield**: Withdraw proportional share (10/100 × 2 ETH = 0.2 ETH)
6. **Create Proposal**: Suggest property improvement
7. **Vote**: Cast vote weighted by share ownership

## 🎥 Video Demo

[Link to 2-minute demo video]

## 💼 Business Model

### Revenue Streams
1. **Transaction Fees**: 1-2% on each share purchase
2. **Management Fees**: Annual fee on property value
3. **Premium Features**: Advanced analytics, priority access

### Market Opportunity
- Global real estate: $280 trillion market
- Fractional ownership: $10 billion growing at 35% CAGR
- DeFi adoption: 40% year-over-year growth

## 🔒 Security

- OpenZeppelin Ownable for access control
- Reentrancy protection on withdrawal functions
- Comprehensive input validation
- Tested extensively with Foundry

## 🗺️ Roadmap

### Phase 1 (Post-Hackathon)
- Deploy to Polygon/Arbitrum testnet
- Multi-property selector UI
- Secondary marketplace integration

### Phase 2 (Month 1-2)
- Smart contract audit
- KYC/AML integration
- Mobile app (React Native)

### Phase 3 (Month 3-6)
- Mainnet launch
- Partner with real estate agencies
- Launch PROP governance token
- Insurance integration

## 👥 Team

- **Developer**: [Your Name] - Full-stack blockchain developer
- **Advisors**: [Names if applicable]

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

## 🤝 Contributing

Contributions welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

## 📧 Contact

- GitHub: [@yourusername](https://github.com/yourusername)
- Twitter: [@yourhandle](https://twitter.com/yourhandle)
- Email: your.email@example.com

## 🏆 Acknowledgments

- Built with [Scaffold-ETH 2](https://scaffoldeth.io/)
- OpenZeppelin for secure smart contract libraries
- Hackathon organizers for the opportunity

---

**⭐ Star this repo if you find it interesting!**

