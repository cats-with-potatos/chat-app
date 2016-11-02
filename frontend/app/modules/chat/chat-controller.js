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
  .controller('ChatController', ['$rootScope', '$location', '$stateParams', '$state', 'ChatService', 'channelId', '$q', Controller]);

  function Controller($rootScope, $location, $stateParams, $state, ChatService, channelId, $q) {
    var vm = this;

    //This is where we will store the users that are currently typing
    vm.userTypingArray = [];

    //typeOfTyping will either be "", "is typing" or "are typing"
    vm.typeOfTyping = "";

    //This is where the messages will be stored
    vm.messages = [];
    vm.messagesLoaded = false;


    vm.message = "";

    //This boolean indicates whether the user is already typing or not
    var sendTypingRequest = false;

    //This is where the channels will be stored
    vm.channels = [];

    var messagePanel = $("#messagePanel");

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
        if (message.chan_id === channelId) {
          message.contents = JSON.parse(message.contents);
          vm.messages.push(message);

          //Make the messages scrollbar go to the bottom only if the scrollbar is already at the bottom
          if (messagePanel[0].scrollHeight - messagePanel.scrollTop() == messagePanel.outerHeight()) {
            messagePanel.stop().animate({
              scrollTop: messagePanel[0].scrollHeight
            }, 200);
          }
        }
      });
    });

    //Listens for people typing in realtime and adding it to vm.userTypingArray
    socket.on("userIsTyping", function(user) {
      $rootScope.$applyAsync(function() {
        if (user.channelId === channelId) {
          vm.userTypingArray.push(user);

          if (vm.userTypingArray.length === 1) {
            vm.typeOfTyping = "is typing";
          }
          else if (vm.userTypingArray.length > 1) {
            vm.typeOfTyping = "are typing";
          }
        }
      });
    });

    //Listens for people that have stopped typing in realtime and removing them from vm.userTypingArray
    socket.on("userIsNotTyping", function(user) {
      $rootScope.$applyAsync(function() {
        if (user.channelId === channelId) {
          let index = -1;

          for (let i = 0;i<vm.userTypingArray.length;i++) {
            if (vm.userTypingArray[i].userid === user.userid) {
              index = i;
            }
          }

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
        }
      });
    });


    //Get's all the initial messages from the specific channel from the server
    vm.loadChatMessages = function(channelName) {
      ChatService.getChatMessages({channelName: channelName})
      .then(function(messages) {
        vm.messages = messages;
        vm.messagesLoaded = true;
        setTimeout(function() {
          messagePanel.stop().animate({
            scrollTop: messagePanel[0].scrollHeight
          }, 200);
        }, 0);
      })
    };

    //Get's all the initial users that are currently typing
    vm.loadUsersCurrentlyTyping = function() {
      ChatService.getUsersCurrentlyTyping(channelId)
      .then(function(res) {
        if (res.data.data.length >= 1) {
          if (res.data.data.length === 1) {
            vm.typeOfTyping = "is typing";
          }
          else if (res.data.data.length > 1) {
            vm.typeOfTyping = "are typing";
          }
          console.log("res.data.data is: " + res.data.data);
          vm.userTypingArray = res.data.data;
        }
      })
    };

    //Listens on keyup events and if the key is enter, then send the message to the server
    vm.sendMessage = function(event) {
      //If only enter key is pressed
      if (event.key === "Enter") {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          if (vm.message !== "") {
            var messageToUser = vm.message;
            vm.message = "";
            ChatService.sendUserStoppedTyping(channelId)
            .then(function() {
              sendTypingRequest = false;
            });

            ChatService.sendMessage({
              channelId: channelId,
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
            ChatService.sendUserIsTyping(channelId)
            .then(function(message) {
              console.log("sent message");
            });
          }
        }
        else {
          if (sendTypingRequest === true) {
            sendTypingRequest = false;
            ChatService.sendUserStoppedTyping(channelId)
            .then(function(message) {
              console.log("the user stopped typing");
            });
          }
        }
      }
    };

    //Gets all the channels from the server
    vm.getAllChannels = function(channelName) {
      if (ChatService.channels) {
        console.log(ChatService[ChatService.currentChannelIndex]);

        delete ChatService.channels[ChatService.currentChannelIndex].activeChannel;

        for (var i = 0;i<ChatService.channels.length;i++) {
          if (ChatService.channels[i].chan_name === channelName) {
            ChatService.channels[i].activeChannel = true;
            ChatService.currentChannelIndex = i;
            break;
          }
        }

        vm.channels = ChatService.channels;
        return;
      }

      ChatService.getAllChannels()
      .then(function(res) {
        if (res.data.response === "success") {
          for (var i = 0;i<res.data.data.length;i++) {
            if (res.data.data[i].chan_name === channelName) {
              res.data.data[i].activeChannel = true;
              ChatService.currentChannelIndex = i;
              break;
            }
          }
          ChatService.channels = res.data.data;
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



    //Make new channel
    vm.createNewChannel = function($event) {
      swal({
        title: "Create New Channel",
        type: "input",
        showCancelButton: true,
        closeOnConfirm: false,
        closeOnConfirm: false,
        animation: "slide-from-top",
        inputPlaceholder: "Channel Name",
        showLoaderOnConfirm: true,
      },
      function(channelName, hey){
        if (channelName === false) {
          return false;
        }

        ChatService.createNewChannel(channelName)
        .then((res) => {
          console.log("the repsonse is" + res.data.response);
          if (res.data.response === "success") {
            swal({
              title: "Success",
              type: "success",
              text: "You have successfully made your channel",
              closeOnConfirm: true,
            }, function() {
              vm.getAllChannels($stateParams.channelName);
            });
          }
        })
        .catch((e) => {
          var inputErrorArray = [];
          e.data.data.forEach((val) => {

            switch(val) {
              case "tooLong":
              if (inputErrorArray.length === 0) {
                inputErrorArray.push("The channelName is too long");
              }
              else {
                inputErrorArray.push("<br /> The channelName is too long");
              }
              break;
              case "badName":
              if (inputErrorArray.length === 0) {
                inputErrorArray.push("Channel Name should only include A-Z a-z 0-9 - _");
              }
              else {
                inputErrorArray.push("<br /> Channel Name should only include A-Z a-z 0-9 - _");
              }
              break;
              case "channelExists":
              if (inputErrorArray.length === 0) {
                inputErrorArray.push("Channel Name already exists");
              }
              else {
                inputErrorArray.push("<br /> Channel Name already exists");
              }
              break;
              case "paramUndefined":
              if (inputErrorArray.length === 0) {
                inputErrorArray.push("Please input something");
              }
              else {
                inputErrorArray.push("<br /> Please input something");
              }
              break;
              default:
              if (inputErrorArray.length === 0) {
                inputErrorArray.push("Sorry, there was a server error");
              }
              else {
                inputErrorArray.push("<br /> Sorry, there was a server error");
              }
            }
          });
          swal.showInputError(inputErrorArray);
        });
      });
    };

    vm.logUserOut = function($event) {
      $state.go("chat-app.signout");
    };

    //If the url contains /messages, then run described functions
    if ($location.path().indexOf("/messages") !== -1) {
      var channelName = $stateParams.channelName;

      //Gets all the channels
      vm.getAllChannels(channelName);


      //When the window is resized, then the scrollbar will go to the bottom.
      window.addEventListener("resize", function(event) {
        messagePanel.stop().animate({
          scrollTop: messagePanel[0].scrollHeight
        }, 0);
      });

      $rootScope.channelName = channelName;
      $rootScope.showFixedTopNav = true;

      //Loads the chat messages
      vm.loadChatMessages($stateParams.channelName);

      vm.loadUsersCurrentlyTyping();
      //Loads the Users that are currently typing

    }


  }
}());
