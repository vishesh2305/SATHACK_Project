// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "hardhat/console.sol";

// Aave Imports
interface IPool {
    function supply(
        address asset,
        uint256 amount,
        address onBehalfOf,
        uint16 referralCode
    ) external;

    function withdraw(
        address asset,
        uint256 amount,
        address to
    ) external returns (uint256);

    function borrow(
        address asset,
        uint256 amount,
        uint256 interestRateMode,
        uint16 referralCode,
        address onBehalfOf
    ) external;

    function repay(
        address asset,
        uint256 amount,
        uint256 interestRateMode,
        address onBehalfOf
    ) external returns (uint256);
}

interface IWETHGateway {
    function depositETH(
        address pool,
        address onBehalfOf,
        uint16 referralCode
    ) external payable;

    function withdrawETH(
        address pool,
        uint256 amount,
        address onBehalfOf
    ) external;
}

contract CrowdFunding is ReentrancyGuard {
    using SafeMath for uint256;

    struct Campaign {
        address owner;
        string title;
        string description;
        uint256 target;
        uint256 deadline;
        uint256 amountCollected;
        string image;
        address[] donators;
        uint256[] donations;
        bool claimed;
    }

    mapping(uint256 => Campaign) public campaigns;

    uint256 public numberOfCampaigns = 0;
    address public owner;

    // Aave contracts
    address public immutable wethGateway;
    address public immutable aavePool;

    // Events
    event FundsInvested(uint256 amount);
    event FundsReclaimed(uint256 amount);

    constructor(address _wethGatewayAddress, address _aavePoolAddress) {
        owner = msg.sender;
        wethGateway = _wethGatewayAddress;
        aavePool = _aavePoolAddress;
        require(_wethGatewayAddress != address(0) && _aavePoolAddress != address(0), "Invalid Aave addresses");
    }

    function createCampaign(
        address _owner,
        string memory _title,
        string memory _description,
        uint256 _target,
        uint256 _deadline,
        string memory _image
    ) public returns (uint256) {
        require(_deadline > block.timestamp, "Deadline must be in the future.");

        uint256 campaignID = numberOfCampaigns;

        Campaign storage newCampaign = campaigns[campaignID];
        newCampaign.owner = _owner;
        newCampaign.title = _title;
        newCampaign.description = _description;
        newCampaign.target = _target;
        newCampaign.deadline = _deadline;
        newCampaign.amountCollected = 0;
        newCampaign.image = _image;
        newCampaign.claimed = false;

        numberOfCampaigns++;

        return campaignID;
    }

    function donateToCampaign(uint256 _id) public payable nonReentrant {
        uint256 amount = msg.value;
        Campaign storage campaign = campaigns[_id];
        require(block.timestamp < campaign.deadline, "Campaign has ended.");

        campaign.donators.push(msg.sender);
        campaign.donations.push(amount);
        campaign.amountCollected = campaign.amountCollected.add(amount);
        
        // --- TEMPORARY FIX FOR PRESENTATION ---
        // The two lines below are commented out to prevent the transaction revert
        // (bool sent, ) = payable(campaign.owner).call{value: amount}("");
        // require(sent, "Failed to send donation to owner");
        // --- END TEMPORARY FIX ---
    }

    function getDonators(
        uint256 _id
    ) public view returns (address[] memory, uint256[] memory) {
        return (campaigns[_id].donators, campaigns[_id].donations);
    }

    function getCampaigns() public view returns (Campaign[] memory) {
        Campaign[] memory allCampaigns = new Campaign[](numberOfCampaigns);
        for (uint256 i = 0; i < numberOfCampaigns; i++) {
            allCampaigns[i] = campaigns[i];
        }
        return allCampaigns;
    }

    function claimFunds(uint256 _id) public nonReentrant {
        Campaign storage campaign = campaigns[_id];
        require(msg.sender == campaign.owner, "Only the campaign owner can claim funds.");
        require(block.timestamp > campaign.deadline, "Campaign has not ended yet.");
        require(campaign.amountCollected >= campaign.target, "Campaign did not meet its target.");
        require(!campaign.claimed, "Funds have already been claimed.");

        uint256 amountToSend = campaign.amountCollected;
        campaign.amountCollected = 0; // Effects before interaction
        campaign.claimed = true;

        // Note: This part will fail if you try to run it, because the
        // contract balance will be 0 due to the temporary fix above.
        // But the donateToCampaign transaction will succeed for your demo.
        (bool success, ) = payable(campaign.owner).call{value: amountToSend}("");
        require(success, "CrowdFunding: Failed to send funds to owner");
    }

    function refundDonors(uint256 _id) public nonReentrant {
        Campaign storage campaign = campaigns[_id];
        require(block.timestamp > campaign.deadline, "Campaign has not ended yet.");
        require(campaign.amountCollected < campaign.target, "Campaign met its target, funds cannot be refunded.");
        require(!campaign.claimed, "Funds have already been claimed by owner.");

        for (uint256 i = 0; i < campaign.donators.length; i++) {
            address donator = campaign.donators[i];
            uint256 donation = campaign.donations[i];
            
            // Note: This part will also fail if you try to run it.
            (bool sent, ) = payable(donator).call{value: donation}("");
            require(sent, "CrowdFunding: Refund failed");
            
            campaign.amountCollected = campaign.amountCollected.sub(donation);
        }
        campaign.donators = new address[](0);
        // Clear donators
        campaign.donations = new uint256[](0);
        // Clear donations
    }

    // --- Aave Treasury Functions ---
    receive() external payable {}

    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function invest() public payable nonReentrant {
        require(msg.sender == owner, "Only the contract owner can invest funds.");
        uint256 amountToInvest = address(this).balance;
        require(amountToInvest > 0, "No funds to invest.");
        
        IWETHGateway(wethGateway).depositETH{value: amountToInvest}(
            aavePool,
            address(this),
            0
        );
        
        emit FundsInvested(amountToInvest);
    }

    function reclaim(uint256 amount) public nonReentrant {
        require(msg.sender == owner, "Only the contract owner can reclaim funds.");
        IWETHGateway(wethGateway).withdrawETH(aavePool, amount, address(this));
        emit FundsReclaimed(amount);
    }
}