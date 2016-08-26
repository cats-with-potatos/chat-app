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
      controllerAs: 'vm'
    });
  }

}())
