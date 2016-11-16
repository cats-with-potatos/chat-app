(function () {
  'use strict';
  angular
  .module('chat-app.chat', [])
  .config(['$stateProvider', Routes]);

  function Routes($stateProvider) {
    $stateProvider.state('chat-app.messages', {
      url: '/messages/:channelName',
      templateUrl: 'messages.html',
      controller: 'ChatController',
      controllerAs: 'vm',
      resolve: {
        /*Checks if the user is logged in. If they are, then go to the home page, if they aren't, then
        proceed to the signup page.
        */
        channelOrUserId: ["SecurityService", "ChatService", "$q", '$state', '$stateParams', '$rootScope', function (SecurityService, ChatService, $q, $state, $stateParams, $rootScope) {
          var vm = this;

          var defer = $q.defer();
          SecurityService.checkUserLoggedIn()
          .then(function(res) {
            if (res.data.response === "success") {
              return ChatService.checkUserInChannel($stateParams.channelName)
            }
            else {
              $state.go("chat-app");
            }
          })
          .then(function(res) {
            if (res.data.response === "success") {
              defer.resolve(res.data.data);
            }
            else {
              $state.go("chat-app");
            }
          })
          .catch(function(e) {
            if (e.data.errorType === "notInChannel") {
              $rootScope.showSpinner = false;

              swal({
                title: "Join Channel?",
                type: "info",
                text: "Would you like to join the <b>" + $stateParams.channelName + "</b> channel?",
                html: "true",
                showLoaderOnConfirm: true,
                showCancelButton: true,
                closeOnConfirm: false,
              }, function() {
                ChatService.addUserToChannel($stateParams.channelName)
                .then(function(res) {
                  if (res.data.response === "success") {
                    swal({
                      title: "Success!",
                      type: "success",
                      text: "You have successfully joined the channel!",
                    }, function() {
                      $state.go("chat-app.messages",{channelName: $stateParams.channelName});
                    });

                  }
                });

              });
            }
            else {
              $state.go("chat-app");
            }
          });
          return defer.promise;
        }]
      }
    }).state("chat-app.privatemessages", {
      url: '/privatemessages/:username',
      templateUrl: 'messages.html',
      controller: 'ChatController',
      controllerAs: 'vm',
      resolve: {

    /*
    Checks if the user is logged in. If they are,
    then check if the user exists, then go to page,
    otherwise go to home page
    */

    channelOrUserId: ["SecurityService", "ChatService", "$q", '$state', '$stateParams', function (SecurityService, ChatService, $q, $state, $stateParams) {
      var defer = $q.defer();
      SecurityService.checkUserLoggedIn()
      .then(function(res) {
        if (res.data.response === "success") {
          return ChatService.checkUserExists($stateParams.username)
        }
        else {
          $state.go("chat-app");
        }
      })
      .then(function(res) {
        if (res.data.response === "success") {
          defer.resolve(res.data.data.id);
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
      }
    });
  }
}());
