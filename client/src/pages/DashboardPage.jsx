import React, { useState, useEffect } from 'react';
import { Search, Grid3X3, List, Shield, LoaderCircle } from 'lucide-react';
import { useUser } from '../contexts/UserProvider'; // Import the global context
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import ProgressBar from '../components/common/ProgressBar';
import CampaignDetailModal from '../components/CampaignDetailModal';

const DashboardPage = () => {
    const [viewMode, setViewMode] = useState('grid');
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [campaigns, setCampaigns] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Get contract and web3 from our global Context
    const { contract, web3, address } = useUser();

    useEffect(() => {
        const fetchCampaigns = async () => {
            // 1. Wait for contract to be loaded by UserProvider
            if (!contract) {
                // If 2 seconds pass and no contract, stop loading (user might not be connected)
                setTimeout(() => setIsLoading(false), 2000);
                return;
            }

            try {
                setIsLoading(true);
                
                // 2. Fetch raw data from blockchain
                const data = await contract.methods.getCampaigns().call();

                // 3. Format the data
                const formattedCampaigns = data.map((campaign, index) => ({
                    id: index,
                    owner: campaign.owner,
                    title: campaign.title,
                    description: campaign.description,
                    target: web3.utils.fromWei(campaign.target.toString(), 'ether'),
                    deadline: Number(campaign.deadline) * 1000, // Convert seconds to ms
                    amountCollected: web3.utils.fromWei(campaign.amountCollected.toString(), 'ether'),
                    image: campaign.image,
                    // Use internal array length if available, fallback to 0
                    donators: campaign.donators ? campaign.donators.length : 0, 
                    claimed: campaign.claimed,
                    verified: true, // Mock verification for now
                }));

                // Show newest campaigns first
                setCampaigns(formattedCampaigns.reverse());
            } catch (err) {
                console.error("Error fetching campaigns:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCampaigns();
    }, [contract, web3]); // Re-run when contract is loaded

    const handleCampaignClick = (campaign) => {
        setSelectedCampaign(campaign);
    };

    const handleCloseModal = () => {
        setSelectedCampaign(null);
    };
    
    const filteredCampaigns = campaigns.filter(campaign => 
        campaign.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- Sub-Component for Cards ---
    const CampaignCard = ({ campaign }) => {
        const isExpired = Date.now() > campaign.deadline;
        const daysLeft = isExpired ? 0 : Math.ceil((new Date(campaign.deadline) - Date.now()) / (1000 * 60 * 60 * 24));
        
        const defaultImage = 'https://placehold.co/600x400/94a3b8/ffffff?text=Daan+Campaign';

        const handleImageError = (e) => {
            e.target.onerror = null; 
            e.target.src = defaultImage;
        };

        return (
            <Card className={`overflow-hidden transition-shadow hover:shadow-xl flex flex-col h-full cursor-pointer ${campaign.claimed ? 'grayscale opacity-75' : ''}`}>
                <div className="relative h-48 bg-gray-200 dark:bg-gray-800">
                    <img 
                        src={campaign.image || defaultImage} 
                        alt={campaign.title} 
                        className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                        onError={handleImageError}
                    />
                     <div className="absolute top-2 right-2">
                        {campaign.claimed ? (
                             <div className="flex items-center bg-gray-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                                Ended
                            </div>
                        ) : campaign.verified && (
                            <div className="flex items-center bg-green-100 dark:bg-green-900/80 text-green-700 dark:text-green-300 text-xs font-bold px-2 py-1 rounded-full backdrop-blur-sm">
                                <Shield className="h-3 w-3 mr-1"/> Verified
                            </div>
                        )}
                    </div>
                </div>
                <div className="p-4 flex flex-col flex-grow">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-2 truncate">{campaign.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex-grow mb-4 line-clamp-2">
                        {campaign.description}
                    </p>
                    
                    <div className="mt-auto">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                                {parseFloat(campaign.amountCollected).toFixed(4)} ETH
                            </span>
                            <span className="text-gray-500">
                                of {campaign.target} ETH
                            </span>
                        </div>
                        <ProgressBar value={(parseFloat(campaign.amountCollected) / parseFloat(campaign.target)) * 100} />
                        
                        <div className="grid grid-cols-3 gap-4 text-center mt-4 pt-4 border-t dark:border-gray-700">
                            <div>
                                <p className="font-bold text-sm text-gray-800 dark:text-white">
                                    {parseFloat(campaign.amountCollected) > 0 ? parseFloat(campaign.amountCollected).toFixed(2) : '0'}
                                </p>
                                <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">Raised</p>
                            </div>
                            <div>
                                <p className="font-bold text-sm text-gray-800 dark:text-white">{campaign.donators}</p>
                                <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">Backers</p>
                            </div>
                            <div>
                                <p className="font-bold text-sm text-gray-800 dark:text-white">{daysLeft}</p>
                                <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">Days Left</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        );
    };

    return (
        <>
            <main className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div className="relative flex items-center w-full md:max-w-md">
                        <Search className="absolute left-3 h-5 w-5 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search campaigns..." 
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                        <Button 
                            variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
                            size="sm" 
                            onClick={() => setViewMode('grid')}
                            className={viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}
                        > 
                            <Grid3X3 className="h-4 w-4"/> 
                        </Button>
                        <Button 
                            variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
                            size="sm" 
                            onClick={() => setViewMode('list')}
                            className={viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}
                        > 
                            <List className="h-4 w-4"/> 
                        </Button>
                    </div>
                </div>
                
                {isLoading ? (
                    <div className="flex flex-col justify-center items-center h-64 space-y-4"> 
                        <LoaderCircle className="h-12 w-12 animate-spin text-blue-600" /> 
                        <p className="text-gray-500 animate-pulse">Loading campaigns from blockchain...</p>
                    </div>
                ) : (
                    <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                        {filteredCampaigns.length > 0 ? (
                            filteredCampaigns.map(campaign => (
                                <div key={campaign.id} onClick={() => handleCampaignClick(campaign)}>
                                    <CampaignCard campaign={campaign} />
                                </div>
                            ))
                        ) : (
                           <div className="col-span-full flex flex-col items-center justify-center text-gray-500 py-16">
                             <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4">
                                <Search className="h-8 w-8 opacity-50" />
                             </div>
                             <p className="text-lg font-medium">No campaigns found</p>
                             <p className="text-sm">Try adjusting your search or create a new one!</p>
                           </div>
                        )}
                    </div>
                )}
            </main>

            {selectedCampaign && ( 
                <CampaignDetailModal 
                    campaign={selectedCampaign} 
                    onClose={handleCloseModal} 
                /> 
            )}
        </>
    );
};

export default DashboardPage;