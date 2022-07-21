import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from './utils/WavePortal.json';
// import ProgressBar from 'react-bootstrap/ProgressBar';   //the progress bar was not getting rendered on the web page for this
import ProgressBar from './components/ProgressBar';
import TextField from '@mui/material/TextField';

export default function App() {

  const [ currentAccount, setCurrentAccount]= useState("");
  const [progress, setProgress] = useState('0');
  const [allWaves, setAllWaves] = useState([]);
  const [message, setMessage] = useState("");

  const contractAddress = "0x3cBd03400aa3234c0bf3C85647362036BA0e6233";
  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
  
      if(ethereum){
        console.log("found the ethereum object", ethereum);
      } else {
        console.log("ethereum object missing, make sure you have metamask");
        return;
      }
      
    const accounts = await ethereum.request({ method: "eth_accounts" })

      if(accounts.length !== 0) {
        const account = accounts[0];
        console.log("found an authorized account", account);
        setCurrentAccount(account);

        getAllWaves();
      } else {
        console.log("NO authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const connectWallet = async () => {
    try {
      const {ethereum } = window;

      if(!ethereum) {
        alert("Get MetaMask;!!")
      }

      const account = await ethereum.request({ method: "eth_requestAccounts" });  //causes metamask popup to appear, and returns the array of address

      setCurrentAccount(account[0]);
      console.log("Connected", account[0]);
    } catch (error) {
      console.log(error);
    }
  }

  const wave = async () => {
    try {
      setProgress(5);
      const { ethereum } = window;
      if(ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        setProgress(25);

        let count = await wavePortalContract.getWaves();
        console.log("retrieved total wave count: ", count.toNumber());

        setProgress(50);

        const waveTxn = await wavePortalContract.wave(message, { gasLimit: 300000});  //any excess gas not used will be refunded
        console.log("Mining...", waveTxn.hash);

        setProgress(75);

        await waveTxn.wait();
        console.log("Mined!!!", waveTxn.hash);

        setProgress(100);

        count = await wavePortalContract.getWaves();
        console.log("Retrieved total wave count: ", count.toNumber());
      } else  {
        console.log("ethereum object doesn't exist");
      }
    } catch (error) {
      console.log(error);
      setProgress(0);
    }
  }

  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if(ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        const waves = await wavePortalContract.getAllWaves();

        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          })
        });

        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const handleChange = (event) => {
    setMessage(event.target.value);
  }

  useEffect(() => {
    checkIfWalletIsConnected();

    let wavePortalContract;

    const onNewWave = (from, timestamp, message) => {
      console.log("New Wave", from, timestamp, message);
      setAllWaves(prevState => [
        ...prevState, 
        {
          address: from,
          timestamp: new Date(timestamp*1000),
          message: message
        }
      ])
    }

    if(window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      wavePortalContract.on("NewWave", onNewWave);    //listens to the "NewWave" event in real-time
    }

    return () => {                //return in effect is used for cleanup, triggered when the compnent unmounts
      if(wavePortalContract) {
        wavePortalContract.off("NewWave", onNewWave);
      }
    }
  }, [])
  
  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        👋 Hey there, thanks!
        </div>

        <div className="bio">
        I am fluckerrr and this is my first time!! so that's pretty cool right? Connect your Ethereum wallet and wave at me!
        </div>

        <TextField
          id="messageBox"
          label="write me a message"
          variant="filled"
          multiline
          value={message}
          onChange={handleChange}
        />

        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>

        {/* <ProgressBar now={progress} /> */}
        { (progress>0) && (
        <ProgressBar bgcolor="#99ff66" progress={progress} />
        )}

        {!currentAccount && (
          <button className="connectButton" onClick={connectWallet}>
            connect wallet
          </button>
        )}

        {allWaves.map((wave, index) => {
          return(
            <div key={index} style={{ backgroundColor: "#999999", marginTop: "16px", padding: "8px" }}>
              <div>Address: {wave.address} </div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message} </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
