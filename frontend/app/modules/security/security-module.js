(function() {
  'use strict';
  angular
    .module('chat-app.security', [])
    .config(['$stateProvider', Routes]);

    function Routes($stateProvider) {
      $stateProvider.state('chat-app.signup', {
          url: '/signup',
          templateUrl: 'signup.html'
      });
    }
})();
