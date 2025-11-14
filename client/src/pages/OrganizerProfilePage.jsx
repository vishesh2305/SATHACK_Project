// src/pages/OrganizerProfilePage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
    LoaderCircle, 
    XCircle, 
    ArrowLeft,
    ShieldCheck,
    Target,
    Heart,
    Copy,
    Trophy,
    MapPin,
    HeartOff
} from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { getOrganizerProfile, mockData } from '../data/mockData';
import { useUser } from '../contexts/UserProvider'; // Import useUser
import { useNotification } from '../contexts/NotificationProvider'; // <<< NEW IMPORT

// Helper to truncate wallet address
const truncateAddress = (address) => {
    if (!address) return 'N/A';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

const OrganizerProfilePage = () => {
    const { id: organizerAddress } = useParams();
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isAuthenticated, followedOrganizers, followOrganizer, unfollowOrganizer } = useUser(); // Use User Context
    const { showNotification } = useNotification(); // <<< USE NOTIFICATION
    
    // Check if the user is currently following this organizer
    const isFollowing = followedOrganizers.includes(organizerAddress);

    useEffect(() => {
        // Simulate fetching profile data based on wallet address (id)
        setTimeout(() => {
            const mockProfile = getOrganizerProfile(organizerAddress);
            if (mockProfile) {
                // Attach the wallet address to the profile for easy access
                setProfile({ ...mockProfile, address: organizerAddress }); 
                setIsLoading(false);
            } else {
                // This shouldn't happen with the default fallback, but included for safety
                setError(`Organizer with address ${organizerAddress} not found.`);
                setIsLoading(false);
            }
        }, 500);
    }, [organizerAddress]);

    const handleFollowToggle = () => {
        if (!isAuthenticated) {
            // REPLACED BROWSER ALERT
            showNotification("Please sign in to follow an organizer.", "info"); 
            return;
        }

        if (isFollowing) {
            unfollowOrganizer(organizerAddress);
        } else {
            followOrganizer(organizerAddress);
        }
    };

    if (isLoading) {
        return (
            <main className="container mx-auto px-4 py-32 min-h-screen flex justify-center items-center">
                <LoaderCircle className="h-12 w-12 animate-spin text-blue-600" />
            </main>
        );
    }

    if (error || !profile) {
        return (
            <main className="container mx-auto px-4 py-32 min-h-screen text-center">
                <Card className="p-8 max-w-lg mx-auto">
                    <XCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
                    <h1 className="text-2xl font-bold mb-2">Error</h1>
                    <p className="text-gray-500 dark:text-gray-400">{error || 'Profile data is missing.'}</p>
                    <Button as={Link} to="/dashboard" className="mt-6">
                        Go to Dashboard
                    </Button>
                </Card>
            </main>
        );
    }

    // Filter the main campaign list to only show active campaigns by this organizer
    const activeCampaigns = mockData.campaigns.filter(c => 
        c.owner === organizerAddress && !c.claimed && (Date.now() < c.deadline)
    );

    const handleCopy = () => {
        navigator.clipboard.writeText(profile.address);
    };

    // Determine which button variant and icon to show
    const FollowButton = () => (
        <Button 
            onClick={handleFollowToggle} 
            variant={isFollowing ? 'danger_outline' : 'default'} 
            className="w-full sm:w-auto"
        >
            {isFollowing ? (
                <><HeartOff className="h-4 w-4 mr-2" /> Unfollow</>
            ) : (
                <><Heart className="h-4 w-4 mr-2" /> Follow</>
            )}
        </Button>
    );

    return (
        <main className="container mx-auto px-4 py-16 pt-28">
            <div className="mb-6">
                <Button as={Link} to={-1} variant="ghost">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Campaign
                </Button>
            </div>

            <Card className="p-0 mb-8 overflow-hidden">
                <div className="h-40 w-full bg-gradient-to-r from-blue-600 to-purple-700" />
                <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between">
                        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                            <img 
                                src={profile.avatar} 
                                alt="Profile" 
                                className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 -mt-20 object-cover" 
                            />
                            <div className="mb-2">
                                <h2 className="text-3xl font-bold flex items-center">
                                    {profile.name}
                                    {profile.isVerified && <ShieldCheck className="ml-3 h-6 w-6 text-green-500" title="Verified Organizer" />}
                                </h2>
                                <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mt-1">
                                    <MapPin className="h-4 w-4 mr-1"/> Verified Location
                                </div>
                                <div className="flex items-center text-gray-600 dark:text-gray-300 font-mono text-xs mt-2 p-1 rounded-md bg-gray-100 dark:bg-gray-800/50">
                                    <span>{truncateAddress(profile.address)}</span>
                                    <button onClick={handleCopy} className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 ml-2" title="Copy Address">
                                        <Copy className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 sm:mt-0">
                            <FollowButton />
                        </div>
                    </div>
                    <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                         <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{profile.bio}</p>
                    </div>
                </div>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                <Card className="p-6 text-center">
                    <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                    <p className="text-3xl font-bold text-gray-800 dark:text-white">{profile.totalRaised} ETH</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Raised</p>
                </Card>
                 <Card className="p-6 text-center">
                    <Target className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-3xl font-bold text-gray-800 dark:text-white">{profile.campaignsCompleted}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Campaigns Completed</p>
                </Card>
                 <Card className="p-6 text-center">
                    <ShieldCheck className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-3xl font-bold text-gray-800 dark:text-white">{profile.isVerified ? 'Verified' : 'Unverified'}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                </Card>
            </div>

            {/* Campaigns List */}
            <Card className="p-8">
                <h3 className="text-2xl font-bold mb-6 flex items-center">
                    <Target className="h-6 w-6 mr-2 text-blue-500" />
                    Active Campaigns ({activeCampaigns.length})
                </h3>
                {activeCampaigns.length > 0 ? (
                    <div className="space-y-4">
                        {activeCampaigns.map(campaign => (
                            <div key={campaign.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex justify-between items-center">
                                <p className="font-semibold">{campaign.title}</p>
                                <Button as={Link} to={`/campaign/${campaign.id}`} size="sm">View</Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400">No active campaigns currently running.</p>
                )}

                 <h3 className="text-2xl font-bold mt-10 mb-6 flex items-center border-t dark:border-gray-700 pt-6">
                    <Heart className="h-6 w-6 mr-2 text-red-500" />
                    Completed Projects ({profile.pastCampaigns.length})
                </h3>
                <div className="space-y-4">
                    {profile.pastCampaigns.length > 0 ? (
                        profile.pastCampaigns.map((campaign, index) => (
                            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex justify-between items-center">
                                <p className="font-semibold">{campaign.title}</p>
                                <div className="flex items-center space-x-4">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">{campaign.raised}</span>
                                    <span className="text-sm font-semibold text-green-600">{campaign.status}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400">No projects completed yet.</p>
                    )}
                </div>
            </Card>

        </main>
    );
};

export default OrganizerProfilePage;