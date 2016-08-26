(function() {
  'use strict';
  angular
  .module('chat-app.chat')
  .controller('ChatController', ['ChatService', Controller]);

  function Controller(ChatService) {
    var vm = this;



    socket.emit("newUser", Cookies.get("auth"))

    socket.on("newChannelMessage", function(message) {
      message.contents = JSON.parse(message.contents);
      document.getElementById("messagePanel").scrollTop = document.getElementById("messagePanel").scrollHeight;
      vm.messages.push(message);
  });

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
        var messageToUser = vm.message;
        vm.message = "";

        ChatService.sendMessage({
          channelId: 1,
          message: JSON.stringify(messageToUser),
        })
      }


    }



  }

}());
