(function() {
  angular
  .module('chat-app.chat')
  .service('ChatService', ['$http', Service]);

  function Service($http) {
    var service = this;

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

      return service;
    }
  })();
