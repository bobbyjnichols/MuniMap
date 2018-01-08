(function () {
  'use strict';

  const AppController = function(ConStore) {
  };

  angular.module('MuniMap', [
    'ui.router',
    'ngResource',
    'config'
  ])
    .config([
      '$compileProvider',
      '$sceDelegateProvider',
      'ConStore',
      function($compileProvider, $sceDelegateProvider, ConStore) {
        $compileProvider.debugInfoEnabled(ConStore.debug || false);
        $sceDelegateProvider.resourceUrlWhitelist(ConStore.resourceUrlWhitelist);
      }
    ])
    .config([
      'ConStore',
      AppController
    ]);
})();
