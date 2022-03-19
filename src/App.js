
import myEpicGame from "./utils/MyEpicGame.json";

import React, { useEffect, useState } from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';

import SelectCharacter from './Components/SelectCharacter';
import Arena from './Components/Arena';
import LoadingIndicator from './Components/LoadingIndicator';

import {ethers} from "ethers";

import { CONTRACT_ADDRESS, transformCharacterData } from "./constants";

// Constants
const TWITTER_HANDLE = 'あなたのTwitterハンドル';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {

    const [currentAccount, setCurrentAccount] = useState(null);
    const [characterNFT, setCharacterNFT] = useState(null);
    // ロード状態を初期化します。
    const [isLoading, setIsLoading] = useState(false);

    const checkNetwork  = async() => {
        try{
            if(window.ethereum.networkVersion !== "4" && window.ethereum.networkVersion !== "3"){
                alert("Test Network に接続してください。");
            }else{
                console.log("Testnet に接続されています。")
            }
        }catch(error){
            console.log(error);
        }
    }


    const checkIfWalletIsConnect = async ()=>{
        try{
            const {ethereum} = window;
            if (!ethereum){
                console.log("Make sure you have MetaMask.");

                // 次の行でreturnを使用するため、ここでisLoadingを設定します。
                setIsLoading(false);

                return;
            }else{
                console.log("We have the ethereum object.",ethereum);
            
                const accounts = await ethereum.request({method: "eth_accounts"});

                if (accounts.length !== 0) {
                    const account = accounts[0];
                    console.log("Found an authorized account: ", account);
                    setCurrentAccount(account); 
                    checkNetwork();
                }else{
                    console.log("No authorized account found");
                }

               
            }
        }catch(error){
            console.log(error);
        }    
    };

    const renderContent =()=>{
        // アプリがロード中の場合は、LoadingIndicatorをレンダリングします。
        if (isLoading) {
            return <LoadingIndicator />;
        }


        if(!currentAccount){
            return(
                <div className="connect-wallet-container">
                    <img 
                        src="https://i.imgur.com/yMocj5x.png"
                        alt="Pickachu"
                    />
                    <button 
                        className="cta-button connect-wallet-button"
                        onClick={connectWalletAction} >
                    Connect Wallet to Get Started
                    </button>


                </div>
            )
        }else if(currentAccount && !characterNFT){
            return <SelectCharacter setCharacterNFT={setCharacterNFT}/>;
        }else if (currentAccount && characterNFT) {
            return <Arena characterNFT={characterNFT} setCharacterNFT={setCharacterNFT}  />;
        }
    }



    const connectWalletAction = async() => {
        try{
            const {ethereum} = window;
            if (!ethereum) {
                alert("Get MetaMask");
                return;
            }

            const accounts = await ethereum.request({
                method: "eth_requestAccounts",
            });

            console.log("Connected", accounts[0]);
            setCurrentAccount(accounts[0]);

            checkNetwork();
        }catch(error){
            console.log(error);
        }
    };



    //ページがロードされたときにuseEffect内関数が呼び出される。
    useEffect( ()=>{
        checkIfWalletIsConnect();
    } ,[] );


    useEffect( ()=> {
        const fetchNFTMetadata = async() => {
            console.log("Checking for Character NFT an address: ",currentAccount);

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const gameContract = new ethers.Contract(
                CONTRACT_ADDRESS,
                myEpicGame.abi,
                signer
            );

            const txn = await gameContract.checkIfUserHasNFT();
            if(txn.name){
                console.log("User has character NFT");
                setCharacterNFT(transformCharacterData(txn));
            }else{
                console.log("No character NFT found");
            }

            // ユーザーが保持しているNFTの確認が完了したら、ロード状態を false に設定します。
	        setIsLoading(false);

        }

        if(currentAccount){
            console.log(("CurrentAccount: ",currentAccount));
            fetchNFTMetadata();
        }
    },[currentAccount]);

  
  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
        <p className="header gradient-text">⚡️ METAVERSE GAME ⚡️</p>
          <p className="sub-text">プレイヤーと協力してボスを倒そう✨</p>

            {renderContent()}

        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built with @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
