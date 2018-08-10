#!/usr/bin/env node
var mongoose = require( 'mongoose' );
var Block = mongoose.model('Block');

module.exports = function(req, res){
  var respData = "";
  var action = req.body.action;
  var witness = req.body.witness;

  if(action == "blocks"){
    try{
      var resultData={"blocks":null, "page":0};
      var page = req.body.page;
      if(isNaN(page) || Number(page)<0)
        page = 0;
      resultData.page = page;
      var pageSize = 10;
      //find witness block
      var blockFind = Block.find({'witness':witness}).sort('-number').skip(page*pageSize).limit(pageSize).lean(true);
      blockFind.exec(function (err, docs) {
          if(err) 
            resultData.blocks=[];
          else
            resultData.blocks=docs;
          respData = JSON.stringify(resultData);
          res.write(respData);
          res.end(); 
        });      
    } catch (e) {
      console.error(e);
      res.write('{}');
      res.end();
    }


  }else if(action == "metadata"){//witness metadata
    var resultData={"balance":0, "totalBlocks":0};
    
    var Witness = mongoose.model('Witness');

      //witness db info
      var witnessDoc;
      Witness.findOne({'witness':witness}).lean(true).exec(function (err, doc) {
        witnessDoc = doc;
        if(witnessDoc==null){
          witnessDoc = {
            "blocksNum": 0,
            "lastCountTo": 0,
            "witness": witness
          }
        }

        Block.count({'witness':witness, 'number':{$gt:witnessDoc.lastCountTo}}).exec(function(err,c){
          if(err){
            //console.log("查询"+witness+"大于"+witnessDoc.lastCountTo+"的区块失败："+err);
            c = 0;
            res.write("{}");
            res.end();
            return
          }
            
          
          Block.findOne({'witness':witness}).sort('-number').exec(function (err, doc) {//t 查询一条会导致排序失效
            if(doc){
              //console.log(witness+"的最新number:"+doc.number);
              witnessDoc.lastCountTo = doc.number;
              witnessDoc.blocksNum += c;
            }
            resultData.totalBlocks = witnessDoc.blocksNum;
            resultData.balance = 0.3375*witnessDoc.blocksNum;
            respData = JSON.stringify(resultData);
            res.write(respData);
            res.end();
    
            //update witness info in db
            Witness.update(
              {'witness': witness}, 
              {$setOnInsert: witnessDoc}, 
              {upsert: true}, 
              function (err, data) {
                  if(err)
                      console.log(err);
              }
            );
          });
            
  
        });

      });

    }
  }