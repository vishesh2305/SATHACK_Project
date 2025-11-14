import React, { useState } from 'react';
import { X, Lightbulb, FileText, Bitcoin, Image as ImageIcon, Calendar, Loader2 } from 'lucide-react';
import Button from './common/Button';
import { useUser } from '../contexts/UserProvider';
import { useNotification } from '../contexts/NotificationProvider';

const CreateCampaignModal = ({ isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target: '',
    deadline: '',
    image: ''
  });

  // Access global user context and notification context
  const { contract, address, connectWallet, web3 } = useUser();
  const { showNotification } = useNotification();

  if (!isOpen) return null;

  // Prevent modal from closing when clicking inside the content area
  const handleContentClick = (e) => e.stopPropagation();

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission to Smart Contract
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validate Wallet Connection
    if (!address) {
      showNotification("Please connect your wallet first!", "error");
      await connectWallet();
      return;
    }
    
    // 2. Validate Contract Loading
    if (!contract) {
      showNotification("Contract not loaded. Please reload the page.", "error");
      return;
    }

    // 3. Validate Form Data
    if (!formData.title || !formData.description || !formData.target || !formData.deadline || !formData.image) {
      showNotification("Please fill in all fields.", "error");
      return;
    }

    setIsLoading(true);

    try {
      // 4. Format Data for Blockchain
      // Convert ETH amount to Wei (1 ETH = 10^18 Wei)
      const targetInWei = web3.utils.toWei(formData.target, 'ether');
      
      // Convert deadline string to Unix Timestamp (seconds)
      const deadlineTimestamp = Math.floor(new Date(formData.deadline).getTime() / 1000);

      // Ensure deadline is in the future
      if (deadlineTimestamp < Math.floor(Date.now() / 1000)) {
        throw new Error("Deadline must be in the future.");
      }

      // 5. Send Transaction
      // createCampaign(string _title, string _description, uint256 _target, uint256 _deadline, string _image)
      await contract.methods.createCampaign(
        formData.title,     // _title
        formData.description, // _description
        targetInWei,        // _target
        deadlineTimestamp,  // _deadline
        formData.image      // _image (URL)
      ).send({ from: address, gas: 3000000 });

      showNotification("Campaign created successfully!", "success");
      onClose();
      window.location.reload(); // Refresh dashboard to see new campaign

    } catch (error) {
      console.error("Creation failed:", error);
      // Handle user rejection specifically or general errors
      const errorMessage = error.code === 4001 
        ? "Transaction rejected by user." 
        : error.message || "Transaction failed";
      showNotification(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative animate-scale-up"
        onClick={handleContentClick}
      >
        {/* Modal Header */}
        <div className="p-6 sm:p-8 border-b dark:border-gray-700 text-center relative">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">Start Your Campaign</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Bring your idea to life on the blockchain.</p>
          
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
          
          {/* Section 1: The Big Idea */}
          <div className="space-y-4 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
            <h2 className="font-bold text-xl flex items-center text-yellow-500">
              <Lightbulb className="h-6 w-6 mr-2" />
              1. The Big Idea
            </h2>
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Campaign Title</label>
              <input 
                type="text" 
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Community Garden for our Neighborhood"
                className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                required
              />
            </div>
          </div>
          
          {/* Section 2: Your Story & Media */}
          <div className="space-y-4">
            <h2 className="font-bold text-xl flex items-center text-gray-700 dark:text-gray-300">
                <FileText className="h-6 w-6 mr-2" />
                2. Your Story & Media
            </h2>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Campaign Description</label>
              <textarea 
                id="description" 
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="6"
                placeholder="Tell your story... Why is this project important? Who will it help?"
                className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                required
              ></textarea>
            </div>
            <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Campaign Image URL</label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input 
                    type="url" 
                    id="image"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="https://example.com/image.png"
                    className="w-full p-2 pl-10 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Paste a direct link to an image (JPG/PNG).</p>
            </div>
          </div>

          {/* Section 3: Funding & Deadline */}
          <div className="space-y-4">
            <h2 className="font-bold text-xl flex items-center text-green-500">
                <Bitcoin className="h-6 w-6 mr-2" />
                3. Funding & Timeline
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="target" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Funding Goal (ETH)</label>
                    <input 
                        type="number" 
                        id="target"
                        name="target"
                        value={formData.target}
                        onChange={handleChange}
                        placeholder="0.5"
                        step="0.0001"
                        className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                    <div className="relative">
                      <input 
                          type="date" 
                          id="deadline"
                          name="deadline"
                          value={formData.deadline}
                          onChange={handleChange}
                          className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                          required
                      />
                    </div>
                </div>
            </div>
          </div>
          
          <div className="pt-6 border-t dark:border-gray-700 flex justify-end gap-3">
            <Button variant="ghost" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button size="lg" type="submit" disabled={isLoading} className="min-w-[150px]">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Launch Campaign'
                )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCampaignModal;