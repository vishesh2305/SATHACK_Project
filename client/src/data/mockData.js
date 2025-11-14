// src/data/mockData.js

export const mockData = {
  user: {
    name: "sumedha",
    email: "katariasumedha14@gmail.com",
    profileImage: "https://placehold.co/150x150/E0E7FF/4F46E5?text=S",
    totalDonated: 850,
    campaignsSupported: 3,
    campaignsCreated: 0,
    participated: 0,
    phone: 'Not provided',
    donation : '123'
  },
  campaigns: [
    {
      id: 1,
      title: "Clean Water for Rural Communities",
      description: "Help us build wells and water filtration systems for communities in need. We are committed to installing five new borewells and implementing a long-term maintenance plan in the poorest villages. Your donation ensures clean water for over 500 families.",
      image: "https://placehold.co/600x400/BFDBFE/1E3A8A?text=Health",
      owner: "0x123abc456def789ghi",
      amountCollected: "3.25", // In ETH string format
      target: "5.0", // In ETH string format
      donators: 55, // Donators count
      deadline: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days from now (ms timestamp)
      category: "Health",
      claimed: false,
      verified: true,
      organizerName: "Water Aid Foundation",
      organizerLocation: "Mumbai, India",
    },
    {
      id: 2,
      title: "Education for Underprivileged Children",
      description: "Support education initiatives to provide learning materials and scholarships for hundreds of children who lack access to quality schooling. Funds will cover books, uniforms, and teacher training for a full year.",
      image: "https://placehold.co/600x400/C7D2FE/312E81?text=Education",
      owner: "0x456def789ghi123abc",
      amountCollected: "1.87",
      target: "2.5",
      donators: 28,
      deadline: Date.now() - (10 * 24 * 60 * 60 * 1000), // 10 days ago (expired)
      category: "Education",
      claimed: false,
      verified: true,
      organizerName: "Learn Together Initiative",
      organizerLocation: "Bangalore, India",
    },
    {
      id: 3,
      title: "Sustainable Farming Equipment",
      description: "Help farmers transition to sustainable practices with modern equipment, reducing water usage by 40%. This project directly fights climate change and supports local economies.",
      image: "https://placehold.co/600x400/BFE6BA/166534?text=Environment",
      owner: "0x789ghi123abc456def",
      amountCollected: "45.30",
      target: "75.0",
      donators: 150,
      deadline: Date.now() + (60 * 24 * 60 * 60 * 1000), // 60 days from now
      category: "Environment",
      claimed: false,
      verified: true,
      organizerName: "Green Future Co.",
      organizerLocation: "New Delhi, India",
    },
    {
      id: 4,
      title: "Tech Hub for Young Innovators",
      description: "Building a space for young people to learn coding and robotics, focusing on underserved urban areas. We need new computers and networking gear to launch the center.",
      image: "https://placehold.co/600x400/DDD6FE/4338CA?text=Tech",
      owner: "0x10101010101010101010",
      amountCollected: "0.12",
      target: "0.40",
      donators: 12,
      deadline: Date.now() + (15 * 24 * 60 * 60 * 1000), // 15 days from now
      category: "Technology",
      claimed: false,
      verified: false,
      organizerName: "Future Coders",
      organizerLocation: "Hyderabad, India",
    },
  ],
  // --- NEW ORGANIZER MOCK DATA ---
  organizers: {
      "0x123abc456def789ghi": {
          name: "Water Aid Foundation",
          bio: "Committed to providing sustainable and clean water access across rural India since 2018. We believe in blockchain transparency for every drop. Our team has successfully completed five funding cycles and is fully audited.",
          avatar: "https://placehold.co/100x100/3B82F6/ffffff?text=WAF",
          totalRaised: "150.25",
          campaignsCompleted: 5,
          isVerified: true,
          pastCampaigns: [
              { title: "Borewell Project Phase I", status: "Completed", raised: "50.00 ETH" },
              { title: "Filtration System Pilot", status: "Completed", raised: "45.00 ETH" },
              { title: "Water Tanker Relief", status: "Completed", raised: "5.00 ETH" }
          ]
      },
      "0x456def789ghi123abc": {
          name: "Learn Together Initiative",
          bio: "Empowering children through education with a focus on remote villages.",
          avatar: "https://placehold.co/100x100/F59E0B/ffffff?text=LTI",
          totalRaised: "80.00",
          campaignsCompleted: 2,
          isVerified: true,
          pastCampaigns: [
              { title: "Books for All", status: "Completed", raised: "40.00 ETH" },
              { title: "Teacher Training Q1", status: "Completed", raised: "35.00 ETH" }
          ]
      },
      "0x789ghi123abc456def": {
          name: "Green Future Co.",
          bio: "Innovating at the intersection of agriculture and environmental sustainability. Our projects are carbon-negative and community-focused.",
          avatar: "https://placehold.co/100x100/16A34A/ffffff?text=GFC",
          totalRaised: "45.30",
          campaignsCompleted: 0,
          isVerified: true,
          pastCampaigns: []
      },
      "0x10101010101010101010": {
          name: "Future Coders",
          bio: "A new initiative to bring tech skills to everyone. This is our first project!",
          avatar: "https://placehold.co/100x100/7C3AED/ffffff?text=FC",
          totalRaised: "0.12",
          campaignsCompleted: 0,
          isVerified: false,
          pastCampaigns: []
      },
      "default": {
          name: "Decentralized Visionary",
          bio: "A Daan community member and verified creator focused on impactful, transparent fundraising.",
          avatar: "https://placehold.co/100x100/6B7280/ffffff?text=DV",
          totalRaised: "0.00",
          campaignsCompleted: 0,
          isVerified: false,
          pastCampaigns: []
      }
  }
};

// Helper function to simulate fetching a single campaign by ID
export const getCampaignById = (id) => {
    const numericId = parseInt(id);
    // Find the campaign by its ID
    const campaign = mockData.campaigns.find(c => c.id === numericId);
    
    // If not found, return null instead of defaulting to the first one
    if (!campaign) return null;

    // --- ENHANCED DETAIL DATA FOR DISPLAY ---
    // Use the organizer data associated with the campaign's owner address
    const organizerData = mockData.organizers[campaign.owner] || mockData.organizers.default;

    return {
        ...campaign,
        organizerAvatar: organizerData.avatar,
        organizerName: organizerData.name,
        organizerLocation: campaign.organizerLocation, // Keep original location

        // Detailed Story
        fullDescription: `
            ${campaign.description} 
            
            Our project aims to solve chronic water scarcity affecting over 500 families. The lack of clean water has led to widespread illness and hindered educational opportunities, as children spend hours fetching water. 
            
            **The Solution:** We will implement a three-part solution: 
            1. Drill two deep borewells capable of providing water year-round. 
            2. Install a two-stage reverse osmosis filtration unit. 
            3. Train a local team for long-term maintenance, ensuring sustainability.
            
            **Transparency is Key:** Every rupee and ETH donated will be tracked on the blockchain. Our smart contract only releases funds upon the verification of milestones.
        `,
        
        // Mock Updates (Actual status updates that make sense dynamically)
        updates: [
            { id: 3, date: '2025-11-01', title: 'Smart Contract Deployed & Audit Complete', description: 'The Daan smart contract is live and has passed a third-party audit. Funds are securely locked in the Aave protocol.', status: 'success' },
            { id: 2, date: '2025-10-15', title: 'Land Survey & Permitting Finalized', description: 'We have secured the land and received all necessary local permits for the borewell drilling. Ready for heavy equipment arrival.', status: 'success' },
            { id: 1, date: '2025-10-01', title: 'Campaign Launched & Initial Marketing', description: 'Initial campaign launch on Daan and successful first week of fundraising. Targeting 60% completion next month.', status: 'info' },
        ],
        
        // Mock Donators List (for the leaderboard)
        donations: [
            { donator: '0xabc...d1', amount: '1.500', timestamp: Date.now() - 100000 },
            { donator: '0xdef...e2', amount: '0.005', timestamp: Date.now() - 500000 },
            { donator: '0xghi...f3', amount: '1.000', timestamp: Date.now() - 1200000 },
            { donator: '0xjkl...g4', amount: '0.010', timestamp: Date.now() - 3000000 },
            { donator: '0xmno...h5', amount: '0.050', timestamp: Date.now() - 5000000 },
            { donator: '0xpqr...i6', amount: '0.685', timestamp: Date.now() - 9000000 },
            { donator: '0xzyx...c9', amount: '0.080', timestamp: Date.now() - 15000000 },
        ],

        // Funding Breakdown uses percentages in mock data to mirror creation process
        fundingBreakdown: [
            { label: "Contract Fee (2%)", percentage: 2, color: '#FF7F50' }, // Coral for fixed fees
            { label: "Project Cost", percentage: 88, color: '#3b82f6' }, // Blue
            { label: "Contingency Fund", percentage: 10, color: '#f59e0b' }, // Yellow (Default contingency)
        ],
        
        // Trust & Safety Mock Data
        trustChecks: [
            { check: 'Aadhaar Identity Verified', status: 'Passed' },
            { check: 'Geo-location Confirmed', status: 'Passed' },
            { check: 'Independent Contract Audit', status: 'Passed' },
            { check: 'Owner Address History Cleared', status: 'Passed' },
        ]
    };
};

// Helper function to fetch full organizer profile data
export const getOrganizerProfile = (address) => {
    // If a specific organizer exists, return their profile data merged with their wallet address
    if (mockData.organizers[address]) {
        return {
            address,
            ...mockData.organizers[address]
        };
    }
    // Return a default profile with the provided address
    return {
        address,
        ...mockData.organizers.default
    };
}