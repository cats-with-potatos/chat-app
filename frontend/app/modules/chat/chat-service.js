(function() {
  angular
  .module('chat-app.chat')
  .service('ChatService', ['$http', '$rootScope', Service]);

  function Service($http, $rootScope) {
    var service = this;

    var lastState = null;
    var currentState = null;

    $rootScope.$on('$stateChangeSuccess',
    function(event, toState, toParams, fromState, fromParams){
      lastState = fromState.name;
      currentState = toState.name;
    });

    service.getLastState = function() {
      return lastState;
    };


    service.getCurrentState = function() {
      return currentState;
    };

    //This will get all messages from the specific channel from the server
    service.getChatMessages = function(channel) {
      return $http(
        {
          method: "GET",
          url: "/api/getChannelMessages?channelName=" + channel.channelName,
          headers: {
            Authorization: "Bearer " + Cookies.get("auth"),
          }
        })
        .then(function(res) {
          var messagesArray = [];

          res.data.data.forEach(function(val) {
            val.contents = JSON.parse(val.contents); //Parses the stringified string
            messagesArray.push(val);
          });

          return messagesArray; // Returns data in an array
        })
      };


      //Sends a message to the server.
      service.sendMessage = function(data) {
        return $http({
          method: "POST",
          url: "/api/sendChatMessage",
          data: $.param({channelId: data.channelId, message: data.message}),
          headers: {
            Authorization: "Bearer " + Cookies.get("auth"),
            'Content-Type': "application/x-www-form-urlencoded",
          }
        })
      };

      //Sends to the server that the user is typing
      service.sendUserIsTyping = function(channelId) {
        return $http({
          method: "POST",
          url: "/api/sendUserIsTyping",
          data: $.param({channelId: channelId}),
          headers: {
            Authorization: "Bearer " + Cookies.get("auth"),
            'Content-Type': "application/x-www-form-urlencoded",
          }
        });
      };

      //Sends to the server that the user has stopped typing
      service.sendUserStoppedTyping = function(channelId) {
        return $http({
          method: "POST",
          url: "/api/sendUserStoppedTyping",
          data: $.param({channelId: channelId}),
          headers: {
            Authorization: "Bearer " + Cookies.get("auth"),
            'Content-Type': "application/x-www-form-urlencoded",
          }
        });
      };

      //This gets all the users that are currently typing. This function will be run on controller load
      service.getUsersCurrentlyTyping = function(channelId) {
        return $http({
          method: "GET",
          url: "/api/getIntialUsersTyping?channelId=" + channelId,
          headers: {
            Authorization: "Bearer " + Cookies.get("auth"),
          }
        });
      };

      //Gets all the channels from the server
      service.getAllChannels = function() {
        return $http({
          method: "GET",
          url: "/api/getAllChannels",
          headers: {
            Authorization: "Bearer " + Cookies.get("auth"),
          }
        });
      };

      //Checks if the user is in the channel
      service.checkUserInChannel = function(channelName) {
        return $http({
          method: "GET",
          url: "/api/checkUserInChannel?channelName=" + channelName,
          headers: {
            Authorization: "Bearer " + Cookies.get("auth"),
          }
        });
      };

      service.addUserToChannel = function(channelName) {
        return $http({
          method: "POST",
          url: "/api/addUserToChannel",
          data: $.param({channelName: channelName}),
          headers: {
            Authorization: "Bearer " + Cookies.get("auth"),
            'Content-Type': "application/x-www-form-urlencoded",
          },
        });
      };

      service.createNewChannel = function(channelName) {
        return $http({
          method: "POST",
          url: "/api/createNewChannel",
          data: $.param({channelName: channelName}),
          headers: {
            Authorization: "Bearer " + Cookies.get("auth"),
            'Content-Type': "application/x-www-form-urlencoded",
          },
        });
      };

      service.deleteMessage = function(obj) {
        return $http({
          method: "DELETE",
          url: "/api/deleteMessage?messageId=" + obj.messageId + "&channelId=" + obj.channelId,
          headers: {
            Authorization: "Bearer " + Cookies.get("auth"),
          },
        });
      };

      service.editMessage = function(obj) {
        return $http({
          method: "PUT",
          url: "/api/updateMessage",
          data: $.param({messageId: obj.messageId, channelId: obj.channelId, contents: JSON.stringify(obj.contents)}),
          headers: {
            Authorization: "Bearer " + Cookies.get("auth"),
            'Content-Type': "application/x-www-form-urlencoded",
          },
        });
      };

      service.checkUserExists = function(username) {
        return $http({
          method: "GET",
          url: "/api/checkUserExists?username=" + username,
          headers: {
            Authorization: "Bearer " + Cookies.get("auth"),
          },
        });
      };

      service.getAllUsers = function() {
        return $http({
          method: "GET",
          url: "/api/getAllUsers",
          headers: {
            Authorization: "Bearer " + Cookies.get("auth"),
          },
        });
      };


      service.sendPrivateMessage = function(obj) {
        return $http({
          method: "POST",
          url: "/api/sendPrivateMessage",
          data: $.param({messageTo: obj.messageTo, message: JSON.stringify(obj.message)}),
          headers: {
            Authorization: "Bearer " + Cookies.get("auth"),
            'Content-Type': "application/x-www-form-urlencoded",
          },
        });
      };

      service.getPrivateMessages = function(userToId) {
        return $http({
          method: "GET",
          url: "/api/getPrivateMessages?userTo=" + userToId,
          headers: {
            Authorization: "Bearer " + Cookies.get("auth"),
          },
        });
      };



      service.findNewActive = function(currentState, newParam) {
        if (currentState === "chat-app.messages") {
          for (var i = 0;i<service.channels.length;i++) {
            if (service.channels[i].chan_name === newParam) {
              service.channels[i].activeChannel = true;
              service.currentChannelIndex = i;
              return;
            }
          }
        }
        else {

          for (var i = 0;i<service.users.length;i++) {
            if (service.users[i].username === newParam) {
              service.users[i].activeUser = true;
              service.currentUserIndex = i;
              return;
            }
          }
        }
      };

      service.deleteActive = function(chanOrPm, newParam, currentState) {
        if (chanOrPm === "chan") {
          delete service.channels[service.currentChannelIndex].activeChannel;
          service.findNewActive(currentState, newParam);
          return;
        }

        delete service.users[service.currentUserIndex].activeUser;
        service.findNewActive(currentState, newParam);
        return;
      };
      return service;
    }
  })();
