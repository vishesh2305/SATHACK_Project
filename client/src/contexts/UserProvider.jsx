import React, { createContext, useContext, useState, useEffect } from 'react';
import Web3 from 'web3';
import { CROWDFUNDING_ABI, CROWDFUNDING_CONTRACT_ADDRESS } from '../constants';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null); // For backend auth (optional)
    const [address, setAddress] = useState(null); // MetaMask Wallet Address
    const [contract, setContract] = useState(null); // Smart Contract Instance
    const [web3, setWeb3] = useState(null); // Web3 Instance

    // 1. Initialize Web3 and Contract on load (if wallet is already connected)
    useEffect(() => {
        const initWeb3 = async () => {
            if (window.ethereum) {
                const web3Instance = new Web3(window.ethereum);
                setWeb3(web3Instance);

                try {
                    // Create Contract Instance
                    const contractInstance = new web3Instance.eth.Contract(
                        CROWDFUNDING_ABI,
                        CROWDFUNDING_CONTRACT_ADDRESS
                    );
                    setContract(contractInstance);

                    // Check if user is already connected
                    const accounts = await web3Instance.eth.getAccounts();
                    if (accounts.length > 0) {
                        setAddress(accounts[0]);
                    }
                    
                    // Listen for account changes
                    window.ethereum.on('accountsChanged', (accounts) => {
                        if (accounts.length > 0) setAddress(accounts[0]);
                        else setAddress(null);
                    });

                } catch (error) {
                    console.error("Error initializing Web3", error);
                }
            }
        };
        initWeb3();
    }, []);

    // 2. Function to manually connect wallet
    const connectWallet = async () => {
        if (!window.ethereum) return alert("Please install MetaMask!");
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            setAddress(accounts[0]);
        } catch (error) {
            console.error("Connection failed", error);
        }
    };

    return (
        <UserContext.Provider value={{ user, setUser, address, contract, web3, connectWallet }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);