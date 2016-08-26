(function() {
  'use strict';
  angular
  .module('chat-app.chat')
  .controller('ChatController', ['ChatService', Controller]);

  function Controller(ChatService) {
    var vm = this;

    socket.emit("newUser", Cookies.get("auth"))

    socket.on("newChannelMessage", function(message) {
      console.log(message);
    })

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

      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        vm.message = "";

        ChatService.sendMessage({
          channelId: 1,
          message: JSON.stringify(vm.message)
        })
      }


    }



  }

}());
