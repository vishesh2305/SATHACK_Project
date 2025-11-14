// src/pages/ProfilePage.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    LoaderCircle, 
    Pencil, 
    Target, 
    Heart, 
    TrendingUp, 
    Users, 
    CheckCircle,
    Copy,
    Clock,
    DollarSign,
    Gift
} from 'lucide-react';
import Web3 from 'web3';
import { CROWDFUNDING_ABI, CROWDFUNDING_CONTRACT_ADDRESS } from '../constants';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { useUser } from '../contexts/UserProvider';
import ProgressBar from '../components/common/ProgressBar';
import { useNotification } from '../contexts/NotificationProvider'; // 1. IMPORT

// ... (devDefaultUser and CampaignRowCard components are unchanged) ...
const devDefaultUser = {
  avatar: "https://placehold.co/100x100/E0E7FF/4F46E5?text=U",
  name: "Test User",
  email: "test@example.com"
};

const CampaignRowCard = ({ campaign, isOwner, onClaim, isClaiming }) => {
    const isExpired = Date.now() > campaign.deadline;
    const daysLeft = isExpired ? 0 : Math.ceil((new Date(campaign.deadline) - Date.now()) / (1000 * 60 * 60 * 24));
    
    let statusBadge;
    if (campaign.claimed) {
        statusBadge = (
            <div className="flex items-center text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50 px-2 py-0.5 rounded-full">
                <CheckCircle className="h-3 w-3 mr-1" /> Claimed
            </div>
        );
    } else if (isExpired) {
        statusBadge = (
            <div className="flex items-center text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                <Clock className="h-3 w-3 mr-1" /> Ended
            </div>
        );
    } else {
         statusBadge = (
            <div className="flex items-center text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 rounded-full">
                <Clock className="h-3 w-3 mr-1" /> {daysLeft} {daysLeft === 1 ? 'Day' : 'Days'} Left
            </div>
        );
    }

    return (
        <Card className="p-4 w-full transition-shadow hover:shadow-lg">
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <img 
                    src={campaign.image} 
                    alt={campaign.title} 
                    className="w-full sm:w-32 h-32 sm:h-24 rounded-lg object-cover flex-shrink-0" 
                />
                <div className="flex-grow w-full">
                    <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-lg text-gray-800 dark:text-white">{campaign.title}</h4>
                        {statusBadge}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        <span className="font-bold text-gray-800 dark:text-white">{campaign.amountCollected} ETH</span> raised of {campaign.target} ETH
                    </p>
                    <ProgressBar current={campaign.amountCollected} target={campaign.target} />
                </div>
                <div className="w-full sm:w-auto flex-shrink-0">
                    {isOwner && isExpired && !campaign.claimed ? (
                        <Button onClick={() => onClaim(campaign.id)} disabled={isClaiming === campaign.id} className="w-full">
                            {isClaiming === campaign.id ? <LoaderCircle className="animate-spin" /> : "Claim Funds"}
                        </Button>
                    ) : (
                        <Button as={Link} to={`/campaign/${campaign.id}`} variant="outline" size="sm" className="w-full">
                            View Campaign
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
};

const StatCard = ({ icon, label, value, unit = '' }) => (
    <Card className="p-4">
        <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                {React.cloneElement(icon, { className: "h-6 w-6 text-blue-600 dark:text-blue-400" })}
            </div>
            <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                <p className="text-xl font-bold text-gray-800 dark:text-white">
                    {value} <span className="text-sm font-normal">{unit}</span>
                </p>
            </div>
        </div>
    </Card>
);


const ProfilePage = () => {
    const { currentUser } = useUser();
    const user = currentUser || devDefaultUser;
    const { showNotification } = useNotification(); // 2. GET THE FUNCTION

    const [activeTab, setActiveTab] = useState('created');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userAccount, setUserAccount] = useState(null);
    const [createdCampaigns, setCreatedCampaigns] = useState([]);
    const [donatedCampaigns, setDonatedCampaigns] = useState([]);
    const [totalDonatedAmount, setTotalDonatedAmount] = useState('0');
    const [totalRaisedInUserCampaigns, setTotalRaisedInUserCampaigns] = useState('0');
    const [isClaiming, setIsClaiming] = useState(null);
    const navigate = useNavigate();

    // ... (fetchData is unchanged) ...
    const fetchData = async () => {
        if (!window.ethereum) {
            setError("Using mock data for styling. Connect MetaMask to see live data.");
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const web3 = new Web3(window.ethereum);
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const currentUserAddress = accounts[0].toLowerCase();
            setUserAccount(currentUserAddress);

            const contract = new web3.eth.Contract(CROWDFUNDING_ABI, CROWDFUNDING_CONTRACT_ADDRESS);
            const allCampaigns = await contract.methods.getCampaigns().call();
            
            const created = [];
            const donated = new Set();
            let userTotalDonation = BigInt(0);
            let totalRaised = BigInt(0);

            await Promise.all(allCampaigns.map(async (campaignData, i) => {
                const formattedCampaign = {
                    id: i,
                    owner: campaignData.owner,
                    title: campaignData.title,
                    target: web3.utils.fromWei(campaignData.target.toString(), 'ether'),
                    amountCollected: web3.utils.fromWei(campaignData.amountCollected.toString(), 'ether'),
                    deadline: Number(campaignData.deadline) * 1000,
                    claimed: campaignData.claimed,
                    image: campaignData.image || 'https://placehold.co/600x400/94a3b8/ffffff?text=Daan',
                };

                if (formattedCampaign.owner.toLowerCase() === currentUserAddress) {
                    created.push(formattedCampaign);
                    totalRaised += BigInt(campaignData.amountCollected.toString());
                }

                const donatorsData = await contract.methods.getDonators(i).call();
                const donatorAddresses = donatorsData[0];
                const donationAmounts = donatorsData[1];
                let userHasDonatedToThisCampaign = false;

                donatorAddresses.forEach((addr, index) => {
                    if (addr.toLowerCase() === currentUserAddress) {
                        userTotalDonation += BigInt(donationAmounts[index].toString());
                        userHasDonatedToThisCampaign = true;
                    }
                });

                if (userHasDonatedToThisCampaign) {
                    donated.add(formattedCampaign);
                }
            }));

            setCreatedCampaigns(created);
            setDonatedCampaigns(Array.from(donated));
            setTotalDonatedAmount(web3.utils.fromWei(userTotalDonation.toString(), 'ether'));
            setTotalRaisedInUserCampaigns(web3.utils.fromWei(totalRaised.toString(), 'ether'));

        } catch (err) {
            console.error("Failed to fetch profile data:", err);
            setError("Could not load profile data.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!window.ethereum) {
             setIsLoading(false);
             setError("Using mock data for styling. Connect MetaMask to see live data.");
        } else {
            fetchData();
        }
    }, []);
    
    const handleClaim = async (campaignId) => {
        setIsClaiming(campaignId);
        try {
            const web3 = new Web3(window.ethereum);
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const contract = new web3.eth.Contract(CROWDFUNDING_ABI, CROWDFUNDING_CONTRACT_ADDRESS);

            await contract.methods.claim(campaignId).send({ from: accounts[0], gas: 3000000 });
            
            // 3. REPLACE ALERT
            showNotification("Funds claimed successfully! The page will now refresh.", "success");
            fetchData(); 
        } catch (err) {
            console.error("Failed to claim funds:", err);
            // 4. REPLACE ALERT
            showNotification(`Error claiming funds: ${err.message}`, "error");
        } finally {
            setIsClaiming(null);
        }
    };

    // ... (tabClasses, CampaignList, renderContent, and return are unchanged) ...
    const tabClasses = (tabName) => `py-3 px-4 font-semibold border-b-2 transition-colors ${
        activeTab === tabName 
        ? 'border-blue-600 text-blue-600' 
        : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
    }`;

    const CampaignList = ({ campaigns, emptyMessage, isCreatedTab = false }) => {
        if (isLoading) {
             return <div className="flex justify-center p-8"><LoaderCircle className="animate-spin h-8 w-8 text-blue-500" /></div>;
        }
        if (campaigns.length === 0) {
            return <p className="text-center text-gray-500 py-16">{emptyMessage}</p>;
        }
        return (
            <div className="space-y-4">
                {campaigns.map(campaign => (
                    <CampaignRowCard
                        key={campaign.id}
                        campaign={campaign}
                        isOwner={isCreatedTab}
                        onClaim={handleClaim}
                        isClaiming={isClaiming}
                    />
                ))}
            </div>
        );
    };
    
    const renderContent = () => {
        if (error && !userAccount) { // Show error only if it's a real error, not the dev message
            return <div className="text-center text-red-500 p-4">{error}</div>;
        }
        switch (activeTab) {
            case 'created':
                return <CampaignList campaigns={createdCampaigns} emptyMessage="You have not created any campaigns yet." isCreatedTab={true} />;
            case 'donated':
                return <CampaignList campaigns={donatedCampaigns} emptyMessage="You have not donated to any campaigns yet." />;
            default:
                return null;
        }
    };
    
    return (
        <main className="container mx-auto px-4 py-8 relative z-10">
             
             <Card className="p-0 mb-8 overflow-hidden">
                <div className="h-40 w-full bg-gradient-to-r from-blue-500 to-purple-600" />
                <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between">
                        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                            <img 
                                src={user.avatar} 
                                alt="Profile" 
                                className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 -mt-20 object-cover" 
                            />
                            <div className="mb-2">
                                <h2 className="text-3xl font-bold">{user.name}</h2>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">{user.email || 'No email provided'}</p>
                            </div>
                        </div>
                        <div className="mt-4 sm:mt-0">
                            <Button as={Link} to="/settings" variant="outline">
                                <Pencil className="h-4 w-4 mr-2" /> Edit Profile
                            </Button>
                        </div>
                    </div>
                    <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                         <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Your Wallet</p>
                         <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 font-mono text-xs break-all bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
                            <span>{userAccount || 'Wallet not connected'}</span>
                            <button 
                                onClick={() => userAccount && navigator.clipboard.writeText(userAccount)}
                                className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                                title="Copy to clipboard"
                            >
                                <Copy className="h-4 w-4" />
                            </button>
                         </div>
                    </div>
                </div>
            </Card>

            <Card className="p-6 mb-8">
                <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Your Impact Summary</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard 
                        icon={<DollarSign />}
                        label="Total Raised by You"
                        value={parseFloat(totalRaisedInUserCampaigns).toFixed(4)}
                        unit="ETH"
                    />
                    <StatCard 
                        icon={<Gift />}
                        label="Total Donated by You"
                        value={parseFloat(totalDonatedAmount).toFixed(4)}
                        unit="ETH"
                    />
                    <StatCard 
                        icon={<Target />}
                        label="Campaigns Created"
                        value={createdCampaigns.length}
                    />
                    <StatCard 
                        icon={<Users />}
                        label="Campaigns Supported"
                        value={donatedCampaigns.length}
                    />
                </div>
            </Card>

            <div>
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-6">
                        <button className={tabClasses('created')} onClick={() => setActiveTab('created')}>
                            My Campaigns ({createdCampaigns.length})
                        </button>
                        <button className={tabClasses('donated')} onClick={() => setActiveTab('donated')}>
                            My Donations ({donatedCampaigns.length})
                        </button>
                    </nav>
                </div>
                <div className="py-6">{renderContent()}</div>
            </div>
        </main>
    );
};

export default ProfilePage;