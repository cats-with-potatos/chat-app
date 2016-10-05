(function () {
  'use strict';
  angular
  .module('chat-app.chat', [])
  .config(['$stateProvider', Routes]);

  function Routes($stateProvider) {
    $stateProvider.state('chat-app.messages', {
      url: '/messages',
      templateUrl: 'messages.html',
      controller: 'ChatController',
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
              defer.resolve();
            }
            else {
              $state.go("chat-app");
            }
          })
          .catch(function(e) {
            defer.resolve();
          });
          return defer.promise;
        }]
      }
    });
  }

}())
