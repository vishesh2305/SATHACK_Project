// src/pages/CreatecampaignPage.jsx

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LoaderCircle,
    Lightbulb,
    DollarSign,
    FileText,
    ImagePlus,
    X,
    ArrowLeft,
    ArrowRight,
    CheckCircle,
    Info,
    Rocket,
} from 'lucide-react';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';
import Web3 from 'web3';
import { CROWDFUNDING_ABI, CROWDFUNDING_CONTRACT_ADDRESS } from '../constants';
// 1. IMPORT the new Spline component (replaces FormWatcher)
import SplineCampaignVisual from '../components/SplineCampaignVisual.jsx'; 
import { useNotification } from '../contexts/NotificationProvider.jsx'; // 2. IMPORT THE HOOK

// ... (InputHelpBox and StepProgressBar components are unchanged) ...
const InputHelpBox = ({ title, text }) => (
    <div className="mt-2 p-3 bg-blue-50 dark:bg-gray-800/50 border border-blue-200 dark:border-gray-700/50 rounded-lg text-sm transition-all duration-300">
        <h4 className="font-semibold text-blue-700 dark:text-blue-300 flex items-center">
            <Info className="h-4 w-4 mr-2 flex-shrink-0" />
            {title}
        </h4>
        <p className="text-gray-600 dark:text-gray-400 mt-1">{text}</p>
    </div>
);

const StepProgressBar = ({ currentStep, steps }) => (
    <nav aria-label="Progress">
        <ol role="list" className="flex items-center">
            {steps.map((step, index) => {
                const stepIndex = index + 1;
                const isCompleted = stepIndex < currentStep;
                const isCurrent = stepIndex === currentStep;

                return (
                    <li key={step.name} className={`relative ${index !== steps.length - 1 ? 'flex-1' : ''}`}>
                        {isCompleted ? (
                            <div className="flex items-center font-semibold">
                                <span className="flex-shrink-0">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600">
                                        <CheckCircle className="h-6 w-6 text-white" aria-hidden="true" />
                                    </div>
                                </span>
                                <span className="ml-4 text-sm font-medium text-gray-900 dark:text-white">{step.name}</span>
                            </div>
                        ) : isCurrent ? (
                            <div className="flex items-center font-semibold" aria-current="step">
                                <span className="flex-shrink-0">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-blue-600">
                                        <span className="text-blue-600 dark:text-blue-400">{step.id}</span>
                                    </div>
                                </span>
                                <span className="ml-4 text-sm font-medium text-blue-600 dark:text-blue-400">{step.name}</span>
                            </div>
                        ) : (
                            <div className="flex items-center font-semibold">
                                <span className="flex-shrink-0">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-300 dark:border-gray-700">
                                        <span className="text-gray-500 dark:text-gray-400">{step.id}</span>
                                    </div>
                                </span>
                                <span className="ml-4 text-sm font-medium text-gray-500 dark:text-gray-400">{step.name}</span>
                            </div>
                        )}

                        {/* Connector */}
                        {index !== steps.length - 1 && (
                            <div className="absolute left-4 top-4 -ml-px mt-0.5 h-full w-0.5" aria-hidden="true">
                                <div className={`w-full h-full ${isCompleted ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}`} />
                            </div>
                        )}
                    </li>
                );
            })}
        </ol>
    </nav>
);


const CreateCampaignPage = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        title: '',
        promptText: '',
        description: '',
        fundingGoal: '',
        deadline: '',
        category: 'Community',
        mediaFiles: [],
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    
    // 3. REMOVE local notification state and useEffect
    // const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const { showNotification } = useNotification(); // 4. GET THE GLOBAL HOOK
    
    // --- STATE for 2D model interaction ---
    const [focusedField, setFocusedField] = useState(null);

    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const steps = [
        { id: '01', name: 'The Spark' },
        { id: '02', name: 'The Story' },
        { id: '03', name: 'The Goal' },
        { id: '04', name: 'The Visuals' },
        { id: '05', name: 'Review & Launch' },
    ];

    // 5. REMOVE the local notification useEffect
    /*
    useEffect(() => {
        if (notification.show) {
            const timer = setTimeout(() => {
                setNotification({ show: false, message: '', type: '' });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [notification.show]);
    */

    // ... (handleChange, handleFileChange, handleRemoveFile, getTodayString, validateStep, nextStep, prevStep are all unchanged) ...
    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
        if (errors[id]) {
            setErrors(prev => ({ ...prev, [id]: null }));
        }
    };

    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        setFormData(prev => ({ ...prev, mediaFiles: [...prev.mediaFiles, ...files] }));
        if (errors.media) {
            setErrors(prev => ({ ...prev, media: null }));
        }
    };

    const handleRemoveFile = (index) => {
        setFormData(prev => ({
            ...prev,
            mediaFiles: prev.mediaFiles.filter((_, i) => i !== index)
        }));
    };

    const getTodayString = () => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const validateStep = () => {
        const newErrors = {};
        switch (currentStep) {
            case 1: // The Spark
                if (!formData.title.trim()) newErrors.title = "A catchy title is required.";
                if (formData.title.trim().length < 5) newErrors.title = "Title must be at least 5 characters.";
                break;
            case 2: // The Story
                if (!formData.description.trim()) newErrors.description = "Your story is essential.";
                if (formData.description.trim().length < 50) newErrors.description = "Story must be at least 50 characters to be compelling.";
                if (!formData.promptText.trim()) newErrors.promptText = "A brief goal helps donors understand quickly.";
                break;
            case 3: // The Goal
                if (!formData.fundingGoal) newErrors.fundingGoal = "Funding goal is required.";
                if (parseFloat(formData.fundingGoal) <= 0) newErrors.fundingGoal = "Funding goal must be greater than 0.";
                if (!formData.deadline) {
                    newErrors.deadline = "Campaign deadline is required.";
                } else {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const deadlineParts = formData.deadline.split('-').map(Number);
                    const selectedDate = new Date(deadlineParts[0], deadlineParts[1] - 1, deadlineParts[2]);
                    if (selectedDate < today) {
                        newErrors.deadline = "Deadline must be today or a future date.";
                    }
                }
                break;
            case 4: // The Visuals
                if (formData.mediaFiles.length === 0) newErrors.media = "At least one image or video is required.";
                break;
            default:
                break;
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const nextStep = () => {
        if (validateStep()) {
            if (currentStep < steps.length) {
                setCurrentStep(prev => prev + 1);
            }
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleLaunchCampaign = async (event) => {
        event.preventDefault();
        if (!validateStep()) {
            // 6. REPLACE setNotification with showNotification
            showNotification('Please review all steps, some information is missing.', 'error');
            return;
        }

        // setNotification({ show: false, message: '', type: '' }); // No longer needed
        setIsLoading(true);
        
        try {
            const aiResponse = await fetch('http://127.0.0.1:5001/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description: formData.description }),
            });
            if (!aiResponse.ok) throw new Error('AI server responded with an error.');
            const aiData = await aiResponse.json();
            if (aiData.prediction !== 'Genuine') {
                // 7. REPLACE setNotification with showNotification
                showNotification(`Campaign Flagged: Our AI has doubts about this campaign (${aiData.prediction}). Please revise your description.`, 'error');
                setIsLoading(false);
                setCurrentStep(2); // Go back to the story step
                return;
            }
            // 8. REPLACE setNotification with showNotification
            showNotification('AI check passed! Please confirm the transaction in your wallet.', 'info');
        } catch (aiError) {
            console.error("AI prediction failed:", aiError);
            // 9. REPLACE setNotification with showNotification
            showNotification('Could not connect to the AI analysis server. Please try again later.', 'error');
            setIsLoading(false);
            return;
        }

        try {
            if (!window.ethereum) {
                // 10. REPLACE setNotification with showNotification
                showNotification('Please install MetaMask to create a campaign!', 'error');
                setIsLoading(false);
                return;
            }
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const web3 = new Web3(window.ethereum);
            const accounts = await web3.eth.getAccounts();
            const userAddress = accounts[0];
            const contract = new web3.eth.Contract(CROWDFUNDING_ABI, CROWDFUNDING_CONTRACT_ADDRESS);
            const targetInWei = web3.utils.toWei(formData.fundingGoal, 'ether');
            const deadlineParts = formData.deadline.split('-').map(Number);
            const deadlineDate = new Date(deadlineParts[0], deadlineParts[1] - 1, deadlineParts[2]);
            deadlineDate.setHours(23, 59, 59, 999);
            const deadlineInSeconds = Math.floor(deadlineDate.getTime() / 1000);

            // TODO: Upload mediaFiles to IPFS/Filecoin and get the hash
            const imageUrl = "https://placehold.co/600x400/94a3b8/ffffff?text=Daan+Campaign"; // Placeholder

            await contract.methods.createCampaign(
                formData.title,
                formData.description,
                targetInWei,
                deadlineInSeconds,
                imageUrl
            ).send({ from: userAddress, gas: 3000000 });

            // 11. REPLACE setNotification with showNotification
            showNotification('Campaign created successfully! Redirecting...', 'success');
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (error) {
            console.error("Error creating campaign:", error);
            // 12. REPLACE setNotification with showNotification
            showNotification(`Transaction failed: User denied transaction or an error occurred.`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // ... (renderStepContent is unchanged) ...
    const renderStepContent = () => {
        // We add a key to the wrapping div to force React to re-mount
        // and trigger the fade-in animation on each step change.
        switch (currentStep) {
            case 1: // The Spark
                return (
                    <div key={1} className="animate-step-in space-y-6">
                        <Card className="p-6 sm:p-8 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-lg">
                            <h2 className="font-bold text-2xl mb-6 flex items-center">
                                <Lightbulb className="h-6 w-6 mr-3 text-yellow-500" />
                                Let's start with the basics.
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="title" className="block text-lg font-semibold text-gray-800 dark:text-white mb-2">What's your campaign's title?</label>
                                    <input type="text" id="title" value={formData.title} onChange={handleChange} placeholder="e.g., Community Garden for our Neighborhood" 
                                        onFocus={() => setFocusedField('title')}
                                        onBlur={() => setFocusedField(null)}
                                        className={`w-full p-3 border ${errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg bg-gray-50 dark:bg-gray-700 text-lg`} />
                                    {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                                    <InputHelpBox 
                                        title="Pro Tip"
                                        text="A great title is short, specific, and inspiring. Think about what would make *you* want to click!"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="category" className="block text-lg font-semibold text-gray-800 dark:text-white mb-2">Which category does it fit best?</label>
                                    <select id="category" value={formData.category} onChange={handleChange} 
                                        onFocus={() => setFocusedField('category')}
                                        onBlur={() => setFocusedField(null)}
                                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-lg">
                                        <option>Community</option>
                                        <option>Health</option>
                                        <option>Education</option>
                                        <option>Environment</option>
                                        <option>Technology</option>
                                    </select>
                                    <InputHelpBox 
                                        title="Why categorize?"
                                        text="This helps donors find your project. 'Community' is a great catch-all if you're not sure."
                                    />
                                </div>
                            </div>
                        </Card>
                    </div>
                );
            case 2: // The Story
                return (
                    <div key={2} className="animate-step-in space-y-6">
                        <Card className="p-6 sm:p-8 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-lg">
                             <h2 className="font-bold text-2xl mb-6 flex items-center">
                                <FileText className="h-6 w-6 mr-3 text-blue-500" />
                                Tell your story.
                            </h2>
                             <div className="space-y-4">
                                <div>
                                    <label htmlFor="description" className="block text-lg font-semibold text-gray-800 dark:text-white mb-2">What's your "Why"?</label>
                                    <textarea id="description" rows="10" value={formData.description} onChange={handleChange} placeholder="Tell your story... Why is this project important? Who will it help? Be detailed!" 
                                        onFocus={() => setFocusedField('description')}
                                        onBlur={() => setFocusedField(null)}
                                        className={`w-full p-3 border ${errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg bg-gray-50 dark:bg-gray-700 text-base`} />
                                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                                    <InputHelpBox 
                                        title="Be authentic!"
                                        text="This is the most important part. Be personal and clear. Explain the problem and how your project is the solution. A minimum of 50 characters is recommended."
                                    />
                                </div>
                                <div>
                                    <label htmlFor="promptText" className="block text-lg font-semibold text-gray-800 dark:text-white mb-2">What's the one-sentence summary?</label>
                                    <textarea id="promptText" rows="2" value={formData.promptText} onChange={handleChange} placeholder="e.g., To build a garden where local families can grow their own fresh vegetables." 
                                        onFocus={() => setFocusedField('promptText')}
                                        onBlur={() => setFocusedField(null)}
                                        className={`w-full p-3 border ${errors.promptText ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg bg-gray-50 dark:bg-gray-700 text-base`} />
                                    {errors.promptText && <p className="text-red-500 text-sm mt-1">{errors.promptText}</p>}
                                    <InputHelpBox 
                                        title="The 'Elevator Pitch'"
                                        text="This short goal description is often shown on the campaign card. Make it count!"
                                    />
                                </div>
                            </div>
                        </Card>
                    </div>
                );
            case 3: // The Goal
                return (
                    <div key={3} className="animate-step-in space-y-6">
                        <Card className="p-6 sm:p-8 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-lg">
                            <h2 className="font-bold text-2xl mb-6 flex items-center">
                                <DollarSign className="h-6 w-6 mr-3 text-green-500" />
                                Let's talk numbers.
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="fundingGoal" className="block text-lg font-semibold text-gray-800 dark:text-white mb-2">Funding Goal (in ETH)</label>
                                    <input type="number" id="fundingGoal" step="0.01" value={formData.fundingGoal} onChange={handleChange} placeholder="e.g., 5" 
                                        onFocus={() => setFocusedField('fundingGoal')}
                                        onBlur={() => setFocusedField(null)}
                                        className={`w-full p-3 border ${errors.fundingGoal ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg bg-gray-50 dark:bg-gray-700 text-lg`} />
                                    {errors.fundingGoal && <p className="text-red-500 text-sm mt-1">{errors.fundingGoal}</p>}
                                    <InputHelpBox 
                                        title="Be realistic!"
                                        text="Start with the minimum amount you need to get your project off the ground. You can always raise more!"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="deadline" className="block text-lg font-semibold text-gray-800 dark:text-white mb-2">When's the deadline?</label>
                                    <input type="date" id="deadline" value={formData.deadline} onChange={handleChange} min={getTodayString()} 
                                        onFocus={() => setFocusedField('deadline')}
                                        onBlur={() => setFocusedField(null)}
                                        className={`w-full p-3 border ${errors.deadline ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg bg-gray-50 dark:bg-gray-700 text-lg`} />
                                    {errors.deadline && <p className="text-red-500 text-sm mt-1">{errors.deadline}</p>}
                                    <InputHelpBox 
                                        title="Create urgency"
                                        text="Most successful campaigns run for 30-60 days. Don't set it too far in the future!"
                                    />
                                </div>
                            </div>
                        </Card>
                    </div>
                );
            case 4: // The Visuals
                return (
                    <div key={4} className="animate-step-in space-y-6">
                        <Card className="p-6 sm:p-8 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-lg">
                            <h2 className="font-bold text-2xl mb-6 flex items-center">
                                <ImagePlus className="h-6 w-6 mr-3 text-purple-500" />
                                Show us your vision.
                            </h2>
                            <div>
                                <label className="block text-lg font-semibold text-gray-800 dark:text-white mb-2">Campaign Media</label>
                                <div className={`border-2 border-dashed ${errors.media ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50`} 
                                    onClick={() => {
                                        fileInputRef.current.click();
                                        setFocusedField('media'); // <-- Set focus
                                    }}
                                    onFocus={() => setFocusedField('media')} // <-- Set focus
                                    onBlur={() => setFocusedField(null)}
                                    tabIndex={0} // Make it focusable
                                >
                                    <ImagePlus className="h-12 w-12 mx-auto text-gray-400" />
                                    <p className="mt-2 text-lg text-gray-600 dark:text-gray-400"><span className="font-semibold text-blue-600 dark:text-blue-400">Upload Images & Videos</span></p>
                                    <p className="text-sm text-gray-500">A great cover image is essential.</p>
                                    <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple accept="image/*,video/*" className="hidden"/>
                                </div>
                                {errors.media && <p className="text-red-500 text-sm mt-1">{errors.media}</p>}
                                <InputHelpBox 
                                    title="A picture is worth..."
                                    text="Upload at least one high-quality image. A short video explaining your project is even better!"
                                />
                                {formData.mediaFiles.length > 0 && (
                                    <div className="mt-6">
                                        <h4 className="font-semibold mb-2">Uploaded Files:</h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                            {formData.mediaFiles.map((file, index) => (
                                                <div key={index} className="relative aspect-square group">
                                                    {file.type.startsWith('image/') ? <img src={URL.createObjectURL(file)} alt={`preview ${index}`} className="w-full h-full object-cover rounded-lg shadow-md"/> : <video src={URL.createObjectURL(file)} className="w-full h-full object-cover rounded-lg shadow-md"/>}
                                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveFile(index)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                );
            case 5: // Review & Launch
                return (
                    <div key={5} className="animate-step-in space-y-6">
                        <Card className="p-6 sm:p-8 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-lg">
                            <h2 className="font-bold text-2xl mb-6 flex items-center">
                                <CheckCircle className="h-6 w-6 mr-3 text-green-500" />
                                One final look.
                            </h2>
                            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">Does everything look correct? You're one step away from launching your campaign to the world.</p>
                            
                            <div className="space-y-4 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                                <h3 className="font-bold text-xl text-gray-800 dark:text-white">Your Campaign Summary</h3>
                                <div className="flow-root">
                                    <dl className="-my-4 divide-y divide-gray-200 dark:divide-gray-700">
                                        <div className="flex items-center justify-between py-4">
                                            <dt className="text-base font-medium text-gray-600 dark:text-gray-400">Title</dt>
                                            <dd className="text-base font-semibold text-gray-900 dark:text-white text-right">{formData.title}</dd>
                                        </div>
                                        <div className="flex items-center justify-between py-4">
                                            <dt className="text-base font-medium text-gray-600 dark:text-gray-400">Category</dt>
                                            <dd className="text-base font-semibold text-gray-900 dark:text-white text-right">{formData.category}</dd>
                                        </div>
                                        <div className="flex items-center justify-between py-4">
                                            <dt className="text-base font-medium text-gray-600 dark:text-gray-400">Funding Goal</dt>
                                            <dd className="text-base font-semibold text-gray-900 dark:text-white text-right">{formData.fundingGoal} ETH</dd>
                                        </div>
                                        <div className="flex items-center justify-between py-4">
                                            <dt className="text-base font-medium text-gray-600 dark:text-gray-400">Deadline</dt>
                                            <dd className="text-base font-semibold text-gray-900 dark:text-white text-right">{new Date(formData.deadline).toLocaleDateString()}</dd>
                                        </div>
                                        <div className="flex items-center justify-between py-4">
                                            <dt className="text-base font-medium text-gray-600 dark:text-gray-400">Media Files</dt>
                                            <dd className="text-base font-semibold text-gray-900 dark:text-white text-right">{formData.mediaFiles.length} file(s)</dd>
                                        </div>
                                        <div className="flex flex-col py-4">
                                            <dt className="text-base font-medium text-gray-600 dark:text-gray-400 mb-2">Description</dt>
                                            <dd className="text-sm font-normal text-gray-700 dark:text-gray-300 whitespace-pre-wrap max-h-32 overflow-y-auto bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                                                {formData.description}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>
                        </Card>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <main className="container mx-auto px-4 pt-32 pb-16 min-h-screen">
            {/* 13. REMOVE the local notification rendering */}
            {/*
            {notification.show && (
                <div className="max-w-6xl mx-auto mb-4">
                    <Notification 
                        message={notification.message} 
                        type={notification.type}
                        onClose={() => setNotification({ show: false, message: '', type: '' })}
                    />
                </div>
            )}
            */}
            
            {/* --- Main Content Area --- */}
            <div className="max-w-6xl mx-auto">
                {/* --- Progress Bar (Full Width) --- */}
                <div className="mb-12">
                    <StepProgressBar currentStep={currentStep} steps={steps} />
                </div>

                {/* --- Two-Column Layout --- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
                    
                    {/* --- 2. LEFT COLUMN (The Spline Visual) --- */}
                    {/* Finalized layout: Large, sticky, no padding/border */}
                    <div className="w-full h-[60vh] lg:h-full lg:min-h-[800px] lg:sticky lg:top-32 flex items-center justify-center">
                        {/* REPLACED FormWatcher with SplineCampaignVisual */}
                        <SplineCampaignVisual focusedField={focusedField} />
                    </div>

                    {/* --- RIGHT COLUMN (The "Form") --- */}
                    <div className="w-full">
                        <form onSubmit={handleLaunchCampaign} noValidate>
                            {/* --- Step Content --- */}
                            <div className="min-h-[500px]">
                                {renderStepContent()}
                            </div>

                            {/* --- Navigation Buttons --- */}
                            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                <Button 
                                    type="button"
                                    variant="outline"
                                    onClick={prevStep}
                                    disabled={currentStep === 1 || isLoading}
                                    className={`transition-all ${currentStep === 1 ? 'opacity-0 invisible' : 'opacity-100 visible'}`}
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back
                                </Button>
                                
                                {currentStep < steps.length ? (
                                    <Button 
                                        type="button"
                                        variant="default"
                                        size="lg"
                                        onClick={nextStep}
                                    >
                                        Next
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                ) : (
                                    <Button 
                                        type="submit"
                                        size="lg"
                                        className="bg-green-600 hover:bg-green-700 focus:ring-green-500"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? <LoaderCircle className="animate-spin" /> : (
                                            <>
                                                <Rocket className="h-5 w-5 mr-2" />
                                                Launch Campaign
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default CreateCampaignPage;