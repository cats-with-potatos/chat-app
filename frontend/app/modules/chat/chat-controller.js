(function() {
  'use strict';
  angular
  .module('chat-app.chat')
  .controller('ChatController', ['$rootScope', 'ChatService', Controller]);

  function Controller($rootScope, ChatService) {
    var vm = this;
    vm.userTypingArray = [];
    vm.typeOfTyping = "";
    vm.messages = [];



  $rootScope.$on('$stateChangeSuccess',
  function(event, toState, toParams, fromState, fromParams){
    if (vm.message) {
      ChatService.sendUserStoppedTyping()
      .then(function(message) {
        console.log("the user stopped typing");
      });
    }
  });

    socket.emit("newUser", Cookies.get("auth"))

    socket.on("newChannelMessage", function(message) {
      $rootScope.$applyAsync(function() {
        message.contents = JSON.parse(message.contents);
        vm.messages.push(message);


        document.getElementById("messagePanel").scrollTop = document.getElementById("messagePanel").scrollHeight;
      });
    });

    socket.on("userIsTyping", function(userid) {
      $rootScope.$applyAsync(function() {
        vm.userTypingArray.push(userid);


        if (vm.userTypingArray.length === 1) {
         vm.typeOfTyping = "is typing";
        }
        else if (vm.userTypingArray.length > 1) {
          vm.typeOfTyping = "are typing";
        }

      });
    });

    socket.on("userIsNotTyping", function(userid) {
      $rootScope.$applyAsync(function() {
        const index = vm.userTypingArray.indexOf(userid);
        vm.userTypingArray.splice(index, 1);

        if (vm.userTypingArray.length === 0) {
          vm.typeOfTyping = "";
        }
        else if (vm.userTypingArray.length === 1) {
          vm.typeOfTyping = "is typing";
        }
        else {
          vm.typeOfTyping = "are typing";
        }

      });
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

  vm.sendUserIsTyping = function(event) {
    if (vm.message !== "") {
      ChatService.sendUserIsTyping()
      .then(function(message) {
        console.log("sent message");
      });
    }
    else {
      ChatService.sendUserStoppedTyping()
      .then(function(message) {
        console.log("the user stopped typing");
      });
    }
  };






  }

}());
