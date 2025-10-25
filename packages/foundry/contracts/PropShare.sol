// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

// Correct import paths for Scaffold-Eth Foundry
import "forge-std/console.sol";
import "openzeppelin-contracts/contracts/access/Ownable.sol";

/**
 * @title PropShare - Trust-Minimized Fractional Real Estate Ownership
 * @author Built for Web3 Impact Hackathon - Security-Hardened Version  
 * @notice Enables fractional ownership with oracle verification and escrow protection
 * @dev Fixes: 1) Oracle-verified rent deposits 2) Escrow protection for investors
 */
contract PropShare is Ownable {
    // === STATE VARIABLES ===
    
    address public verifier; // Oracle role for rent verification
    
    // === STRUCTS ===

    struct Property {
        uint256 id;
        string name;
        string propertyURI; // Link to metadata (image, location, etc.)
        uint256 totalShares;
        uint256 sharesSold;
        uint256 pricePerShare; // In WEI
        uint256 rentBalance; // Accumulated rent in WEI
        address payable manager; // The entity managing the physical property
        uint256 fundsRaised; // Escrow for share purchases
        bool isFunded; // True when property is fully funded
    }

    struct Proposal {
        uint256 id;
        uint256 propertyId;
        string description;
        uint256 deadline; // Voting deadline
        uint256 yesVotes;
        uint256 noVotes;
        bool executed;
        address creator;
    }

    // === MAPPINGS ===

    // Property Management
    uint256 private _nextPropertyId;
    mapping(uint256 => Property) public properties;
    // propertyId => userAddress => shareAmount
    mapping(uint256 => mapping(address => uint256)) public sharesBalance;

    // Governance
    uint256 private _nextProposalId;
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted; // proposalId => voter => voted
    
    // Oracle Verification
    mapping(uint256 => uint256) public verifiedRentOwed; // propertyId => verified rent amount

    // === EVENTS ===

    event PropertyTokenized(
        uint256 indexed propertyId,
        string name,
        uint256 totalShares,
        uint256 pricePerShare
    );
    event SharesPurchased(
        uint256 indexed propertyId,
        address indexed buyer,
        uint256 amount,
        uint256 cost
    );
    event RentDeposited(
        uint256 indexed propertyId,
        address indexed depositor,
        uint256 amount
    );
    event YieldWithdrawn(
        uint256 indexed propertyId,
        address indexed owner,
        uint256 amount
    );
    event ProposalCreated(
        uint256 indexed proposalId,
        uint256 indexed propertyId,
        string description
    );
    event Voted(
        uint256 indexed proposalId,
        address indexed voter,
        bool voteYes,
        uint256 votingPower
    );
    event RentVerified(uint256 indexed propertyId, uint256 amount);
    event PropertyFunded(uint256 indexed propertyId);
    event ManagerWithdrewFunds(uint256 indexed propertyId, uint256 amount);
    event VerifierChanged(address indexed oldVerifier, address indexed newVerifier);
    event ProposalExecuted(uint256 indexed proposalId);

    // === CONSTRUCTOR ===

    constructor(address initialOwner) Ownable(initialOwner) {
        _nextPropertyId = 1;
        _nextProposalId = 1;
        verifier = initialOwner; // Set deployer as initial verifier (oracle)
        console.log("PropShare deployed - Trust-Minimized Version");
        console.log("Initial verifier:", initialOwner);
    }

    // === ORACLE/VERIFIER FUNCTIONS ===
    
    /**
     * @notice Change the verifier address (oracle)
     * @dev In production, this would be a Chainlink oracle contract
     */
    function setVerifier(address _newVerifier) external onlyOwner {
        require(_newVerifier != address(0), "Invalid verifier address");
        address oldVerifier = verifier;
        verifier = _newVerifier;
        emit VerifierChanged(oldVerifier, _newVerifier);
    }
    
    /**
     * @notice Oracle submits verified rent amount (simulates Chainlink oracle)
     * @dev SECURITY FIX #1: Manager can't lie about rent collected
     * In production, this would be called by a decentralized oracle network
     * that verifies rent from bank APIs, property management software, etc.
     */
    function submitVerifiedRent(uint256 _propertyId, uint256 _amount) external {
        require(msg.sender == verifier, "Only verifier can submit");
        require(properties[_propertyId].id != 0, "Property does not exist");
        
        verifiedRentOwed[_propertyId] = _amount;
        emit RentVerified(_propertyId, _amount);
    }

    // === ADMIN FUNCTIONS ===

    /**
     * @notice Admin function to list a new property for fractionalization.
     */
    function tokenizeProperty(
        string calldata _name,
        string calldata _propertyURI,
        uint256 _totalShares,
        uint256 _pricePerShare, // e.g., 10000000000000000 WEI (0.01 ETH)
        address payable _manager
    ) external onlyOwner {
        require(_totalShares > 0, "Must have shares");
        require(_pricePerShare > 0, "Price must be > 0");
        require(_manager != address(0), "Invalid manager");

        uint256 propertyId = _nextPropertyId++;
        properties[propertyId] = Property({
            id: propertyId,
            name: _name,
            propertyURI: _propertyURI,
            totalShares: _totalShares,
            sharesSold: 0,
            pricePerShare: _pricePerShare,
            rentBalance: 0,
            manager: _manager,
            fundsRaised: 0,
            isFunded: false
        });

        emit PropertyTokenized(
            propertyId,
            _name,
            _totalShares,
            _pricePerShare
        );
    }

    // === USER INVESTMENT FUNCTIONS ===

    /**
     * @notice Buy shares in a property (ESCROW PROTECTION)
     * @dev SECURITY FIX #2: Funds held in escrow until property fully funded
     * Prevents manager from running away with 50% funding
     */
    function buyShares(uint256 _propertyId, uint256 _amount) external payable {
        Property storage prop = properties[_propertyId];
        require(prop.id != 0, "Property does not exist");
        require(!prop.isFunded, "Property already fully funded");
        require(_amount > 0, "Must buy at least 1 share");
        require(
            prop.sharesSold + _amount <= prop.totalShares,
            "Exceeds available shares"
        );

        uint256 cost = _amount * prop.pricePerShare;
        require(msg.value == cost, "Incorrect payment");

        // Update balances
        sharesBalance[_propertyId][msg.sender] += _amount;
        prop.sharesSold += _amount;
        
        // SECURITY: Add funds to ESCROW instead of sending directly to manager
        prop.fundsRaised += cost;

        // Check if property is now fully funded
        if (prop.sharesSold == prop.totalShares) {
            prop.isFunded = true;
            emit PropertyFunded(_propertyId);
        }

        emit SharesPurchased(_propertyId, msg.sender, _amount, cost);
    }
    
    /**
     * @notice Manager withdraws funds ONLY after property is fully funded
     * @dev ESCROW RELEASE: Protects investors from partial funding scams
     */
    function managerWithdrawFunds(uint256 _propertyId) external {
        Property storage prop = properties[_propertyId];
        require(msg.sender == prop.manager, "Only manager can withdraw");
        require(prop.isFunded, "Property not fully funded yet");
        require(prop.fundsRaised > 0, "Funds already withdrawn");
        
        uint256 amount = prop.fundsRaised;
        prop.fundsRaised = 0; // Prevent re-entrancy
        
        (bool success, ) = prop.manager.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit ManagerWithdrewFunds(_propertyId, amount);
    }

    // === RENT & YIELD FUNCTIONS ===

    /**
     * @notice Property manager deposits VERIFIED rent (oracle-verified amount)
     * @dev SECURITY FIX #1: Manager MUST deposit exact verified amount
     * Prevents manager from collecting $1000 but only depositing $500
     */
    function depositRent(uint256 _propertyId) external payable {
        Property storage prop = properties[_propertyId];
        require(prop.id != 0, "Property does not exist");
        require(msg.sender == prop.manager, "Only manager can deposit");
        
        // SECURITY: Get oracle-verified rent amount
        uint256 rentOwed = verifiedRentOwed[_propertyId];
        require(rentOwed > 0, "Rent not yet verified by oracle");
        require(msg.value == rentOwed, "Must match verified amount exactly");

        prop.rentBalance += msg.value;
        
        // SECURITY: Reset verified amount to prevent replay attacks
        verifiedRentOwed[_propertyId] = 0;
        
        emit RentDeposited(_propertyId, msg.sender, msg.value);
    }

    /**
     * @notice Shareholder function to withdraw their portion of the rent.
     */
    function withdrawYield(uint256 _propertyId) external {
        Property storage prop = properties[_propertyId];
        uint256 userShares = sharesBalance[_propertyId][msg.sender];
        require(userShares > 0, "Not a shareholder");

        uint256 totalRent = prop.rentBalance;
        require(totalRent > 0, "No rent to withdraw");

        // Calculate user's claimable yield: (userShares * totalRent) / totalShares
        uint256 claimable = (userShares * totalRent) / prop.totalShares;
        require(claimable > 0, "No yield to claim");

        // Update rent balance *before* sending ETH (checks-effects-interactions)
        prop.rentBalance -= claimable;

        // Send yield
        (bool success, ) = msg.sender.call{value: claimable}("");
        require(success, "Yield withdrawal failed");

        emit YieldWithdrawn(_propertyId, msg.sender, claimable);
    }

    // === GOVERNANCE FUNCTIONS ===

    /**
     * @notice Shareholder function to create a new governance proposal.
     */
    function createProposal(uint256 _propertyId, string calldata _description)
        external
    {
        require(
            sharesBalance[_propertyId][msg.sender] > 0,
            "Only shareholders can create proposals"
        );

        uint256 proposalId = _nextProposalId++;
        proposals[proposalId] = Proposal({
            id: proposalId,
            propertyId: _propertyId,
            description: _description,
            deadline: block.timestamp + 3 days,
            yesVotes: 0,
            noVotes: 0,
            executed: false,
            creator: msg.sender
        });

        emit ProposalCreated(proposalId, _propertyId, _description);
    }

    /**
     * @notice Shareholder function to vote on a proposal.
     * @dev Voting power is proportional to share count (1 share = 1 vote)
     */
    function vote(uint256 _proposalId, bool _voteYes) external {
        Proposal storage p = proposals[_proposalId];
        require(p.id != 0, "Proposal not found");
        require(block.timestamp < p.deadline, "Voting period ended");
        require(!p.executed, "Proposal already executed");
        require(!hasVoted[_proposalId][msg.sender], "Already voted");

        uint256 votingPower = sharesBalance[p.propertyId][msg.sender];
        require(votingPower > 0, "Not a shareholder");

        hasVoted[_proposalId][msg.sender] = true;

        if (_voteYes) {
            p.yesVotes += votingPower;
        } else {
            p.noVotes += votingPower;
        }

        emit Voted(_proposalId, msg.sender, _voteYes, votingPower);
    }
    
    /**
     * @notice Execute a passed proposal (AUTONOMOUS DAO)
     * @dev Shows complete governance loop - proposal → vote → execute
     * This is what makes it a "real" DAO, not just voting for show
     */
    function executeProposal(uint256 _proposalId) external {
        Proposal storage p = proposals[_proposalId];
        require(p.id != 0, "Proposal not found");
        require(!p.executed, "Already executed");
        require(block.timestamp >= p.deadline, "Voting still active");
        require(p.yesVotes > p.noVotes, "Proposal did not pass");
        
        // Mark as executed
        p.executed = true;
        
        // DEMO: In production, you'd parse proposal type and execute actions
        // Examples: Change manager, adjust rent price, approve renovation budget
        // For hackathon: just showing the governance mechanism works
        
        emit ProposalExecuted(_proposalId);
    }

    // === VIEW FUNCTIONS ===

    function getProperty(uint256 _propertyId)
        external
        view
        returns (Property memory)
    {
        return properties[_propertyId];
    }

    function getProposal(uint256 _proposalId)
        external
        view
        returns (
            uint256 id,
            uint256 propertyId,
            string memory description,
            uint256 deadline,
            uint256 yesVotes,
            uint256 noVotes,
            bool executed,
            address creator
        )
    {
        Proposal storage p = proposals[_proposalId];
        return (
            p.id,
            p.propertyId,
            p.description,
            p.deadline,
            p.yesVotes,
            p.noVotes,
            p.executed,
            p.creator
        );
    }

    /**
     * @notice Helper to get user's share balance.
     */
    function getSharesBalance(uint256 _propertyId, address _user)
        external
        view
        returns (uint256)
    {
        return sharesBalance[_propertyId][_user];
    }
    
    /**
     * @notice Get next property ID (useful for frontend)
     */
    function getNextPropertyId() external view returns (uint256) {
        return _nextPropertyId;
    }
    
    /**
     * @notice Get next proposal ID (useful for frontend)
     */
    function getNextProposalId() external view returns (uint256) {
        return _nextProposalId;
    }
}
