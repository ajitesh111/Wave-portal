const main = async () => {
    const [owner, randomPerson] = await hre.ethers.getSigners();
    const waveContractFactory = await hre.ethers.getContractFactory("WavePortal");
    const waveContract = await waveContractFactory.deploy({
        value: hre.ethers.utils.parseEther("0.1")           //telling to contract to deploy and fund the contract ith 0.1 eth
    });
    await waveContract.deployed();

    console.log("Contract deployed to:", waveContract.address);
    console.log("contract deployed by:", owner.address);

    let contractBalance = await hre.ethers.provider.getBalance(waveContract.address);
    console.log("Contract balance: ", hre.ethers.utils.formatEther(contractBalance));

    let waveCnt;
    waveCnt = await waveContract.getWaves();

    let waveTxn = await waveContract.wave("A wave");
    await waveTxn.wait();

    // waveTxn = await waveContract.wave("A 2nd wave");         //return error "wait 15 minutes"
    // await waveTxn.wait();

    waveCnt = await waveContract.getWaves();

    waveTxn = await waveContract.connect(randomPerson).wave("A random person waving");
    await waveTxn.wait();

    contractBalance = await hre.ethers.provider.getBalance(waveContract.address);
    console.log("Contract balance: ", hre.ethers.utils.formatEther(contractBalance));

    let allWaves = await waveContract.getAllWaves();
    console.log(allWaves);

    waveCnt = await waveContract.getWaves();
}

const runMain = async () => {
    try {
        await main();
        process.exit(0);
    } catch (e) {
        console.log(e);
        process.exit(1);
    }
}

runMain();