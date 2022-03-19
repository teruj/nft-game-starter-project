import React, { useEffect, useState } from 'react';
import './SelectCharacter.css';
import LoadingIndicator from "../LoadingIndicator";
import {ethers} from "ethers";
import {CONTRACT_ADDRESS, transformCharacterData} from "../../constants";

import myEpicGame from "../../utils/MyEpicGame.json"

const SelectCharacter = ({ setCharacterNFT }) => {
  const [characters, setCharacters] = useState([]);
  const [gameContract,setGameContract] = useState(null);
  const [mintingCharacter, setMintingCharacter] = useState(false);

  const mintCharacterNFTAction = (characterId) => async()=>{
    try{
      if(gameContract){
        // Mint が開始されたら、ローディングマークを表示する。
        setMintingCharacter(true);

        console.log("Minting character in progress...");
        const mintTxn = await gameContract.mintCharacterNFT(characterId);
        await mintTxn.wait();
        console.log("mintTxn:",mintTxn);

        // Mint が終了したら、ローディングマークを消す。
        setMintingCharacter(false);
      }
    }catch(error){
      console.warn("MintCharacterAction Error:",error);

      // エラーが発生した場合も、ローディングマークを消す。
      setMintingCharacter(false);
    }
  };


  useEffect( ()=>{
    const {ethereum} = window;
    if(ethereum){
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );

      setGameContract(gameContract);


    }else{
      console.log("Ethereum object not found");

    }
  } ,[] );

  useEffect( ()=>{

    const getCharacters = async()=>{
      try{
        console.log("Getting contract characters to mint");
        const charactersTxn = await gameContract.getAllDefaultCharacters();

        const characters = charactersTxn.map((characterData)=>
        transformCharacterData(characterData));

        setCharacters(characters);
      }catch(error){
        console.error("Something went wrong fetching characters:", error);
      }
    }

    // イベントを受信したときに起動するコールバックメソッド onCharacterMint を追加します。
    const onCharacterMint = async (sender, tokenId, characterIndex) => {
      console.log(
        `CharacterNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex.toNumber()}`
      );
      // NFT キャラクターが Mint されたら、コントラクトからメタデータを受け取り、アリーナ（ボスとのバトルフィールド）に移動するための状態に設定します。
      if (gameContract) {
        const characterNFT = await gameContract.checkIfUserHasNFT();
        console.log('CharacterNFT: ', characterNFT);
        setCharacterNFT(transformCharacterData(characterNFT));
        alert(`NFT キャラクーが Mint されました -- リンクはこちらです: https://rinkeby.rarible.com/token/${gameContract.address}:${tokenId.toNumber()}?tab=details`)
      }
    };

    if (gameContract){
      getCharacters();
      gameContract.on('CharacterNFTMinted', onCharacterMint);
    }

    return()=>{
      if(gameContract){
        gameContract.off('CharacterNFTMinted', onCharacterMint);
      }
    };



  } ,[gameContract]);

  // NFT キャラクターをフロントエンドにレンダリングするメソッドです。
  const renderCharacters = () =>
      characters.map((character, index) => (
      <div className="character-item" key={character.name}>
        <div className="name-container">
          <p>{character.name}</p>
        </div>
        <img src={`https://cloudflare-ipfs.com/ipfs/${character.imageURI}`} alt={character.name} />
        <button
          type="button"
          className="character-mint-button"
          onClick={mintCharacterNFTAction(index)}
        >{`Mint ${character.name}`}</button>
      </div>
      ));
  



    return (
      <div className="select-character-container">
          <h2>⏬ 一緒に戦う NFT キャラクターを選択 ⏬</h2>
      {characters.length > 0 && (
        <div className="character-grid" >{renderCharacters()}</div>
      ) }
      
       {/* mintingCharacter = trueの場合のみ、ローディングマークを表示します。*/}
       {mintingCharacter && (
        <div className="loading">
          <div className="indicator">
            <LoadingIndicator />
            <p>Minting In Progress...</p>
          </div>
          <img
            src="https://i.imgur.com/JjXJ4Hf.gif"
            alt="Minting loading indicator"
          />
        </div>
      )}
      </div>
    );




};
export default SelectCharacter;