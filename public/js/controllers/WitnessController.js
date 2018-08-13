angular.module('BlocksApp').controller('WitnessController', function($stateParams, $rootScope, $scope, $http, $location) {
    $scope.$on('$viewContentLoaded', function() {   
        // initialize core components
        App.initAjax();
        //TableAjax.init();
    });

    var witness = $stateParams.witness;
    if(witness.indexOf("0x")==0)
      witness = witness.substr(2);
    $rootScope.$state.current.data["pageSubTitle"] = '0x'+witness;
    $scope.witness = witness;
    $scope.page = 0;

    $scope.switchPage = function(_page){
      if(isNaN(_page) || Number(_page)<0)
        _page = 0;
      $http({
        method: 'POST',
        url: '/witnessData',
        data: {"action":"blocks", "witness": witness, "page":_page}
      }).success(function(data) {
        if (data.error)
          $location.path("/err404/witness/" + witness);
        else {
          $scope.blocks = data.blocks;
          $scope.page = data.page;
          
          //compute block time
          if(_page==0 && data.blocks.length>1){
            var totalTime = data.blocks[0].timestamp - data.blocks[data.blocks.length-1].timestamp;
            $scope.blockTime = totalTime/(data.blocks.length-1);
          }
        }
      });
    }

    $scope.metadata = function(){
      $http({
        method: 'POST',
        url: '/witnessData',
        data: {"action":"metadata", "witness": witness}
      }).success(function(data) {
        if (data.error)
          $location.path("/err404/witness/" + witness);
        else {
          $scope.reward = data.reward;
          $scope.totalBlocks = data.totalBlocks;
        }
      });
    }

    $scope.metadata();
    $scope.switchPage(0);
})