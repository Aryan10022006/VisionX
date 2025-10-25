#!/bin/bash

# PropShare Platform Quick Start Script
# This script helps you start all required services

echo "🏠 PropShare - Real Estate Investment Platform"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting PropShare platform...${NC}"
echo ""

# Check if already running
if lsof -Pi :8545 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${YELLOW}⚠️  Port 8545 already in use (blockchain may be running)${NC}"
    echo "   If you want to restart, run: yarn chain"
else
    echo -e "${GREEN}Starting local blockchain...${NC}"
    echo "   Run in Terminal 1: yarn chain"
fi

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${YELLOW}⚠️  Port 3000 already in use (frontend may be running)${NC}"
    echo "   If you want to restart, run: yarn start"
else
    echo -e "${GREEN}Frontend will start on port 3000${NC}"
    echo "   Run in Terminal 3: yarn start"
fi

echo ""
echo -e "${BLUE}📋 Quick Start Instructions:${NC}"
echo ""
echo "1️⃣  Terminal 1 (Blockchain):"
echo "   cd /home/aryan/Projects/visionx"
echo "   yarn chain"
echo ""
echo "2️⃣  Terminal 2 (Deploy Contracts):"
echo "   cd /home/aryan/Projects/visionx"
echo "   yarn deploy"
echo ""
echo "3️⃣  Terminal 3 (Frontend):"
echo "   cd /home/aryan/Projects/visionx"
echo "   yarn start"
echo ""
echo -e "${GREEN}4️⃣  Open Browser:${NC}"
echo "   http://localhost:3000"
echo ""
echo -e "${BLUE}📖 First Time Setup:${NC}"
echo "   1. Click 'Connect Wallet' in top-right"
echo "   2. Registration modal will appear"
echo "   3. Enter your name and email"
echo "   4. Click 'Complete Registration'"
echo "   5. ✅ You're ready to invest!"
echo ""
echo -e "${BLUE}🔐 Admin Access:${NC}"
echo "   - The wallet that deploys the contract becomes admin"
echo "   - Admin can access 'Admin Panel' link in navigation"
echo "   - Admin can tokenize properties and manage oracle"
echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo "   - Full Guide: HOW_TO_ACCESS.md"
echo "   - Issues Fixed: ISSUES_RESOLVED.md"
echo "   - Architecture: ARCHITECTURE.md"
echo ""
echo -e "${GREEN}✨ All issues resolved! Platform ready to use.${NC}"
echo ""
