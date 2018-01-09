(function () {
  'use strict';

  const WebService = function ($resource, ConStore, $cacheFactory) {
    let APIManager = {};

    APIManager.computeConfigArgs = function (networkConfig) {
      networkConfig.url = angular.isDefined(networkConfig.url) ? networkConfig.url : "";
      networkConfig.params = angular.isDefined(networkConfig.params) ? networkConfig.params : {};
      networkConfig.data = angular.isDefined(networkConfig.data) ? networkConfig.data : undefined;
      networkConfig.headers = angular.isDefined(networkConfig.headers) ? (angular.isObject(networkConfig.headers) ? networkConfig.headers : (console.log(networkConfig.headers, " is not an object"))) : {};

      return networkConfig;
    };

    APIManager.get = function (networkConfig) {
      networkConfig = APIManager.computeConfigArgs(networkConfig);
      let actualURL = networkConfig.url.startsWith('http') ? networkConfig.url : ConStore.apiServer + '/' + networkConfig.url;
      let resourceObject = $resource(actualURL, networkConfig.params, {
        get: {
          method: 'GET',
          params: networkConfig.params,
          isArray: false,
          headers: networkConfig.headers,
          cache: networkConfig.cache
        }
      }, {
        stripTrailingSlashes: false
      });
      return resourceObject.get().$promise;
    };

    APIManager.getArray = function (networkConfig) {

      networkConfig = APIManager.computeConfigArgs(networkConfig);
      let actualURL = networkConfig.url.startsWith('http') ? networkConfig.url : ConStore.apiServer + '/' + networkConfig.url;
      let resourceObject = $resource(actualURL, networkConfig.params, {
        query: {
          method: 'GET',
          params: networkConfig.params,
          isArray: true,
          headers: networkConfig.headers,
          cache: networkConfig.cache
        }
      }, {
        stripTrailingSlashes: false
      });

      return resourceObject.query().$promise;
    };

    APIManager.dropCache = function (url) {
      if (!url)
        $cacheFactory.get('$http').removeAll();
      else
        $cacheFactory.get('$http').remove(url);
    };

    return APIManager;
  };

  angular
    .module("MuniMap")
    .factory("WebService", [
      '$resource',
      'ConStore',
      '$cacheFactory',
      WebService
    ]);
})();
