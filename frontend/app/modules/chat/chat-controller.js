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
  .controller('ChatController', ['$rootScope', '$location', '$stateParams', '$state', 'ChatService', 'channelOrUserId', '$q', '$scope', '$window', '$document', '$timeout' , Controller]);

  function Controller($rootScope, $location, $stateParams, $state, ChatService, channelOrUserId, $q, $scope, $window, $document, $timeout) {
    var vm = this;

    //This is where we will store the users that are currently typing
    vm.userTypingArray = [];

    //typeOfTyping will either be "", "is typing" or "are typing"
    vm.typeOfTyping = "";

    //This is where the messages will be stored
    vm.messages = [];
    vm.messagesLoaded = false;

    //This is where the users are stored
    vm.users = [];

    //If this is set to true, a dark overlay appears
    vm.showDarkOverlay = false;

    //Used to show and hide spinner at top
    $rootScope.showSpinner = false;

    //The message that is currently being typed
    vm.message = "";

    //User Profile errors
    vm.userProfileErrors = [];

    vm.userProfileSuccess = false;

    vm.newProfileImage = null;

    if ($rootScope.username) {
      vm.newUserName = $rootScope.username;
    }
    else {
      vm.newUserName = ""
    }

    //Spinner that is shown when the user changes their profile details
    vm.showUserProfileSpinner = false;



    $scope.$on("detailsRetrieved", function() {
      vm.newUserName = $rootScope.username;
    });




    vm.channelorPrivate = $location.path().indexOf("/messages") === 0 ? "channel" : "private";

    //This boolean indicates whether the user is already typing or not
    var sendTypingRequest = false;

    //This is where the channels will be stored
    vm.channels = [];

    var messagePanel = $("#messagePanel");

    //File upload in profile settings
    var newProfileImage = document.querySelector("#newProfileImage");

    //Will keep track of the previous states
    var history = [];

    /*This is used to tell the server that the user has stopped typing
    if the user goes to another url on the web app. */
    $rootScope.$on('$stateChangeSuccess',
    function(event, toState, toParams, fromState, fromParams){

      history.push(fromState.name);

      if (vm.message) {
        ChatService.sendUserStoppedTyping(channelOrUserId);
        ChatService.sendUserStoppedTypingPM(channelOrUserId);
      }

    });


    //Listens for new messages in realtime and add's it to the vm.messages list
    socket.on("newChannelMessage", function(message) {
      $rootScope.$applyAsync(function() {
        if (message.chan_id === channelOrUserId && vm.channelorPrivate === "channel") {

          try {
            message.contents = JSON.parse(message.contents);
            message.message_time = moment().format("h:mm a");
          }
          catch(e) {
            console.log(e);
          }

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



    //Listens for new private messages in realtime and add's it to the vm.messages list
    socket.on("newPrivateMessage", function(message) {
      $rootScope.$applyAsync(function() {
        if ((message.user_id === channelOrUserId || message.user_id === $rootScope.userid) && vm.channelorPrivate === "private") {
          try {
            message.contents = JSON.parse(message.contents);
            message.message_time = moment().format("h:mm a");
          }
          catch(e) {
            console.log(e);
          }
          vm.messages.push(message);

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
        if (user.channelId === channelOrUserId && vm.channelorPrivate === "channel") {
          vm.userTypingArray.push(user);
          //If one user is typing, set text to "is typing", else set to "are typing"
          if (vm.userTypingArray.length === 1) {
            vm.typeOfTyping = "is typing";
          }
          else if (vm.userTypingArray.length > 1) {
            vm.typeOfTyping = "are typing";
          }
        }
      });
    });

    socket.on("userIsTypingPM", function(user) {
      $rootScope.$applyAsync(function() {
        console.log("HI");
        if (user.id === channelOrUserId && vm.channelorPrivate === "private") {
          vm.userTypingArray.push(user);
          //If one user is typing, set text to "is typing", else set to "are typing"
          vm.typeOfTyping = "is typing";
        }
      });
    });

    socket.on("newDeletedMessage", function(obj) {
      $rootScope.$applyAsync(function() {
        if (obj.channelId === channelOrUserId && vm.channelorPrivate === "channel") {
          var indexToDelete;

          for (var i = 0; i < vm.messages.length ; i++) {
            if (vm.messages[i].message_id === obj.messageId) {
              vm.messages[i].gettingDeleted = true;
              indexToDelete = i;

              if ($rootScope.userid === obj.userid && $rootScope.showSpinner === true) {
                $rootScope.showSpinner = false;
              }
              break;

            }
          }
          $timeout(function() {
            vm.messages.splice(indexToDelete, 1);
          }, 1000);
        }
      });
    });

    socket.on("newDeletedPrivateMessage", function(obj) {
      $rootScope.$applyAsync(function() {
        if ((obj.userid === channelOrUserId || obj.userid === $rootScope.userid) && vm.channelorPrivate === "private") {
          var indexToDelete;

          for (var i = 0; i < vm.messages.length ; i++) {
            if (vm.messages[i].pm_id === obj.messageId) {
              vm.messages[i].gettingDeleted = true;
              indexToDelete = i;

              if ($rootScope.userid === obj.userid && $rootScope.showSpinner === true) {
                $rootScope.showSpinner = false;
              }
              break;

            }
          }
          $timeout(function() {
            vm.messages.splice(indexToDelete, 1);
          }, 1000);
        }
      });
    });


    socket.on("newUpdatedMessage", function(obj) {
      $rootScope.$applyAsync(function() {
        if (obj.channelId === channelOrUserId && vm.channelorPrivate === "channel") {
          //Sets the contents of the updated message


          var indexToChange;

          for (var i = 0;i < vm.messages.length;i++) {
            if (vm.messages[i].message_id === obj.messageId) {
              indexToChange = i;

              if ($rootScope.userid === obj.userid && $rootScope.showSpinner === true) {
                $rootScope.showSpinner = false;
              }
              break;
            }
          }

          try {
            obj.contents = JSON.parse(obj.contents);
          }
          catch(e) {
            console.log(e);
          }

          vm.messages[indexToChange].contents = obj.contents;
          vm.messages[indexToChange].wasEdited = true;
          delete vm.messages[indexToChange].gettingEdited;

          $timeout(function() {
            delete vm.messages[indexToChange].wasEdited;
          }, 1000);
        }
      });
    });


socket.on("newUpdatedPrivateMessage", function(obj) {
  $rootScope.$applyAsync(function() {
    console.log(obj);
    if ((obj.userid === channelOrUserId || obj.userid === $rootScope.userid) && vm.channelorPrivate === "private") {
      //Sets the contents of the updated message
      var indexToChange;

      for (var i = 0;i < vm.messages.length;i++) {
        if (vm.messages[i].pm_id === obj.messageId) {
          indexToChange = i;

          if ($rootScope.userid === obj.userid && $rootScope.showSpinner === true) {
            $rootScope.showSpinner = false;
          }
          break;
        }
      }

      try {
        obj.contents = JSON.parse(obj.contents);
      }
      catch(e) {
        console.log(e);
      }

      vm.messages[indexToChange].contents = obj.contents;
      vm.messages[indexToChange].wasEdited = true;
      delete vm.messages[indexToChange].gettingEdited;

      $timeout(function() {
        delete vm.messages[indexToChange].wasEdited;
      }, 1000);
    }
  });
});


    //Listens for people that have stopped typing in realtime and removing them from vm.userTypingArray
    socket.on("userIsNotTypingPM", function(user) {
      $rootScope.$applyAsync(function() {
        if (user.id=== channelOrUserId && vm.channelorPrivate === "private") {
          console.log("hehexd");
          var index = -1;

          for (var i = 0;i<vm.userTypingArray.length;i++) {
            if (vm.userTypingArray[i].userid === user.userid) {
              index = i;
            }
          }

          vm.userTypingArray.splice(index, 1);
          //If no user is typing, set text to not, if length is 1, set to "is typing", else set to "are typing"
          vm.typeOfTyping = "";
        }
      });
    });


    //Listens for people that have stopped typing in realtime and removing them from vm.userTypingArray
    socket.on("userIsNotTyping", function(user) {
      $rootScope.$applyAsync(function() {
        if (user.channelId === channelOrUserId && vm.channelorPrivate === "channel") {
          var index = -1;

          for (var i = 0;i<vm.userTypingArray.length;i++) {
            if (vm.userTypingArray[i].userid === user.userid) {
              index = i;
            }
          }

          vm.userTypingArray.splice(index, 1);
          //If no user is typing, set text to not, if length is 1, set to "is typing", else set to "are typing"
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

    //This actually edits the current message
    vm.editMessageInput = function(event, messageId, messageIndex, pm_to) {
      if (event.key === "Enter" && event.shiftKey === false) {
        $rootScope.showSpinner = true;

        //Prevents the Enter event
        event.preventDefault();

        if (vm.channelorPrivate === "channel") {
          ChatService.editMessage(
            {
              messageId: messageId,
              channelId: channelOrUserId,
              contents: event.target.value
            })
            .then(function(res) {
              if (res.data.response === "success") {
                $rootScope.showSpinner = false;
              }
            });

          }
          else {
            ChatService.editPrivateMessage({
              messageId: messageId,
              pm_to: pm_to,
              contents: event.target.value,
            })
            .then((res) => {
              if (res.data.response === "success") {
                $rootScope.showSpinner = false;
              }
            });
          }
        }
      };


      vm.editMessage = function(messageId, messageIndex, pm_to) {
        //A textbox will be displayed with the message contents
        vm.messages[messageIndex].gettingEdited = true;
      }

      vm.deleteMessage = function(messageId, messageIndex, messageTo) {
        $rootScope.showSpinner = true;

        if (vm.channelorPrivate === "channel") {
          ChatService.deleteMessage({messageId: messageId, channelId: channelOrUserId});
        }
        else {
          ChatService.deletePrivateMessage({messageId: messageId, messageTo: messageTo});
        }
      }


      //Get's all the initial messages from the specific channel from the server
      vm.loadChatMessages = function(channelName) {
        ChatService.getChatMessages({channelName: channelName})
        .then(function(messages) {
          vm.messages = messages;
          vm.messagesLoaded = true;
          $timeout(function() {
            //Scrollbar will go to bottom
            messagePanel.stop().animate({
              scrollTop: messagePanel[0].scrollHeight
            }, 200);
          }, 0);
        });
      };

      //Get's all the initial users that are currently typing
      vm.loadUsersCurrentlyTyping = function() {
        ChatService.getUsersCurrentlyTyping(channelOrUserId)
        .then(function(res) {
          if (res.data.data.length >= 1) {
            if (res.data.data.length === 1) {
              vm.typeOfTyping = "is typing";
            }
            else if (res.data.data.length > 1) {
              vm.typeOfTyping = "are typing";
            }

            for (var i = 0;i < res.data.data.length;i++) {
              res.data.data[i] = {name: res.data.data[i]};
            }
            vm.userTypingArray = res.data.data;
          }
        })
      };

      vm.changeUserProfile = function(event) {
        console.log(event);
        event.preventDefault();
        vm.userProfileErrors = [];

        console.log(vm.newUserName === "");
        console.log(newProfileImage.value === "");

        if (vm.newUserName === "" && newProfileImage.value === "") {
          vm.userProfileErrors.push("Please make sure you either input a username or an image");
        }

        var extension = newProfileImage.value.split(".").pop().toLowerCase();

        if (newProfileImage.value !== "" && ["jpg", "jpeg", "png", "gif"].indexOf(extension) === -1) {
          vm.userProfileErrors.push("Please make sure that you upload an image");
          return;
        }

        vm.showUserProfileSpinner = true;


        var formData = new FormData(document.querySelector("#userProfileForm"));
        console.log(formData);


        ChatService.changeUserProfile({formData: formData})
        .then(function(res) {


          vm.showUserProfileSpinner = false;

          if (vm.newUserName !== $rootScope.username) {
            for (let i = 0; i < vm.messages.length; i++) {
              vm.messages[i].username = vm.newUserName;
            }
          }

          if ($("#newProfileImage").val()) {
            $rootScope.profilepic = res.data.data.image;
            for (let i = 0; i < vm.messages.length; i++) {
            vm.messages[i].image = res.data.data.image;
            }
          }

          $rootScope.username = vm.newUserName;
          vm.userProfileSuccess = true;


          $timeout(function() {
              vm.userProfileSuccess = false;
          }, 2000);
        })
        .catch((e) => {
        vm.showUserProfileSpinner = false;
          e.data.data.forEach(function(val) {
            switch(val) {
              case "paramUndefined":
                vm.userProfileErrors.push("Please make sure you input a username");
                break;
              case "tooLong":
                vm.userProfileErrors.push("Your username is too long");
                break;
              case "badUsername":
                vm.userProfileErrors.push("Please make sure your username only contains letters, numbers, hyphens and underscores");
                break;
              case "wrongMimeType":
                vm.userProfileErrors.push("Please make sure you only upload a png, jpg, jpeg or gif");
                break;
              case "imgError":
                vm.userProfileErrors.push("The server could not process your image");
                break;
              case "userAlreadyExists":
                vm.userProfileErrors.push("Sorry, that username already exists");
              default:
                vm.userProfileErrors.push("Sorry there was an unexpected server error");
            }
          });
        });
      }

      //Listens on keyup events and if the key is enter, then send the message to the server
      vm.sendMessage = function(event) {
        var currentState = ChatService.getCurrentState();
        if (event.key === "Enter" || event.keyIdentifier === "Enter") {
          if ((event.key === "Enter" || event.keyIdentifier === "Enter") && !event.shiftKey) {
            event.preventDefault();
            if (currentState === "chat-app.privatemessages") {
              var messageToUser = vm.message;
              vm.message = "";

              ChatService.sendUserStoppedTypingPM(channelOrUserId)
              .then(function() {
                sendTypingRequest = false;
              });


              ChatService.sendPrivateMessage({
                messageTo: channelOrUserId,
                message: messageToUser,
              })
              .then(function(res) {
                $("#messageBox").focus();
              })
            }
            else {
              //If only enter key is pressed
              event.preventDefault();
              if (vm.message !== "") {
                var messageToUser = vm.message;
                vm.message = "";
                ChatService.sendUserStoppedTyping(channelOrUserId)
                .then(function() {
                  sendTypingRequest = false;
                });


                ChatService.sendMessage({
                  channelId: channelOrUserId,
                  message: JSON.stringify(messageToUser),
                });
              }
            }
          }

        }
      }

      //This function tells the server if the user has currently started typing or stopped typing.
      vm.sendUserIsTyping = function(event) {
        var currentState = ChatService.getCurrentState();
        if (currentState === "chat-app.privatemessages") {

          if (event.key !== "Enter") {
            if (vm.message) {
              if (sendTypingRequest === false) {
                sendTypingRequest = true;
                ChatService.sendUserIsTypingPM(channelOrUserId)
                .then(function(message) {
                  console.log("sent message");
                });
              }
            }
            else {
              if (sendTypingRequest === true) {
                sendTypingRequest = false;
                ChatService.sendUserStoppedTypingPM(channelOrUserId)
                .then(function(message) {
                  console.log("the user stopped typing");
                });
              }
            }
          }

        }
        else {
          if (event.key !== "Enter") {
            if (vm.message) {
              if (sendTypingRequest === false) {
                sendTypingRequest = true;
                ChatService.sendUserIsTyping(channelOrUserId)
                .then(function(message) {
                  console.log("sent message");
                });
              }
            }
            else {
              if (sendTypingRequest === true) {
                sendTypingRequest = false;
                ChatService.sendUserStoppedTyping(channelOrUserId)
                .then(function(message) {
                  console.log("the user stopped typing");
                });
              }
            }
          }
        }
      };

      //Gets all the channels from the server
      vm.getAllChannels = function(channelName) {
        if (!ChatService.channels) {
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

              if (ChatService.currentChannelIndex > 4) {
                var temp = res.data.data[ChatService.currentChannelIndex];
                vm.channels.splice(ChatService.currentChannelIndex, 1);
                vm.channels.unshift(temp);
                ChatService.currentChannelIndex = 0;
              }
            }
          })
          .catch(function(e) {
            $state.go("chat-app");
          });
        }
      };

      //Goes to another channel
      vm.goToAnotherChannel = function(channelName, $event) {
        if (channelName !== $stateParams.channelName) {
          $rootScope.showSpinner = true;
        }

        $event.preventDefault();
        $state.go("chat-app.messages", {channelName: channelName});
      };


      $scope.$on("navClicked", function() {
        vm.showDarkOverlay = true;

        $("#channel-sidebar").animate({width: "200px"}, function() {
        });
      });

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
        function(channelName) {
          //Kinda misleading but this means the user pressed the cancel button
          if (channelName === false) {
            return false;
          }

          ChatService.createNewChannel(channelName)
          .then(function(res) {
            if (res.data.response === "success") {
              swal({
                title: "Success",
                type: "success",
                text: "You have successfully made your channel",
                closeOnConfirm: true,
              }, function() {
                $scope.$apply(function() {
                  vm.channels.push(res.data.data);
                });
              });
            }
          })
          .catch(function(e) {
            var inputErrorArray = [];
            e.data.data.forEach(function(val) {

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

      //Logs the user out
      vm.logUserOut = function($event) {
        $rootScope.showSpinner = true;
        delete ChatService.channels;
        delete ChatService.users;
        delete ChatService.userState;

        $state.go("chat-app.signout");
      };

      //When the window is resized, then the scrollbar will go to the bottom.
      vm.pushScrollbarToBottom = function() {
        $window.addEventListener("resize", function(event) {
          //Will make the scrollbar go to the bottom
          messagePanel.stop().animate({
            scrollTop: messagePanel[0].scrollHeight
          }, 0);
        });
      };

      //Listens for click events if the sidebar is toggled
      vm.sidebarAnimateOnClick = function() {
        $document.on("click", function(event) {
          //If there is a dark overlay shown and the where the user clicked was bigger than 200
          if (vm.showDarkOverlay === true && event.pageX > 200) {
            $("#channel-sidebar").animate({width: "0px"}, function() {
              //Used so showDarkOverlay will update
              $scope.$apply(function(){
                vm.showDarkOverlay = false;
              });
            });
          }
        });
      };

      vm.goToPrivateMessage = function(user_id, username, event) {
        $rootScope.showSpinner = true;
        $state.go("chat-app.privatemessages", {username: username});
      }

      vm.getAllUsers = function() {
        if (!ChatService.users) {
          //Gets all users
          ChatService.getAllUsers()
          .then(function(res) {
            if (res.data.response === "success") {

              for (var i = 0;i<res.data.data.length;i++) {
                if (res.data.data[i].username === $stateParams.username) {
                  res.data.data[i].activeUser = true;
                  ChatService.currentUserIndex = i;
                }
              }

              if (ChatService.currentUserIndex > 4) {
                var temp = res.data.data[ChatService.currentUserIndex];
                res.data.data.slice(ChatService.currentUserIndex, 1);
                res.data.data.unshift(temp);
                ChatService.currentUserIndex = 0;
              }

              vm.users = res.data.data;
              ChatService.users = res.data.data;
            }
          });
        }
      };

      vm.refreshSidebarContent = function() {
        if (ChatService.channels && ChatService.users) {
          var currentState = ChatService.getCurrentState();
          var previousState = ChatService.getLastState();
          var chanOrPm;
          var newParam;


          if (previousState === "chat-app.messages") {
            chanOrPm = "chan"
          }
          else {
            chanOrPm = "pm";
          }

          if (currentState === "chat-app.messages") {
            newParam = $stateParams.channelName;
          }
          else {
            newParam = $stateParams.username;
          }

          ChatService.deleteActive(chanOrPm, newParam, currentState);
          vm.users = ChatService.users;
          vm.channels = ChatService.channels;
        }
      };

      //Go to home page
      vm.goToHome = function() {
        $rootScope.showSpinner = true;
        delete ChatService.channels;
        delete ChatService.users;
        $state.go("chat-app.landing");
      };

      //Gets the initial messages in the private conversation
      vm.getPrivateMessages = function() {
        ChatService.getPrivateMessages(channelOrUserId)
        .then(function(res) {
          if (res.data.response === "success") {
            for (var i = 0;i<res.data.data.length;i++) {
              res.data.data[i].contents = JSON.parse(res.data.data[i].contents);
            }

            console.log(res.data.data[0]);

            vm.messages = res.data.data;

            vm.messagesLoaded = true;

            $timeout(function() {
              //Scrollbar will go to bottom
              messagePanel.stop().animate({
                scrollTop: messagePanel[0].scrollHeight
              }, 200);
            }, 0);

          }
        });

      };

      vm.loadPartnerCurrentlyTyping = function() {
        ChatService.loadPartnerCurrentlyTyping({
          pm_to: channelOrUserId,
        })
        .then((res) => {
          if (res.data.response === "success") {
            vm.userTypingArray = res.data.data;

            if (res.data.data.length === 1) {
              vm.typeOfTyping = "is typing";
            }
          }
        });
      };

      $rootScope.showFixedTopNav = true;

      //Gets the users state if they were previously on the website
      if (ChatService.userState) {
        vm.userState = ChatService.userState;
      }



      //Pushes the scrollbar to bottom on page resize
      vm.pushScrollbarToBottom();

      //Will make the width of the sidebar to 0 if sidebar is not collapsed and < 700px
      vm.sidebarAnimateOnClick();

      //Gets all the channels
      vm.getAllChannels($stateParams.channelName);


      //Gets all the users
      vm.getAllUsers();


      //Refreshes the sidebar content
      vm.refreshSidebarContent();





      //If the url contains /messages, then run described functions
      if (vm.channelorPrivate === "channel") {
        var channelName = $stateParams.channelName;
        $rootScope.channelName = channelName;

        //Loads the chat messages
        vm.loadChatMessages($stateParams.channelName);

        //Loads the Users that are currently typing
        vm.loadUsersCurrentlyTyping();
      }
      else if (vm.channelorPrivate === "private") {
        $rootScope.channelName = $stateParams.username;
        //Loads all the private messages
        vm.getPrivateMessages();


        //Gets if the partner is typing
        vm.loadPartnerCurrentlyTyping();
      }
    }
  }());
