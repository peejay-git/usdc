import React, { useEffect, useState } from "react";
import Head from "next/head";
import { ToastContainer } from "react-toastify";
import { ethers } from "ethers";
import { success, err, warn } from "../utils/responseMessages";
import "react-toastify/dist/ReactToastify.css";

// Import abi
import abi from "../utils/contract.json";

import usdcAbi from "../utils/usdcContract.json";

export default function Home() {
  const usdcContractAddress = "0x07865c6E87B9F70255377e024ace6630C1Eaa37F";

  const contractAddress = "0x1a4816a6559f63e253407938c61271ede76c9687";

  /**
   * Create a variable here that references the abi content!
   */
  const contractABI = abi;

  const [currentAccount, setCurrentAccount] = useState("");
  const [sending, setSending] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [approving, setApproving] = useState(false);
  const [amount, setAmount] = useState("");

  /**
   * Check if the user wallet is connected
   */
  const checkIfWalletIsConnected = async () => {
    try {
        if (typeof window.ethereum !== "undefined") {
            const accounts = await window.ethereum.request({ method: "eth_accounts" });

            if (accounts.length > 0) {
                const account = accounts[0];
                setCurrentAccount(account);
                success("🦄 Wallet is Connected!");
            } else {
                warn("Make sure you have an active Ethereum account.");
            }
        } else {
            warn("Please install a wallet extension like MetaMask.");
        }
    } catch (error) {
        err(`Error: ${error.message}`);
    }
};


/**
 * Connect the user's wallet
 */
const connectWallet = async () => {
  try {
      const { ethereum } = window;

      // Check if MetaMask is installed
      if (!ethereum) {
          warn("MetaMask is not installed. Please install MetaMask.");
          return;
      }

      // Request account access
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      if (accounts.length === 0) {
          warn("No Ethereum accounts found. Please create or unlock an Ethereum account in MetaMask.");
          return;
      }

      // Get the first account we get back
      const account = accounts[0];

      // Set the current account
      setCurrentAccount(account);

      // Display a success message to the user that they are connected
      success("🦄 Wallet is Connected!");
  } catch (error) {
      console.error(error);
      err(`Error connecting to the wallet: ${error.message}`);
  }
};


  // Check if the user has approved the contract to spend their USDC
  const fund = async (contractAddress, contractABI, amount) => {
    try {
        const { ethereum } = window;

        if (!ethereum) {
            warn("MetaMask is not installed. Please install MetaMask and connect your wallet.");
            return;
        }

        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        // Create a contract instance
        const fundContract = new ethers.Contract(contractAddress, contractABI, signer);

        console.log("Connected to contract");
        console.log("Amount:", amount);

        // Send the transaction
        const transaction = await fundContract.Fund(amount, {
            gasLimit: 300000,
        });

        console.log("Transaction hash:", transaction.hash);

        // Set the sending state to true
        setSending(true);

        // Wait for the transaction to be mined
        await transaction.wait();

        // Set the sending state to false
        setSending(false);

        console.log("Transaction mined:", transaction.hash);

        // Display a success message to the user
        success("🦄 Donation Sent Successfully!");
    } catch (error) {
        console.error(error);
        err(`Error sending donation: ${error.message}`);
    }
};


  // Check if the user has approved the contract to spend their USDC
  const Approve = async () => {
    try {
      const { ethereum } = window;

      // Check if User already connected a wallet
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        // Create a contract object
        const usdcContract = new ethers.Contract(
          usdcContractAddress,
          usdcAbi,
          signer
        );

        // Use the approve function to send USDC to the contract
        const usdcTxn = await usdcContract.approve(
          contractAddress,
          ethers.utils.parseUnits("1000", 6)
        );

        // Set the approving state to true
        setApproving(true);

        // Wait for the transaction to be mined
        await usdcTxn.wait();

        // Set the approving state to false
        setApproving(false);

        // Set the isApproved state to true
        setIsApproved(true);

        // Display a success message to the user
        success("🦄 USDC Approved Successfully!");
      }
    } catch (error) {
      err(`${error.message}`);
    }
  };

  /*
   * This runs our function when the page loads.
   */
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Head>
        <title>Usdc Demo</title>
        <meta name="description" content="Generated create next app" />
        <link rel="icon" href="/usdc-logo.ico" />
      </Head>

      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold text-blue-600 mb-6">
          Embrace the Power of USDC and Dance with the Pineapples! 🍍💃
        </h1>

        <div class="happy-marquee-container">
          <div class="happy-marquee">
            <p class="happy-text">
              Spread Happiness with USDC! 🌟 Make Everyone Smile! 😄 Join the Fun! 🎉
            </p>
          </div>
        </div>

        {currentAccount ? (
          <div className="w-full max-w-xs sticky top-3 z-50 ">
            <form className="shadow-md rounded px-8 pt-6 pb-8 mb-4">
              <div className="flex items-left justify-between">
                {isApproved ? (
                  <>
                    <input
                      type="number"
                      placeholder="Amount"
                      className="w-1/2 mr-4 rounded border border-gray-300 focus:outline-none focus:ring-3 focus:ring-blue-600 focus:border-transparent px-2 py-1 text-sm"
                      onChange={(e) => setAmount(e.target.value)}
                    />

                    <button
                      className="bg-blue-500 hover:bg-blue-700 text-center text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                      type="button"
                      onClick={Fund}
                    >
                      {sending ? "i know you are eager to dance, Please wait..." : "pay to dance"}
                    </button>
                  </>
                ) : (
                  <button
                    className="bg-white-900 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    type="button"
                    onClick={Approve}
                  >
                    {approving
                      ? `Approving, Please wait...`
                      : "Yes! I'd like to dance"}
                  </button>
                )}
              </div>
            </form>
          </div>         
        ) : (
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full shadow-lg mt-3 transition duration-300 ease-in-out transform hover:scale-105"
            onClick={connectWallet}
          >
            Connect Your Wallet
          </button>

        )}
      </main>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        draggable
        pauseOnHover={false}
      />
    </div>
  );
}
