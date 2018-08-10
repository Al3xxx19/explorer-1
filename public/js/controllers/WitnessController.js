angular.module('BlocksApp').controller('WitnessController', function($stateParams, $rootScope, $scope, $http, $location) {
    $scope.$on('$viewContentLoaded', function() {   
        // initialize core components
        App.initAjax();
        //TableAjax.init();
    });

    var witness = $stateParams.witness;

    $rootScope.$state.current.data["pageSubTitle"] = witness;
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
          $scope.balance = data.balance;
          $scope.totalBlocks = data.totalBlocks;
        }
      });
    }

    //$scope.metadata();//t wait for patch history witness
    $scope.switchPage(0);
})