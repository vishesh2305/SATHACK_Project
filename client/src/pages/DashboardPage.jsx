// src/pages/DashboardPage.jsx

import React, { useState, useEffect } from 'react';
import { Search, Grid3X3, List, Shield, LoaderCircle, Users, Target, Clock, Zap } from 'lucide-react';
// Web3 imports are no longer needed for this mock-only version
// import Web3 from 'web3';
// import { CROWDFUNDING_ABI, CROWDFUNDING_CONTRACT_ADDRESS } from '../constants';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import ProgressBar from '../components/common/ProgressBar';
import { Link } from 'react-router-dom';
import { mockData } from '../data/mockData';
import { daysLeft } from '../utils';

const DashboardPage = () => {
    const [viewMode, setViewMode] = useState('grid');
    const [campaigns, setCampaigns] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // --- MODIFIED TO ALWAYS LOAD MOCK DATA ---
        setIsLoading(true);
        setTimeout(() => {
            // --- THIS IS THE FIX ---
            // We create a copy with [...mockData.campaigns] before reversing it.
            // This prevents mutating the original mockData object.
            setCampaigns([...mockData.campaigns].reverse());
            // --- END FIX ---
            
            setIsLoading(false);
        }, 500); // Simulate a small loading delay
    }, []); // Empty dependency array ensures this runs only once on mount

    const filteredCampaigns = campaigns.filter(campaign => 
        campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const CampaignCard = ({ campaign }) => {
        const remainingDays = daysLeft(campaign.deadline);
        const isExpired = remainingDays <= 0;
        const daysLabel = isExpired ? 'Ended' : `${remainingDays} Days Left`;
        
        const fundingPercentage = (parseFloat(campaign.amountCollected) / parseFloat(campaign.target)) * 100;
        const isFullyFunded = fundingPercentage >= 100;

        const defaultImage = 'https://placehold.co/600x400/94a3b8/ffffff?text=Daan';

        const handleImageError = (e) => {
            e.target.onerror = null; 
            e.target.src = defaultImage;
        };

        const StatusBadge = () => {
            if (campaign.claimed) {
                return <div className="flex items-center bg-gray-500 text-white text-xs font-bold px-3 py-1 rounded-full">Claimed</div>;
            }
            if (isFullyFunded) {
                return <div className="flex items-center bg-yellow-500 text-gray-900 text-xs font-bold px-3 py-1 rounded-full"><Zap className='h-3 w-3 mr-1'/> Fully Funded</div>;
            }
            if (isExpired) {
                return <div className="flex items-center bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full"><Clock className='h-3 w-3 mr-1'/> Expired</div>;
            }
            return null;
        };

        return (
            <Card className={`overflow-hidden transition-shadow hover:shadow-xl hover:shadow-blue-500/20 flex flex-col h-full ${campaign.claimed ? 'grayscale opacity-60' : ''}`}>
                
                {/* Image and Badges */}
                <div className="relative h-48 bg-gray-200 dark:bg-gray-800">
                    <img 
                        src={campaign.image || defaultImage} 
                        alt={campaign.title} 
                        className="w-full h-full object-cover"
                        onError={handleImageError}
                    />
                     <div className="absolute top-3 right-3 flex items-center space-x-2">
                        <StatusBadge />
                        {campaign.verified && (
                            <div className="flex items-center bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                                <Shield className="h-3 w-3 mr-1"/> Verified
                            </div>
                        )}
                    </div>
                     <div className="absolute bottom-0 left-0 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-tr-lg text-xs font-semibold text-white">
                        {campaign.category}
                    </div>
                </div>
                
                {/* Content Area */}
                <div className="p-4 flex flex-col flex-grow">
                    <h3 className="font-bold text-xl text-gray-800 dark:text-white mb-2 truncate">{campaign.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex-grow mb-4">{`${campaign.description.substring(0, 100)}...`}</p>
                    
                    <div className="mt-auto">
                        <ProgressBar current={campaign.amountCollected} target={campaign.target} />
                        
                        {/* Footer Stats - High Contrast */}
                        <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg grid grid-cols-3 gap-2 text-center border dark:border-gray-700">
                            <div>
                                <p className="font-bold text-sm text-gray-900 dark:text-white">{parseFloat(campaign.amountCollected).toFixed(2)} ETH</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Raised</p>
                            </div>
                            <div>
                                <p className="font-bold text-sm text-gray-900 dark:text-white">{campaign.donators}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Donators</p>
                            </div>
                            <div>
                                <p className={`font-bold text-sm ${isExpired ? 'text-red-500 dark:text-red-400' : 'text-blue-500 dark:text-blue-400'}`}>{daysLabel}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        );
    };

    const isGrid = viewMode === 'grid';

    return (
        <main className="container mx-auto px-4 py-8 pt-28">
            
            {/* Main Header (No change, remains statically placed) */}
            <header className='mb-6'>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white">
                    Explore Campaigns
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                    Fund the future with verifiably secure and transparent projects.
                </p>
            </header>

            {/* STATIC CONTROL BAR (Placed just below the header, scrolls with the page) */}
            <div className="mb-8 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md border dark:border-gray-700 transition-all duration-300">
                <div className="flex justify-between items-center">
                    <div className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 flex-grow max-w-xl">
                        <div className="pl-4"> <Search className="h-5 w-5 text-gray-500" /> </div>
                        <input 
                            type="text" 
                            placeholder="Search campaigns by title or category..." 
                            className="bg-transparent p-3 focus:outline-none w-full text-base"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                         <span className='text-sm text-gray-500 dark:text-gray-400 hidden sm:inline'>View:</span>
                        <Button variant={isGrid ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('grid')}> <Grid3X3 className="h-5 w-5"/> </Button>
                        <Button variant={!isGrid ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('list')}> <List className="h-5 w-5"/> </Button>
                    </div>
                </div>
            </div>
            
            {/* Campaign Content */}
            {isLoading ? (
                <div className="flex justify-center items-center h-64"> <LoaderCircle className="h-12 w-12 animate-spin text-blue-600" /> </div>
            ) : (
                <>
                    {/* Error/Info Message Display */}
                    {error && (
                        <div className="text-center bg-yellow-100 dark:bg-yellow-900/50 p-4 rounded-lg mb-8">
                            <p className="text-sm text-yellow-800 dark:text-yellow-300 font-medium">
                                <span className='font-bold'>{error.includes('NOTE') ? 'INFO:' : 'ERROR:'}</span> {error.replace('NOTE: ', '').replace('ERROR: ', '')}
                            </p>
                        </div>
                    )}
                    
                    {/* Campaign Grid/List */}
                    <div className={`grid gap-8 ${isGrid ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                        {filteredCampaigns.length > 0 ? (
                            filteredCampaigns.map(campaign => (
                                // This Link component is what makes the card clickable
                                <Link key={campaign.id} to={`/campaign/${campaign.id}`} className="cursor-pointer">
                                    <CampaignCard campaign={campaign} />
                                </Link>
                            ))
                        ) : (
                           <div className="col-span-full text-center text-gray-500 py-16">
                             <p>No campaigns found matching your criteria.</p>
                           </div>
                        )}
                    </div>
                </>
            )}
        </main>
    );
};

export default DashboardPage;