(function() {
  'use strict';
  angular
  .module('chat-app.security', [])
  .config(['$stateProvider', Routes]);

  function Routes($stateProvider) {
    $stateProvider.state('chat-app.signup', {
      url: '/signup',
      templateUrl: 'signup.html',
      controller: 'SecurityController',
      controllerAs: 'vm',
      resolve: {
        /*Checks if the user is logged in. If they are, then go to the home page, if they aren't, then
        proceed to the signup page.
        */

        app: ["SecurityService", "$q", '$state', function (SecurityService, $q, $state) {
          var defer = $q.defer();
          SecurityService.checkUserLoggedIn()
          .then(function(val) {
            if (val.data.response === "success") {
              $state.go("chat-app");
            }
            else {
              defer.resolve();
            }

          })
          .catch(function(e) {
            defer.resolve();
          });
          return defer.promise;
        }]
      },
    }),
    $stateProvider.state('chat-app.signin', {
      url: '/signin',
      templateUrl: 'signin.html',
      controller: 'SecurityController',
      controllerAs: 'vm',
      resolve: {
        /*Checks if the user is logged in. If they are, then go to the home page, if they aren't, then
        proceed to the signin page.
        */

        app: ["SecurityService", "$q", '$state', function (SecurityService, $q, $state) {
          var defer = $q.defer();
          SecurityService.checkUserLoggedIn()
          .then(function(val) {
            if (val.data.response === "success") {
              $state.go("chat-app");
            }
            else {
              defer.resolve();
            }

          })
          .catch(function(e) {
            defer.resolve();
          });
          return defer.promise;
        }]
      },

    }),
    $stateProvider.state('chat-app.signout', {
      url: '/signout',
      templateUrl: 'signout.html',
      controller: 'SecurityController',
      controllerAs: 'vm',
      resolve: {
        /*Checks if the user is logged in. If they are, then go to the signout page, if they aren't, then
        then go to the home page
        */
        app: ["SecurityService", "$q", '$state', function (SecurityService, $q, $state) {
          var defer = $q.defer();
          SecurityService.checkUserLoggedIn()
          .then(function(val) {
            if (val.data.response === "success") {
              defer.resolve();
            }
            else {
              $state.go("chat-app");
            }
          })
          .catch(function(e) {
            $state.go("chat-app");
          });
          return defer.promise;
        }]
      },

    });
  }
})();
