(function () {
  'use strict';

  const MapService = function (WebService, $q) {
    this.getRoutes = function () {
      let resolveList = [];
      let routes = [];
      let defer = $q.defer();

      WebService.get({
        url:'http://webservices.nextbus.com/service/publicJSONFeed',
        params: {
          command: 'routeList',
          a: 'sf-muni'
        }
      }).then(routeListResponse => {
        routes = routeListResponse.route;
        routes.forEach(route => {
          resolveList.push(
            WebService.get({
              url: 'http://webservices.nextbus.com/service/publicJSONFeed',
              params: {
                command: 'routeConfig',
                a: 'sf-muni',
                r: route.tag
              }
            }).then(routeConfigResponse => {
              route.route = routeConfigResponse.route;
            })
          );
        });
        Promise.all(resolveList).then(()=>defer.resolve(routes));
      });
      return defer.promise;
    };

    this.getVehicles = function (routes) {
      let resolveList = [];
      let vehicles = [];
      let defer = $q.defer();

      routes.forEach(route =>
        resolveList.push(
          WebService.get({
            url: 'http://webservices.nextbus.com/service/publicJSONFeed',
            params: {
              command: 'vehicleLocations',
              a: 'sf-muni',
              r: route.tag
            }
          }).then(vehicleLocationsResponse => {
            route.vehicles = vehicleLocationsResponse.vehicle;
            vehicles = vehicles.concat(vehicleLocationsResponse.vehicle);
          })
        )
      );
      Promise.all(resolveList).then(()=>defer.resolve(vehicles));
      return defer.promise;
    };
  };

  angular
    .module("MuniMap")
    .service("MapService", [
      'WebService',
      '$q',
      MapService
    ]);
})();