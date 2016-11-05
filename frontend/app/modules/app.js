(function () {
  'use strict';
   //[JG]: Vars filled in by build tool.
  var apiHost = '{!api_host!}';

  angular
    .module('chat-app',
    [
        'ui.router',
        'chat-app.sample',
        'chat-app.security',
        'chat-app.chat'
    ])
    .constant('baseImagePath', '/images/')
    .constant('config', {apiHost: apiHost})
    .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider) {
      $urlRouterProvider.otherwise('/');
      $locationProvider.html5Mode(true);
      $stateProvider.state('chat-app', {
          url: '',
          templateUrl: 'standard-layout.html'
      })
      .state('chat-app-home_if_no_slash', { //[JG] Fixes blank screen when refreshing on home page
          url: '/',
          templateUrl: 'standard-layout.html'
      });
    }])
    .controller('ApplicationController', ['$rootScope', '$state', '$anchorScroll', '$location', 'SecurityService', ApplicationController]);

    function ApplicationController($rootScope, $state, $anchorScroll, $location, SecurityService) {
      var vm = this;
      vm.loggedIn = false;
      vm.notLoggedIn = false;


      vm.hello = function($event) {
        $rootScope.$broadcast("navClicked");
      };

      vm.checkUserLoggedIn = function() {
        SecurityService.checkUserLoggedIn()
        .then(function(res) {
          if (res.data.response === "success") {
            $rootScope.username = res.data.data.username;
            $rootScope.userid = res.data.data.id;
            $rootScope.loggedIn = true;
          }
          else {
            $rootScope.notLoggedIn = true;
          }
        })
        .catch(function(e) {
          $rootScope.notLoggedIn = true;
        })
      };
    }
})();
