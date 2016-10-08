/*
This module takes control of all the chat functionality.
Some of the things this module takes care of:
1. Sending messages
2. Getting sent messages from db
3. Getting sent messages from users in real time
4. Indicating when the user is currently typing
4. Getting the users that are currently typing from db
5. Getting the users that are currently typing in realtime
*/

(function() {
  'use strict';
  angular
  .module('chat-app.chat')
  .controller('ChatController', ['$rootScope', '$location', '$stateParams', '$state', 'ChatService', Controller]);

  function Controller($rootScope, $location, $stateParams, $state, ChatService) {
    var vm = this;


    //This is where we will store the users that are currently typing
    vm.userTypingArray = [];

    //typeOfTyping will either be "", "is typing" or "are typing"
    vm.typeOfTyping = "";

    //This is where the messages will be stored
    vm.messages = [];

    vm.message = "";

    //This boolean indicates whether the user is already typing or not
    var sendTypingRequest = false;

    //This is where the channels will be stored
    vm.channels = [];

    /*This is used to tell the server that the user has stopped typing
    if the user goes to another url on the web app. */
    $rootScope.$on('$stateChangeSuccess',
    function(event, toState, toParams, fromState, fromParams){
      if (vm.message) {
        ChatService.sendUserStoppedTyping()
        .then(function(message) {
          console.log("the user stopped typing");
        });
      }
    });

    //Tells the backend server that a new user has connected
    socket.emit("newUser", Cookies.get("auth"))


    //Listens for new messages in realtime and add's it to the vm.messages list
    socket.on("newChannelMessage", function(message) {
      $rootScope.$applyAsync(function() {
        message.contents = JSON.parse(message.contents);
        vm.messages.push(message);

        //Make the messages scrollbar go to the bottom
        document.getElementById("messagePanel").scrollTop = document.getElementById("messagePanel").scrollHeight;
      });
    });

    //Listens for people typing in realtime and adding it to vm.userTypingArray
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

    //Listens for people that have stopped typing in realtime and removing them from vm.userTypingArray
    socket.on("userIsNotTyping", function(userid) {
      $rootScope.$applyAsync(function() {
        var index = vm.userTypingArray.indexOf(userid);
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

    //Get's all the initial messages from the specific channel from the server
    vm.loadChatMessages = function() {
      ChatService.getChatMessages({channelId: 1})
      .then(function(messages) {
        vm.messages = messages;
        console.log(messages);
      })
    };

    //Get's all the initial users that are currently typing
    vm.loadUsersCurrentlyTyping = function() {
      ChatService.getUsersCurrentlyTyping()
      .then(function(res) {
        if (res.data.data.length >= 1) {
          if (res.data.data.length === 1) {
            vm.typeOfTyping = "is typing";
          }
          else if (res.data.data.length > 1) {
            vm.typeOfTyping = "are typing";
          }

          vm.userTypingArray = res.data.data;
        }
      })
    };




    //Functions that are run on page load







    //Listens on keyup events and if the key is enter, then send the message to the server
    vm.sendMessage = function(event) {
      //If only enter key is pressed
      if (event.key === "Enter") {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          if (vm.message !== "") {
            var messageToUser = vm.message;
            vm.message = "";

            ChatService.sendUserStoppedTyping()
            .then(function() {
              sendTypingRequest = false;
            });

            ChatService.sendMessage({
              channelId: 1,
              message: JSON.stringify(messageToUser),
            });
          }
        }
      }
    }

    //This function tells the server if the user has currently started typing or stopped typing.
    vm.sendUserIsTyping = function(event) {
      if (event.key !== "Enter") {
        if (vm.message !== "") {
          if (sendTypingRequest === false) {
            sendTypingRequest = true;
            ChatService.sendUserIsTyping()
            .then(function(message) {
              console.log("sent message");
            });
          }
        }
        else {
          if (sendTypingRequest === true) {
            sendTypingRequest = false;
            ChatService.sendUserStoppedTyping()
            .then(function(message) {
              console.log("the user stopped typing");
            });
          }
        }
      }
    };

    //Gets all the channels from the server
    vm.getAllChannels = function(channelName) {
      ChatService.getAllChannels()
      .then(function(res) {
        if (res.data.response === "success") {
          for (var i = 0;i<res.data.data.length;i++) {
            if (res.data.data[i].chan_name === channelName) {
              console.log("IT WAS FOUND");
              res.data.data[i].activeChannel = true;
            }
          }
          vm.channels = res.data.data;
        }
      })
      .catch(function(e) {
        $state.go("chat-app");
      })
    };

    //Goes to another channel
    vm.goToAnotherChannel = function(channelName, $event) {
      $event.preventDefault();
      $state.go("chat-app.messages", {channelName: channelName});
    };



    //If the url contains /messages, then run described functions
    if ($location.path().indexOf("/messages") !== -1) {
      var channelName = $stateParams.channelName;
      if (!channelName) {
        $state.go("chat-app");
      }

      $rootScope.showFixedTopNav = true;
      vm.loadChatMessages();
      vm.loadUsersCurrentlyTyping();
      vm.getAllChannels(channelName);
    }


  }
}());
