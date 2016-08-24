(function() {
  'use strict';
  angular
    .module('chat-app.sample', [])
    .config(['$stateProvider', Routes]);

    function Routes($stateProvider) {
      $stateProvider.state('chat-app.sample', {
          url: '/sample-1',
          templateUrl: 'sample.html',
          controller: 'SampleController',
          controllerAs: 'vm'
      }).state('chat-app.sample-2', {
          url: '/sample-2',
          templateUrl: 'sample-2.html',
          controller: 'SampleController',
          controllerAs: 'vm'
      }).state('chat-app.landing', {
        url: '/landing',
        templateUrl: '/landingPage.html',
        controller: 'SampleController',
        controllerAs: 'vm'
      }).state('chat-app',
        url: /'landingPage.html',
        templateUrl:'/landingPage.html',
        controller: 'SampleController',
        controllerAs: 'vm'
      );
    }
})();
