// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../contracts/PropShare.sol";

contract PropShareTest is Test {
    PropShare public propShare;
    address public owner;
    address public manager;
    address public buyer1;
    address public buyer2;
    address public tenant;

    uint256 constant PROPERTY_ID = 1;
    uint256 constant TOTAL_SHARES = 1000;
    uint256 constant PRICE_PER_SHARE = 0.01 ether;

    function setUp() public {
        owner = address(this);
        manager = vm.addr(1);
        buyer1 = vm.addr(2);
        buyer2 = vm.addr(3);
        tenant = vm.addr(4);

        // Deploy contract
        propShare = new PropShare(owner);

        // Fund test accounts
        vm.deal(buyer1, 100 ether);
        vm.deal(buyer2, 100 ether);
        vm.deal(tenant, 100 ether);
        vm.deal(manager, 100 ether);

        // Create a property
        propShare.tokenizeProperty(
            "Mumbai 1BHK Apartment",
            "ipfs://QmPropertyMetadata",
            TOTAL_SHARES,
            PRICE_PER_SHARE,
            payable(manager)
        );
    }

    function testPropertyCreation() public view {
        PropShare.Property memory prop = propShare.getProperty(PROPERTY_ID);
        assertEq(prop.name, "Mumbai 1BHK Apartment");
        assertEq(prop.totalShares, TOTAL_SHARES);
        assertEq(prop.pricePerShare, PRICE_PER_SHARE);
        assertEq(prop.sharesSold, 0);
        assertEq(prop.rentBalance, 0);
    }

    function testBuyShares() public {
        uint256 sharesToBuy = 50;
        uint256 cost = sharesToBuy * PRICE_PER_SHARE;

        vm.prank(buyer1);
        propShare.buyShares{value: cost}(PROPERTY_ID, sharesToBuy);

        assertEq(propShare.getSharesBalance(PROPERTY_ID, buyer1), sharesToBuy);
        
        PropShare.Property memory prop = propShare.getProperty(PROPERTY_ID);
        assertEq(prop.sharesSold, sharesToBuy);
    }

    function testBuySharesIncorrectPayment() public {
        uint256 sharesToBuy = 50;
        uint256 cost = sharesToBuy * PRICE_PER_SHARE;

        vm.prank(buyer1);
        vm.expectRevert("Incorrect ETH sent");
        propShare.buyShares{value: cost - 0.001 ether}(PROPERTY_ID, sharesToBuy);
    }

    function testDepositRent() public {
        uint256 rentAmount = 1 ether;

        vm.prank(tenant);
        propShare.depositRent{value: rentAmount}(PROPERTY_ID);

        PropShare.Property memory prop = propShare.getProperty(PROPERTY_ID);
        assertEq(prop.rentBalance, rentAmount);
    }

    function testWithdrawYield() public {
        // Buyer1 buys 50 shares (5% of 1000)
        uint256 sharesToBuy = 50;
        uint256 cost = sharesToBuy * PRICE_PER_SHARE;

        vm.prank(buyer1);
        propShare.buyShares{value: cost}(PROPERTY_ID, sharesToBuy);

        // Tenant deposits 1 ETH rent
        uint256 rentAmount = 1 ether;
        vm.prank(tenant);
        propShare.depositRent{value: rentAmount}(PROPERTY_ID);

        // Buyer1 should be able to claim 5% of rent (0.05 ETH)
        uint256 expectedYield = (sharesToBuy * rentAmount) / TOTAL_SHARES;
        uint256 balanceBefore = buyer1.balance;

        vm.prank(buyer1);
        propShare.withdrawYield(PROPERTY_ID);

        uint256 balanceAfter = buyer1.balance;
        assertEq(balanceAfter - balanceBefore, expectedYield);

        // Rent balance should be reduced
        PropShare.Property memory prop = propShare.getProperty(PROPERTY_ID);
        assertEq(prop.rentBalance, rentAmount - expectedYield);
    }

    function testWithdrawYieldMultipleShareholders() public {
        // Buyer1 buys 100 shares (10%)
        vm.prank(buyer1);
        propShare.buyShares{value: 100 * PRICE_PER_SHARE}(PROPERTY_ID, 100);

        // Buyer2 buys 400 shares (40%)
        vm.prank(buyer2);
        propShare.buyShares{value: 400 * PRICE_PER_SHARE}(PROPERTY_ID, 400);

        // Tenant deposits 10 ETH rent
        uint256 rentAmount = 10 ether;
        vm.prank(tenant);
        propShare.depositRent{value: rentAmount}(PROPERTY_ID);

        // Buyer1 claims (should get 1 ETH = 10%)
        uint256 buyer1BalanceBefore = buyer1.balance;
        vm.prank(buyer1);
        propShare.withdrawYield(PROPERTY_ID);
        assertEq(buyer1.balance - buyer1BalanceBefore, 1 ether);

        // Buyer2 claims (should get 4 ETH = 40%)
        uint256 buyer2BalanceBefore = buyer2.balance;
        vm.prank(buyer2);
        propShare.withdrawYield(PROPERTY_ID);
        assertEq(buyer2.balance - buyer2BalanceBefore, 4 ether);
    }

    function testCreateProposal() public {
        // Buyer1 must own shares first
        vm.prank(buyer1);
        propShare.buyShares{value: 50 * PRICE_PER_SHARE}(PROPERTY_ID, 50);

        vm.prank(buyer1);
        propShare.createProposal(PROPERTY_ID, "Renovate the kitchen");

        // Note: Can't easily test the full proposal struct due to nested mapping
        // In production, you'd add getter functions for proposal details
    }

    function testVoteOnProposal() public {
        // Buyer1 and Buyer2 buy shares
        vm.prank(buyer1);
        propShare.buyShares{value: 100 * PRICE_PER_SHARE}(PROPERTY_ID, 100);

        vm.prank(buyer2);
        propShare.buyShares{value: 200 * PRICE_PER_SHARE}(PROPERTY_ID, 200);

        // Buyer1 creates proposal
        vm.prank(buyer1);
        propShare.createProposal(PROPERTY_ID, "Install solar panels");

        // Both vote yes
        vm.prank(buyer1);
        propShare.vote(1, true);

        vm.prank(buyer2);
        propShare.vote(1, true);

        // Verify votes were counted (would need getter in production contract)
    }

    function testCannotWithdrawWithoutShares() public {
        vm.prank(buyer1);
        vm.expectRevert("Not a shareholder");
        propShare.withdrawYield(PROPERTY_ID);
    }

    function testCannotBuyMoreSharesThanAvailable() public {
        uint256 tooManyShares = TOTAL_SHARES + 1;
        uint256 cost = tooManyShares * PRICE_PER_SHARE;

        vm.prank(buyer1);
        vm.expectRevert("Not enough shares left");
        propShare.buyShares{value: cost}(PROPERTY_ID, tooManyShares);
    }

    function testOnlyOwnerCanTokenizeProperty() public {
        vm.prank(buyer1);
        vm.expectRevert();
        propShare.tokenizeProperty(
            "Unauthorized Property",
            "ipfs://unauthorized",
            1000,
            0.01 ether,
            payable(manager)
        );
    }
}
