require('dotenv').config()
const HDWalletProvider = require("@truffle/hdwallet-provider");
const Web3 = require("web3");

//https://raw.githubusercontent.com/pancakeswap/pancake-smart-contracts/master/projects/farms-pools/data/abi/contracts/MasterChef.sol/MasterChef.json
const masterChefAbi = require('./abis/MasterChef.json');
//https://github.com/pancakeswap/pancake-smart-contracts/blob/master/projects/farms-pools/data/abi/contracts/SyrupBar.sol/SyrupBar.json
const syrupBarAbi = require('./abis/SyrupBar.json');
//https://raw.githubusercontent.com/pancakeswap/pancake-smart-contracts/master/projects/farms-pools/data/abi/contracts/CakeToken.sol/CakeToken.json
const cakeTokenAbi = require('./abis/CakeToken.json');

const provider = new HDWalletProvider(process.env.MNEMONIC,process.env.PROVIDER);
const Web3Client = new Web3(provider);

//https://docs.pancakeswap.finance/code/migration/cake-syrup-pool
const masterChefAddress = "0x73feaa1eE314F8c655E354234017bE2193C9E24E"; 
//https://bscscan.com/address/0x009cF7bC57584b7998236eff51b98A168DceA9B0
const syrupBarAddress = "0x009cF7bC57584b7998236eff51b98A168DceA9B0";
//https://pancakeswap.finance/info/token/0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82
const cakeTokenAddress = "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82";

const syrupBarContract = new Web3Client.eth.Contract(syrupBarAbi, syrupBarAddress);
const masterChefContract = new Web3Client.eth.Contract(masterChefAbi, masterChefAddress);
const cakeTokenContract = new Web3Client.eth.Contract(cakeTokenAbi, cakeTokenAddress);

async function doTask() {

    const accounts = await Web3Client.eth.getAccounts()
    const account = accounts[0]

    const bnbBalance = await Web3Client.eth.getBalance(account)
    console.log("BNB "  + Web3Client.utils.fromWei(bnbBalance,'ether') )

    //Cake
    const cakeBalance = await cakeTokenContract.methods.balanceOf(account).call()
    const cakeSymbol  = await cakeTokenContract.methods.symbol().call()
    const cakeDecimals = await cakeTokenContract.methods.decimals().call()
    console.log(cakeSymbol + " " + (cakeBalance / 10 ** cakeDecimals).toLocaleString())
       
    //SyrupBar
    const syrupBarBalance = await syrupBarContract.methods.balanceOf(account).call()
    const syrupBarSymbol  = await syrupBarContract.methods.symbol().call()
    const syrupBarDecimals = await syrupBarContract.methods.decimals().call()
    console.log(syrupBarSymbol + " " + (syrupBarBalance / 10 ** syrupBarDecimals).toLocaleString())
   
    try {
        const result = await masterChefContract.methods.leaveStaking(syrupBarBalance).send({from: account, gasLimit: 250000})
        console.log(result)
    } catch (e) {
        console.log(e)
    }
}

doTask()