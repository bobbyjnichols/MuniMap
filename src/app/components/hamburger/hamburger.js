(function () {
  'use strict';

  angular
    .module("MuniMap")
    .component("hamburger", {
      templateUrl: 'html/components/hamburger/hamburger.html',
      bindings: {
        open: '=',
      }
    });
})();