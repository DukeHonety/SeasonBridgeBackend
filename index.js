const express = require("express");
const app = express();

const env = require("dotenv").config();
const Web3 = require('web3');
// const bridgeABI = require('./abi/bridgeABI.json');
const ethBridgeABI = require('./abi/ethBridgeABI.json');
const bscBridgeABI = require('./abi/bscBridgeABI.json');
const springABI = require('./abi/springABI.json');

const etherProvider = new Web3.providers.WebsocketProvider(process.env.ETHER_RPC);
const bscProvider = new Web3.providers.WebsocketProvider(process.env.BSC_RPC);

const etherWeb3 = new Web3(etherProvider);
const bscWeb3 = new Web3(bscProvider);
const pvKey = process.env.PRIVATE_KEY;
const myAccount = etherWeb3.eth.accounts.privateKeyToAccount(pvKey).address;
// bridge contract
const etherBridgeAddress = process.env.ETHER_BRDIGE_ADDRESS;
const etherBridge = new etherWeb3.eth.Contract(ethBridgeABI, etherBridgeAddress);

const bscBridgeAddress = process.env.BSC_BRDIGE_ADDRESS;
const bscBridge = new bscWeb3.eth.Contract(bscBridgeABI, bscBridgeAddress);

// Season contract
const etherSpringAddr = process.env.ETHER_SPRING_TOKEN;
const etherSpring = new etherWeb3.eth.Contract(springABI, etherSpringAddr);
const bscSpringAddr = process.env.BSC_SPRING_TOKEN;
const bscSpring = new bscWeb3.eth.Contract(springABI, bscSpringAddr);

async function bscFinalizeSwap(result){
  const token = result.token;
  const amount = result.amount;
  switch(token){
    case etherSpringAddr:

      break;
  }
  let user_addr = "dummy addr"
  let user_cash = "dummy cash"
  let userInfo = [user_addr, user_cash];
  let payment_user = web3.utils.toHex(userInfo);
  console.log(payment_user);

  // let signedTx = await bscWeb3.eth.accounts.signTransaction(
  //     {
  //         from: bscBridgeAddress,
  //         to: myAccount,
  //         data: encodedABI,
  //         gas: 300000,
  //         value: 0
  //     },
  //     pvKey
  // );
  // try {
  //     const success = await bscWeb3.eth.sendSignedTransaction(signedTx.rawTransaction);
  //     console.log(success);
  // } catch (e) {
  //     console.log(e);
  // }
}

async function etherFinalizeSwap(tokenAddr, amount){
  let data = bscBridge.methods.finalizeSwap(tokenAddr, amount);
    let encodedABI = data.encodeABI();
    let signedTx = await web3.eth.accounts.signTransaction(
        {
            from: myAccount,
            to: bscBridgeAddress,
            data: encodedABI,
            gas: 300000,
            value: 0
        },
        pvKey
    );
    try {
        const success = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        console.log(success);
    } catch (e) {
        console.log(e);
    }
}

etherBridge.events.SwappedFromEth({
  filter: {tokenAddr: etherSpringAddr}})
  .on('data', function(event){
    console.log('event: ', event);
    bscFinalizeSwap(event.returnValues);
  })
  .on('error', console.error);

bscBridge.events.SwappedFromBsc()
  .on('data', function(event){
    console.log('event: ', event);
    // etherFinalizeSwap(etherTokenAddr, event.returnValues.amount);
  })
  .on('error', console.error);



const port = parseInt(process.env.PORT || 3000);

app.listen(port, ()=> {
  console.log(`Server running on port ${port}`);
});