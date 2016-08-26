(function() {
  'use strict';
  angular
  .module('chat-app.chat')
  .controller('ChatController', ['ChatService', Controller]);

  function Controller(ChatService) {
    var vm = this;

    vm.loadChatMessages = function() {
      ChatService.getChatMessages({channelId: 1})
      .then(function(messages) {
        vm.messages = messages;
        console.log(vm.messages);
      })
    };
  }

}());
