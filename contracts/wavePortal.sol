// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "hardhat/console.sol";

contract WavePortal {
    // mapping(address => uint256) waveCount;
    // address[] private wavers;
    uint256 totalWaves;
    uint256 private seed;

    event NewWave(address indexed from, uint256 timestamp, string message); //stores the event log for transactions on the block-chain

    struct Wave{
        address waver;
        string message;
        uint256 timestamp;
    }

    Wave[] waves;

    mapping(address => uint256) public lastWavedAt;

    constructor () payable {
        console.log("yo! my first contract which happens to be smart!!");

        seed = (block.difficulty + block.timestamp)%100;
    }

    function wave(string memory _message) public {  //memory variable will not cause gas consumption as it is temp. storage
        // console.log("%s has waved", msg.sender);
        // wavers.push(msg.sender);
        // waveCount[msg.sender] += 1;

        require(lastWavedAt[msg.sender] + 30 seconds < block.timestamp, "wait 30 seconds");

        lastWavedAt[msg.sender] = block.timestamp;

        waves.push(Wave(msg.sender, _message, block.timestamp));
        totalWaves  += 1;

        seed = (block.timestamp + block.difficulty)%100;

        console.log("Random # generate: %d", seed);

        if(seed < 50) {
            console.log("%s won", msg.sender);

            uint256 prizeAmount = 0.0001 ether;
            require(prizeAmount <= address(this).balance, "the contract itself does not have sufficient eth");

            (bool success, ) = (msg.sender).call{value: prizeAmount}("");       //sending eth to 'sender'
            require(success, "failed to withdraw eth from tha contract");
        }

        emit NewWave(msg.sender, block.timestamp, _message);    //the frontent will listen to these emitted events and update UI
    }

    function getAllWaves() public view returns (Wave[] memory) {
        return waves;
    }

    function getWaves() public view returns (uint256) {
        console.log("we had %d total number of waves", totalWaves);
        // for(uint i=0; i<wavers.length; i++) {
        //     console.log("%s waved %d times", wavers[i], waveCount[wavers[i]]);
        // }
        return totalWaves;
    }
}
