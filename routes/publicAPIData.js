#!/usr/bin/env node
var totalETZ = "totalETZ";
var eth = require("./web3relay").eth;
// var mongoose = require( 'mongoose' );
// var Witness = mongoose.model('Witness');
module.exports = function(req, res){
  var respData = "";
    try{
      methodName = req.query.methodName;
      if(methodName==totalETZ){
          totalBlockNum = eth.blockNumber;
          respData = 196263376+0.45*totalBlockNum;
          res.write(String(respData));
          res.end();
      }
    } catch (e) {
      res.write("{}");
      res.end();
      console.error(e);
    }
}; 

module.exports.getTotalEtz = function(req, res){
  totalBlockNum = eth.blockNumber;
  respData = 196263376+0.45*totalBlockNum;
  res.write(String(respData));
  res.end();
}