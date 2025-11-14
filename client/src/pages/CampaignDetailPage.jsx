// src/pages/CampaignDetailPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
    LoaderCircle, 
    XCircle, 
    ShieldCheck, 
    DollarSign, 
    Users,
    ArrowLeft,
    Zap, // For Updates
    TrendingUp, // For Financials
    Info,
    Trophy, // For Leaderboard
    CheckCircle,
    Clock,
    UserCheck,
} from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import ProgressBar from '../components/common/ProgressBar';
import { getCampaignById } from '../data/mockData';
import { useNotification } from '../contexts/NotificationProvider';
import { daysLeft } from '../utils';
import { useUser } from '../contexts/UserProvider';

// --- STYLING CONSTANTS ---
const BOLD_TEXT = "font-extrabold text-gray-900 dark:text-white drop-shadow-md";
const SUBTLE_TEXT = "text-gray-600 dark:text-gray-400";
const ACCENT_COLOR = "text-blue-600 dark:text-blue-400 drop-shadow-md";

// NEW AESTHETIC CARD CLASSES (Subtle light mode, Glowy dark mode)
const AESTHETIC_CARD_CLASSES = "!bg-white/70 dark:!bg-gray-900/30 backdrop-blur-xl border border-gray-300/80 dark:border-blue-700/50 shadow-xl dark:shadow-2xl dark:shadow-blue-900/50 transition-all duration-300 hover:shadow-2xl";


// --- HELPER COMPONENTS FOR MASTERPIECE DESIGN ---

// Trust & Safety Component (Sidebar)
const TrustCard = ({ checks }) => (
    <Card className={`p-6 ${AESTHETIC_CARD_CLASSES}`}>
        <h4 className={`font-extrabold text-xl mb-4 flex items-center text-green-600 dark:text-green-400 drop-shadow-md`}>
            <ShieldCheck className='h-6 w-6 mr-2 text-green-600 dark:text-green-400'/> TRUST & ACCOUNTABILITY
        </h4>
        <ul className="space-y-3 text-sm">
            {checks.map((item, index) => (
                <li key={index} className="flex justify-between items-center text-gray-900 dark:text-gray-300">
                    <span className='font-semibold'>{item.check}</span>
                    <span className="font-extrabold text-green-600 dark:text-green-500 drop-shadow-sm">
                        {item.status}
                    </span>
                </li>
            ))}
        </ul>
        <p className={`mt-4 text-xs ${SUBTLE_TEXT}`}>
            All verification steps completed on the blockchain.
        </p>
    </Card>
);

// --- DYNAMIC TIMELINE COMPONENT (Tab Content) ---
const UpdatesTimeline = ({ updates, target, amountCollected, deadline }) => {
    const fundingPercentage = (parseFloat(amountCollected) / parseFloat(target)) * 100;
    const isExpired = daysLeft(deadline) <= 0;
    const now = new Date();
    // Set a fixed start date based on the deadline for consistent mock data
    const startDate = new Date(new Date(deadline).getTime() - (90 * 24 * 60 * 60 * 1000)); 

    const dynamicMilestones = [
        { 
            date: new Date(startDate.getTime() + (7 * 24 * 60 * 60 * 1000)).toISOString().slice(0, 10),
            title: "Contract Deployed & Identity Verified",
            description: "The campaign's smart contract is live and basic verification checks passed, commencing fundraising.",
            status: 'success',
            type: 'system',
            progressNeeded: 0,
        },
        {
            date: now.toISOString().slice(0, 10),
            title: "Funding Reached 25% Threshold",
            description: `We hit the ${((parseFloat(target) * 0.25)).toFixed(2)} ETH mark. Funds are now earning yield in Aave protocol.`,
            status: fundingPercentage >= 25 ? 'success' : 'pending',
            type: 'system',
            progressNeeded: 25,
        },
        {
            date: now.toISOString().slice(0, 10),
            title: "Mid-Campaign Checkpoint (50%)",
            description: `Reaching half the target means we are on track for major procurement. Funds locked until 50% is reached.`,
            status: fundingPercentage >= 50 ? 'success' : 'pending',
            type: 'system',
            progressNeeded: 50,
        },
        {
            date: new Date(deadline).toISOString().slice(0, 10),
            title: isExpired && fundingPercentage < 100 ? "Deadline Expired - Funds Returning" : "Goal Reached / Project Finalized",
            description: isExpired && fundingPercentage < 100 ? 
                "The campaign ended without reaching the full target. Funds will be returned to donors (minus transaction fees)." : 
                "The project successfully completed its funding goal! Fund disbursement will be authorized.",
            status: fundingPercentage >= 100 ? 'success' : isExpired ? 'error' : 'pending',
            type: 'system',
            progressNeeded: 100,
        }
    ].filter(m => m.progressNeeded === 0 || (m.progressNeeded > 0 && fundingPercentage >= m.progressNeeded) || (m.progressNeeded >= 100)); // Show achieved milestones

    const combinedTimeline = [
        ...(updates.map(u => ({ ...u, type: 'creator' }))),
        ...dynamicMilestones,
    ].sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort all items by date

    const uniqueTimeline = combinedTimeline.reduce((acc, current) => {
        const x = acc.find(item => item.title === current.title && item.date === current.date);
        if (!x) {
            return acc.concat([current]);
        }
        return acc;
    }, []);

    return (
        <div className="relative border-l-4 border-gray-500 dark:border-blue-700 ml-4 pl-8">
            {uniqueTimeline.length === 0 && <p className='text-gray-500 dark:text-gray-400'>No updates or progress points to display.</p>}
            {uniqueTimeline.map((item, index) => {
                const isSystem = item.type === 'system';
                
                let dotColor = 'bg-gray-500';
                let ringColor = 'ring-white dark:ring-gray-800';
                let icon = isSystem ? Clock : Zap;

                if (item.status === 'success') {
                    dotColor = 'bg-green-600';
                    ringColor = 'ring-white dark:ring-green-900';
                    icon = CheckCircle;
                } else if (item.status === 'error') {
                    dotColor = 'bg-red-600';
                    ringColor = 'ring-white dark:ring-red-900';
                    icon = XCircle;
                } else if (item.status === 'pending') {
                     dotColor = 'bg-blue-600';
                     ringColor = 'ring-white dark:ring-blue-900';
                     icon = Clock;
                }

                return (
                    <div key={item.id + item.type + index} className="mb-8 relative">
                        {/* Timeline Dot with Icon */}
                        <div className={`absolute -left-5 top-0 h-8 w-8 rounded-full ${dotColor} ring-4 ${ringColor} shadow-md flex items-center justify-center`}>
                            {React.createElement(icon, { className: 'h-4 w-4 text-white' })}
                        </div>
                        
                        <h3 className={`font-extrabold text-lg text-gray-900 dark:text-white mb-1 ${isSystem ? 'text-purple-600 drop-shadow-md' : ''}`}>
                            {item.title}
                        </h3>
                        <p className={`text-xs ${SUBTLE_TEXT} mb-3`}>
                            {new Date(item.date).toLocaleDateString()}
                            {isSystem && item.progressNeeded > 0 && ` - (${item.progressNeeded}%)`}
                        </p>
                        <p className="text-gray-900 dark:text-gray-300">
                            {item.description}
                        </p>
                        {item.status === 'pending' && <span className="text-xs font-semibold text-blue-600 dark:text-blue-500 mt-2 block">Awaiting completion or funding threshold.</span>}
                    </div>
                );
            })}
        </div>
    );
};

// Funding Breakdown (Mock Chart Display - Tab Content)
const FundingBreakdown = ({ breakdown, fundingGoal }) => {
    const totalGoal = parseFloat(fundingGoal);
    if (isNaN(totalGoal) || totalGoal <= 0) return null;

    return (
        <div className="space-y-6">
            <h3 className={`font-extrabold text-2xl border-b dark:border-gray-700 pb-2 ${BOLD_TEXT}`}>FUNDING ALLOCATION</h3>
            
            {/* Simple Mock Donut Chart (Proportional Bars) */}
            <div className="flex w-full h-8 rounded-full overflow-hidden shadow-inner border border-gray-400 dark:border-none">
                {breakdown.map((item, index) => (
                    <div
                        key={index}
                        className="h-full transition-all duration-500"
                        style={{ 
                            width: `${item.percentage}%`,
                            backgroundColor: item.color,
                        }}
                        title={`${item.label}: ${item.amount.toFixed(2)} ETH (${item.percentage}%)`}
                    />
                ))}
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* AESTHETIC CHANGE: Translucent Legend Items */}
                {breakdown.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 bg-gray-100/70 dark:bg-gray-800/70 rounded-lg border border-gray-400/50 dark:border-gray-700/50">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <div>
                            <p className={`text-sm font-extrabold ${BOLD_TEXT}`}>{item.label}</p>
                            <p className={`text-xs ${SUBTLE_TEXT}`}>{item.amount.toFixed(2)} ETH ({item.percentage}%)</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- DONORS LEADERBOARD COMPONENT ---
const DonorsLeaderboard = ({ donations }) => {
    // 1. Sort donations in decreasing order by amount
    const sortedDonations = [...donations].sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));

    return (
        <div className="mt-8">
            <h3 className={`font-extrabold text-2xl mb-4 border-b dark:border-gray-700 pb-2 ${BOLD_TEXT} flex items-center`}>
                <Trophy className="h-6 w-6 mr-2 text-yellow-500 drop-shadow-md" />
                TOP CONTRIBUTORS LEADERBOARD
            </h3>
            <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
                {sortedDonations.map((donation, index) => {
                    const rank = index + 1;
                    const isTop3 = rank <= 3;
                    const rankColor = rank === 1 ? 'text-yellow-500 drop-shadow-md' : rank === 2 ? 'text-gray-600 drop-shadow-md' : rank === 3 ? 'text-orange-500 drop-shadow-md' : 'text-gray-600 dark:text-gray-400';

                    return (
                        // AESTHETIC CHANGE: Bold, translucent rows for leaderboard
                        <div 
                            key={index} 
                            className={`flex justify-between items-center p-3 rounded-lg transition-all duration-300 hover:shadow-lg 
                                ${isTop3 ? 'bg-blue-50/70 dark:bg-blue-900/40 shadow-md border-l-4 border-blue-600/80' : 'bg-gray-100/70 dark:bg-gray-800/70'} 
                                border border-gray-400/50 dark:border-gray-700/50`}
                        >
                            <div className="flex items-center space-x-4">
                                <span className={`w-6 text-center font-extrabold text-lg ${rankColor}`}>
                                    {rank === 1 ? <Trophy className='h-5 w-5 inline-block'/> : rank}
                                </span>
                                <span className={`font-mono text-sm ${BOLD_TEXT}`}>
                                    {truncateAddress(donation.donator)}
                                </span>
                            </div>
                            <span className={`font-extrabold text-lg ${ACCENT_COLOR}`}>
                                {donation.amount} ETH
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Helper to truncate wallet address (defined in data but copied here for robustness)
const truncateAddress = (address) => {
    if (!address) return 'N/A';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

// --- MAIN CAMPAIGN DETAIL PAGE COMPONENT (THE MASTERPIECE) ---

const CampaignDetailPage = () => {
    const { id } = useParams(); // <-- This gets the ID from the URL
    const [campaign, setCampaign] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('story');
    const { showNotification } = useNotification();
    const { isAuthenticated, currentUser } = useUser();

    const tabClasses = useCallback((tabName) => `py-3 px-4 font-extrabold border-b-2 transition-colors ${
        activeTab === tabName 
        ? 'border-blue-600 text-blue-600 dark:text-blue-400 drop-shadow-md' 
        : 'border-transparent text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
    }`, [activeTab]);


    useEffect(() => {
        // This function now exclusively uses the mock data helper
        setIsLoading(true);
        setError(null);
        
        setTimeout(() => {
            // getCampaignById uses the 'id' from the URL to find the correct campaign
            const mockCampaign = getCampaignById(id); 
            
            if (mockCampaign) {
                // Calculate funding breakdown ETH amounts here
                const goal = parseFloat(mockCampaign.target);
                if (!isNaN(goal) && goal > 0 && mockCampaign.fundingBreakdown) {
                    mockCampaign.fundingBreakdown = mockCampaign.fundingBreakdown.map(item => ({
                        ...item,
                        amount: (item.percentage / 100) * goal,
                    }));
                }
                
                setCampaign(mockCampaign);
            } else {
                setError(`Campaign with ID ${id} not found.`);
            }
            setIsLoading(false);
        }, 500); // Simulated network delay
    }, [id]); // This useEffect re-runs whenever the 'id' in the URL changes

    const handleDonate = () => {
        if (!isAuthenticated) {
            showNotification("Please sign in to make a donation.", "info");
            return;
        }
        
        // --- REPLACED BROWSER PROMPT WITH MOCK FLOW ---
        const mockDonationAmount = "0.05"; 
        
        // Simulate an amount check (which would normally happen in a custom modal)
        if (parseFloat(mockDonationAmount) <= 0) {
             showNotification("Donation amount must be greater than zero.", "error");
             return;
        }

        // 1. Simulate transaction start
        showNotification(`Preparing transaction for ${mockDonationAmount} ETH...`, "info");
        
        // 2. Simulate success after a slight delay
        setTimeout(() => {
            showNotification(`Donation of ${mockDonationAmount} ETH successful! Thank you for your contribution.`, 'success');
        }, 1000);
        // --- END MOCK FLOW ---
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'story':
                return (
                    <div className="space-y-8">
                        <h2 className="font-extrabold text-2xl mb-4 border-b dark:border-gray-700 pb-2 text-gray-900 dark:text-white flex items-center">
                            <Info className="h-6 w-6 mr-2 text-blue-600 dark:text-blue-400 drop-shadow-md" />
                            THE PROJECT STORY
                        </h2>
                        <p className="text-lg text-gray-900 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                            {campaign.fullDescription}
                        </p>
                    </div>
                );
            case 'updates':
                return (
                    <div className="space-y-8">
                        <h2 className="font-extrabold text-2xl mb-6 border-b dark:border-gray-700 pb-2 text-gray-900 dark:text-white flex items-center">
                            <Zap className="h-6 w-6 mr-2 text-yellow-600 dark:text-yellow-400 drop-shadow-md" />
                            UPDATES & MILESTONES
                        </h2>
                        {/* DYNAMIC TIMELINE: Uses updates and calculated progress */}
                        <UpdatesTimeline 
                            updates={campaign.updates} 
                            target={campaign.target} 
                            amountCollected={campaign.amountCollected}
                            deadline={campaign.deadline}
                        />
                    </div>
                );
            case 'financials':
                return (
                    <div className="space-y-8">
                        <h2 className="font-extrabold text-2xl mb-6 border-b dark:border-gray-700 pb-2 text-gray-900 dark:text-white flex items-center">
                            <TrendingUp className="h-6 w-6 mr-2 text-green-600 dark:text-green-400 drop-shadow-md" />
                            FINANCIAL TRANSPARENCY
                        </h2>
                        <FundingBreakdown breakdown={campaign.fundingBreakdown} fundingGoal={campaign.target} />

                        {/* LEADERBOARD SECTION */}
                        <DonorsLeaderboard donations={campaign.donations} />
                    </div>
                );
            default:{
                return null;
            }
        }
    }


    if (isLoading) {
        return (
            <main className="container mx-auto px-4 py-32 min-h-screen flex justify-center items-center">
                <LoaderCircle className="h-12 w-12 animate-spin text-blue-600" />
            </main>
        );
    }

    if (error || !campaign) {
        return (
            <main className="container mx-auto px-4 py-32 min-h-screen text-center">
                <Card className="p-8 max-w-lg mx-auto">
                    <XCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
                    <h1 className="text-2xl font-bold mb-2">Error</h1>
                    <p className="text-gray-500 dark:text-gray-400">{error || 'Campaign data is missing.'}</p>
                    <Button as={Link} to="/dashboard" className="mt-6">
                        Go to Dashboard
                    </Button>
                </Card>
            </main>
        );
    }

    const daysRemaining = daysLeft(campaign.deadline);
    const isExpired = daysLeft(campaign.deadline) <= 0;
    const isSuccess = parseFloat(campaign.amountCollected) >= parseFloat(campaign.target);

    return (
        <main className="container mx-auto px-4 py-16 pt-28">
            <div className="mb-6">
                <Button as={Link} to="/dashboard" variant="ghost">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Campaigns
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                
                {/* === SIDEBAR (Right/Sticky) === */}
                <div className="lg:col-span-1 lg:order-2">
                    <div className="sticky top-20 space-y-6"> {/* Fixed sticky position to avoid header collision */}
                        
                        {/* Donation Card (Fixed Position and Less Annoying) */}
                        <Card className={`p-6 shadow-2xl border-blue-400/50 dark:border-blue-700/50 border-2 transition-shadow duration-300 ${AESTHETIC_CARD_CLASSES}`}>
                            
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full 
                                    bg-blue-100/90 text-blue-600 dark:text-blue-400 drop-shadow-sm">
                                    {campaign.category}
                                </span>
                                {campaign.verified && (
                                    <span className="text-xs font-extrabold uppercase tracking-widest flex items-center 
                                        text-green-600 dark:text-green-400 drop-shadow-md">
                                        <ShieldCheck className='h-4 w-4 mr-1' /> VERIFIED
                                    </span>
                                )}
                            </div>
    
                            <ProgressBar current={campaign.amountCollected} target={campaign.target} />
    
                            <div className="mt-4">
                                {/* BOLD, GLOWING TEXT */}
                                <h3 className="text-5xl font-extrabold text-gray-900 dark:text-white bg-clip-text dark:bg-gradient-to-r dark:from-white dark:to-blue-200 dark:drop-shadow-lg">
                                    {campaign.amountCollected} <span className="text-lg font-normal text-gray-800 dark:text-gray-400">ETH</span>
                                </h3>
                                <p className="text-sm text-gray-900 dark:text-gray-400 uppercase">RAISED of {campaign.target} ETH GOAL</p>
                            </div>
    
                            <div className="grid grid-cols-3 gap-3 mt-6 text-center border-t border-gray-400/80 dark:border-gray-700/50 pt-4">
                                <div className="p-1">
                                    <p className="font-extrabold text-xl text-green-600 dark:text-green-400 drop-shadow-md">
                                        {isSuccess ? '100%+' : `${((parseFloat(campaign.amountCollected) / parseFloat(campaign.target) * 100).toFixed(0))}%`}
                                    </p>
                                    <p className="text-xs text-gray-800 dark:text-gray-400 uppercase">Funded</p>
                                </div>
                                <div className="p-1">
                                    <p className="font-extrabold text-xl text-gray-900 dark:text-white drop-shadow-md">
                                        {campaign.donators}
                                    </p>
                                    <p className="text-xs text-gray-800 dark:text-gray-400 uppercase">Donators</p>
                                </div>
                                 <div className="p-1">
                                    <p className={`font-extrabold text-xl ${isExpired ? 'text-red-600' : 'text-blue-600'} dark:text-blue-400 drop-shadow-md`}>
                                        {isExpired ? 'ENDED' : `${daysRemaining}`}
                                    </p>
                                    <p className="text-xs text-gray-800 dark:text-gray-400 uppercase">{isExpired ? 'Status' : 'Days Left'}</p>
                                </div>
                            </div>
    
                            <Button 
                                size="lg" 
                                className="w-full mt-6 text-lg py-3 font-extrabold relative overflow-hidden bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/40 dark:shadow-blue-700/40 transition-all duration-300 disabled:opacity-50"
                                onClick={handleDonate}
                                disabled={isExpired || campaign.claimed}
                            >
                                {isAuthenticated ? (isExpired || campaign.claimed ? 'CAMPAIGN ENDED' : 'DONATE NOW') : 'SIGN IN TO DONATE'}
                            </Button>
                        </Card>
    
                        {/* Organizer Card (with Profile Link) */}
                        <Card className={`p-6 ${AESTHETIC_CARD_CLASSES}`}>
                             <h4 className="font-extrabold text-xl mb-4 text-gray-900 dark:text-white">ORGANIZER</h4>
                            <div className="flex items-center space-x-3">
                                <img 
                                    src={campaign.organizerAvatar} 
                                    alt="Organizer Avatar" 
                                    className="w-12 h-12 rounded-full object-cover border-2 border-blue-400 shadow-md"
                                />
                                <div>
                                    <p className="font-extrabold text-lg text-gray-900 dark:text-white">{campaign.organizerName}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{campaign.organizerLocation}</p>
                                </div>
                                {/* PROFILE INTEGRATION: Link to the new OrganizerProfilePage */}
                                <Button as={Link} to={`/organizer/${campaign.owner}`} size='sm' variant='outline' className='ml-auto'>View Profile</Button>
                            </div>
                            <p className="mt-4 text-sm text-gray-700 dark:text-gray-300">
                                Wallet: <span className="font-mono text-xs font-semibold">{truncateAddress(campaign.owner)}</span>
                            </p>
                        </Card>
                        
                        {/* Trust & Safety Card */}
                        <TrustCard checks={campaign.trustChecks} />
                    </div>
                </div>

                {/* === MAIN CONTENT (Left) === */}
                <div className="lg:col-span-2 space-y-8 lg:order-1">
                    
                    {/* AESTHETIC CHANGE: Tabs Card - Single large Glassmorphism container */}
                    <Card className={`p-0 overflow-hidden ${AESTHETIC_CARD_CLASSES}`}>
                        
                        {/* 1. Hero Image Display Section */}
                        <div className="relative h-96">
                            <img
                                src={campaign.image || 'https://placehold.co/1200x600/94a3b8/ffffff?text=DAAN'}
                                alt={campaign.title}
                                className="w-full h-full object-cover"
                            />
                            {/* Dark Overlay for contrast over the image */}
                            <div className="absolute inset-0 bg-black/30"></div>
                        </div>

                        <div className="p-6 md:p-8">
                            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-gray-900 dark:text-white mb-4">
                                {campaign.title}
                            </h1>
                            <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">{campaign.description}</p>
                            
                            <div className="border-t border-gray-400/80 dark:border-gray-700/50 mt-6 pt-4">
                                <div className="border-b border-gray-400/80 dark:border-gray-700/50">
                                    <nav className="-mb-px flex space-x-6">
                                        <button className={tabClasses('story')} onClick={() => setActiveTab('story')}>
                                            PROJECT STORY
                                        </button>
                                        <button className={tabClasses('updates')} onClick={() => setActiveTab('updates')}>
                                            UPDATES & MILESTONES
                                        </button>
                                        <button className={tabClasses('financials')} onClick={() => setActiveTab('financials')}>
                                            FINANCIALS & DONORS
                                        </button>
                                    </nav>
                                </div>
                                
                                <div className="py-6">{renderTabContent()}</div>
                            </div>
                        </div>
                    </Card>
                    
                </div>

            </div>
        </main>
    );
};

export default CampaignDetailPage;