(function () {
  'use strict';

  const MapController = function (MapService, d3RenderService) {


    this.$onInit = function () {
      d3RenderService.initMap();
      MapService.getRoutes().then(routes => {
        self.routes = routes;
        MapService.getVehicles(self.routes).then(vehicles => {
          self.vehicles = vehicles;
          d3RenderService.initVehicles(vehicles);
        });
      });
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
      MapController
    ]);
})();