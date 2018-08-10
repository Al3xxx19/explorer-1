angular.module('BlocksApp').controller('WitnessListController', function($stateParams, $rootScope, $scope, $http) {
    $scope.$on('$viewContentLoaded', function() {   
        // initialize core components
        App.initAjax();
    });

    $scope.page = 0;
    $scope.getInfoList=function(page) {
      $http({
        method: 'POST',
        url: '/witnessListData',
        data: {"page":page}
      }).success(function(repData) {
        $scope.page = repData.page;
        var pages = [];
        for(i=0; i<repData.totalPage; i++){
          pages.push(i+1);
        }
        $scope.pages = pages;
        $scope.totalPage = repData.totalPage;
        $scope.listData = repData.list;
      });
    }

    $scope.update = function(witness){
      $http({
        method: 'POST',
        url: '/witnessData',
        data: {"action":"metadata", "witness": witness}
      }).success(function(data) {
        if (data.error)
          $location.path("/err404/witness/" + witness);
        else {
          $scope["balance"] = data.balance;
          $scope["totalBlocks"+witness] = data.totalBlocks;
        }
      });
    }

    $scope.getInfoList();
    
})