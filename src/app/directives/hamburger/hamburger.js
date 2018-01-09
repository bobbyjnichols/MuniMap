(function () {
  'use strict';
  
  angular
    .module("MuniMap")
    .directive("hamburger", () => ({
      templateUrl: 'html/directives/hamburger/hamburger.html',
      restrict: 'E',
      replace: true,
      scope: {
        open: '=',
      }
    }));
})();