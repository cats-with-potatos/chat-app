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
        console.log(messages);
      })
    };

    vm.loadChatMessages();
    //Loads all the messages

    vm.sendMessage = function(event) {
      //If only enter key is pressed
        event.preventDefault();

      else if (event.key === "Enter" && !event.shiftKey) {
        ChatService.sendMessage({
          channelId: 1,
          message: JSON.stringify(vm.message)
        })
      }


    }



  }

}());
