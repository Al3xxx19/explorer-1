#!/usr/bin/env node

/*
    Endpoint for client interface with ERC-20 tokens
*/



var BigNumber = require('bignumber.js');
var etherUnits = require(__lib + "etherUnits.js")

const ABI = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"tokens","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"tokens","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"tokenOwner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"acceptOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"to","type":"address"},{"name":"tokens","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"tokens","type":"uint256"},{"name":"data","type":"bytes"}],"name":"approveAndCall","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"newOwner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"tokenAddress","type":"address"},{"name":"tokens","type":"uint256"}],"name":"transferAnyERC20Token","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"tokenOwner","type":"address"},{"name":"spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"tokens","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"tokenOwner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"tokens","type":"uint256"}],"name":"Approval","type":"event"}];


//token conctract template
var zeroTokenStruct = null;
var ZeroTokenClass = null;


//load token conctract template
function loadAndCompileTokenSol(){
    console.log("load token conctract");
    var  fs  = require("fs");
    var solFilePath = "./contractTpl/ZeroToken.sol";//w 
    source = fs.readFileSync(solFilePath, "utf8");
    // fs.closeSync(solFilePath);
    let solc = require("solc");
    solc.loadRemoteVersion("soljson-v0.4.21+commit.dfe3193c.js");
    compiledContract = solc.compile(source, 1);
    return compiledContract.contracts['ZeroToken'];
    
}

//create token conctract
function createZeroTokenInstance(){
    if(zeroTokenStruct==null){
        var eth = require('./web3relay').eth;
        zeroTokenStruct = loadAndCompileTokenSol();
        let abi = zeroTokenStruct.interface;
        let bytecod = zeroTokenStruct.bytecod;
        let gasEstimate = eth.gasEstimate(bytecod);
        console.log("gaseEstimate:", gasEstimate);
        ZeroTokenClass = eth.contract(JSON.parse(abi));
    }

    console.log("//create token contract");
    let zeroTokenInstance = ZeroTokenClass.new();
    zeroTokenInstance.symbol = "ZT";
    zeroTokenInstance.name = "ZeroToken";
    zeroTokenInstance.decimals = 18;
    zeroTokenInstance._totalSupply = 1000000 * 10**uint(decimals);
    zeroTokenInstance.balances[owner] = zeroTokenInstance._totalSupply;
    zeroTokenInstance.Transfer(zeroTokenInstance.address(0), zeroTokenInstance.owner, zeroTokenInstance._totalSupply);//w 
    
    return zeroTokenInstance;
}

module.exports = function(req, res){
  // console.log(req.body)
  var contractAddress = req.body.address;
  var fromAccount = req.body.fromAccount;
  if (!("action" in req.body))
    res.status(400).send();
  else if (req.body.action=="info") {
    try {
      // createZeroTokenInstance();
      var mongoose = require( 'mongoose' );
      var Transaction = mongoose.model( 'Transaction' );
      var mongoose = require( 'mongoose' );
      var Contract   = mongoose.model( 'Contract' );
      var tokenData;
      var count = 0;
      Transaction.count({'to':contractAddress}).exec().then(function(result){count = result});
      var contractFind = Contract.findOne({address:contractAddress}).lean(true);
      contractFind.exec(function(err, doc){
        if(!err && doc){
          var dbToken = doc;
          tokenData = {
            "balance": dbToken.balance,
            "totalSupply": dbToken.totalSupply,//dbToken.totalSupply.toEther(actualBalance, 'wei');
            "tokenHolders": 2,//tt fix, wait to dev
            "count": count,
            "name": dbToken.contractName,
            "symbol": dbToken.symbol,
            "bytecode": dbToken.byteCode,
            "transaction": dbToken.creationTransaction,
            "creator": dbToken.owner,
            "decimals": dbToken.decimals,
            "isVerified":dbToken.sourceCode!=null
          }
          if(fromAccount){
            var eth = require('./web3relay').eth;
            var ContractStruct = eth.contract(ABI);
            var TokenInst = ContractStruct.at(contractAddress);
            tokenData.tokenNum = TokenInst.balanceOf(fromAccount);
          }
          res.write(JSON.stringify(tokenData));
          res.end();
        }else{//find from blockChain
          var data ={};
          var eth = require('./web3relay').eth;
          data.balance = eth.getBalance(contractAddress);
          var bytecode = eth.getCode(contractAddress);
          data.byteCode = bytecode;
          var txFind = Transaction.findOne({'to':null, 'contractAddress':contractAddress}).lean(true);
          txFind.exec(function (err, doc) {
            if(!err && doc){
              data.creationTransaction = doc.hash;
              data.owner = doc.from;
            }
            tokenData = {
              "balance": data.balance,
              "tokenHolders": 2,//tt fix, wait to dev
              "count": count,
              "transaction": data.creationTransaction,
              "creator": data.owner,
              "isVerified":false
            }
            res.write(JSON.stringify(tokenData));
            res.end();
          })
        }
      })
      
    } catch (e) {
      console.error(e);
    }
  } else if (req.body.action=="balanceOf") {
    var eth = require('./web3relay').eth;
    var ContractStruct = eth.contract(ABI);
    var addr = req.body.user.toLowerCase();
    try {
      var Token = ContractStruct.at(contractAddress);
      var tokens = Token.balanceOf(addr);
      // tokens = etherUnits.toEther(tokens, 'wei')*100;
      res.write(JSON.stringify({"tokens": tokens}));
      res.end();
    } catch (e) {
      console.error(e);
    }
  } else if (req.body.action=="create") {//create token contract
    try{
      let zeroTokenInstance = createZeroTokenInstance();
    } catch (e) {
      console.error(e);
    }
  }else if (req.body.action=="contractTransaction") {
    var respData = "";
    try{
      console.log("respone contractTransaction");
      var mongoose = require( 'mongoose' );
      var Transaction = mongoose.model( 'Transaction' );
      transactionFind = Transaction.find({to:req.body.address}).lean(true);
      transactionFind.exec(function (err, docs) {
      espData = JSON.stringify(docs);
      res.write(espData);
      res.end();
      });
    } catch (e) {
      console.error(e);
    }
    
  }else if(req.body.action=="tokenTransfer"){
    var respData = "";
    try{
      console.log("respone TokenTransfer");
      var mongoose = require( 'mongoose' );
      var TokenTransfer = mongoose.model( 'TokenTransfer' );
      var findCond;
      if(fromAccount){
        findCond = {contractAdd:req.body.address, $or:[{"to": fromAccount}, {"from": fromAccount}]};
      }else{
        findCond = {contractAdd:req.body.address}; 
      }
      tokenTransferFind = TokenTransfer.find(findCond).lean(true);
      tokenTransferFind.exec(function (err, docs) {
      respData = JSON.stringify(docs);
      res.write(respData);
      res.end();
      });
    } catch (e) {
      console.error(e);
    }
  }
  
};  

const MAX_ENTRIES = 50;