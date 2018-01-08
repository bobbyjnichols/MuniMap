(function () {
  'use strict';

  const MapController = function (MapService, d3RenderService, $interval, $scope) {
    let self = this;

    this.getRoute = function (routeTag) {
      return self.routes.find(route => route.tag === routeTag);
    };

    this.selectVehicle = function (vehicle) {
      $scope.selectedVehicle = vehicle;
      $scope.selectedRoute = self.getRoute(vehicle.routeTag);
      console.log(vehicle);
      console.log($scope.selectedRoute);
    };

    this.updateVehicles = function () {
      console.log("Update");
      MapService.getVehicles(self.routes).then(vehicles => {
        d3RenderService.updateVehicles(vehicles);
      });
    };

    this.$onInit = function () {
      d3RenderService.initMap();
      MapService.getRoutes().then(routes => {
        self.routes = routes;
        MapService.getVehicles(self.routes).then(vehicles => {
          self.vehicles = vehicles;
          d3RenderService.initVehicles(vehicles, $scope);
        });
      });
      $interval(self.updateVehicles, 10000);
    };
  };

  angular
    .module('MuniMap')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('map', {
          url: '',
          views: {
            '':{
              templateUrl: 'html/modules/map/map.html',
              controllerAs: 'map',
              controller: 'MapController'
            }
          }
        });
    }])
    .controller('MapController', [
      'MapService',
      'd3RenderService',
      '$interval',
      '$scope',
      MapController
    ]);
})();