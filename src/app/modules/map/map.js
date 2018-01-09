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
    };

    this.updateVehicles = function () {
      console.log("Update");
      MapService.getVehicles(self.routes).then(vehicles => {
        vehicles.forEach(vehicle => {
          vehicle ? Object.assign(self.vehicles.find(vFind =>
            vFind ? vFind.id === vehicle.id : false), vehicle
          ) : null
        });
        d3RenderService.updateVehicles(self.vehicles, $scope);
      });
    };

    this.toggleAllRoutes = function () {
      // Finds average 'enabled' state of routes
      const enabled = (self.routes
        .map(route => route.enabled ? 1 : 0)
        .reduce((a, b) => a + b) / self.routes.length) >= 0.5;

      self.routes.forEach(route => {
        route.enabled = !enabled;
      });
      if (self.vehicles) {
        self.vehicles.forEach(vehicle => {
          if (vehicle)
            vehicle.enabled = !enabled;
        });
        d3RenderService.updateVehicles(self.vehicles, $scope);
      }
    };

    this.toggleRoute = function (route) {
      self.vehicles.forEach(vehicle => {
        if (vehicle && vehicle.routeTag === route.tag)
          vehicle.enabled = route.enabled;
      });
      d3RenderService.updateVehicles(self.vehicles, $scope);
    };

    this.$onInit = function () {
      d3RenderService.initMap();
      MapService.getRoutes().then(routes => {
        self.routes = routes;
        self.toggleAllRoutes();
        MapService.getVehicles(self.routes).then(vehicles => {
          vehicles.forEach(vehicle => vehicle ? vehicle.enabled = true : null);
          self.vehicles = vehicles;
          d3RenderService.updateVehicles(vehicles, $scope);
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