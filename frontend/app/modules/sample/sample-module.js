(function() {
  'use strict';
  angular
    .module('chat-app.sample', [])
    .config(['$stateProvider', Routes]);

    function Routes($stateProvider) {
      $stateProvider.state('chat-app.sample', {
          url: '/',
          templateUrl: 'sample.html',
          controller: 'SampleController',
          controllerAs: 'vm'
      }).state('chat-app.sample-2', {
          url: '/sample-2',
          templateUrl: 'sample-2.html',
          controller: 'SampleController',
          controllerAs: 'vm'
      }).state('chat-app.sample-3', {
          url: '/sample-3',
          templateUrl: 'sample-3.html',
          controller: 'SampleController',
          controllerAs: 'vm'
      });
    }
})();
