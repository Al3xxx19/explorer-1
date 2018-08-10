#!/usr/bin/env node
module.exports = function(req, res){
  var respData = "";
    try{
      page = req.body.page;
      if(page<0 || page==undefined)
        page = 0;
      resultData={"totalPage":0, "list":null, "page":page};
      var mongoose = require( 'mongoose' );
      var Witness = mongoose.model('Witness');
      var pageSize = 10;
      Witness.count({}).exec(function(err,c){
        resultData.totalPage = Math.ceil(c/pageSize);
        if(page>=resultData.totalPage){
          resultData.page = 0;
          page=0;
        }
        WitnessFind = Witness.find({}).skip(page*pageSize).limit(pageSize).lean(true);
        WitnessFind.exec(function (err, docs) {
          resultData.list=docs;
          respData = JSON.stringify(resultData);
          res.write(respData);
          res.end();
        });
      });
      
    } catch (e) {
      console.error(e);
    }
}; 