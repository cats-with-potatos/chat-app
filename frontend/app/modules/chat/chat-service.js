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
          url: "/api/getChannelMessages?channelId=" + channel.channelId,
          headers: {
            Authorization: "Bearer " + Cookies.get("auth"),
          }
        })
        .then(function(res) {
          const messagesArray = [];

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
      service.sendUserIsTyping = function() {
        return $http({
          method: "POST",
          url: "/api/sendUserIsTyping",
          headers: {
            Authorization: "Bearer " + Cookies.get("auth"),
            'Content-Type': "application/x-www-form-urlencoded",
          }
        });
      };

      //Sends to the server that the user has stopped typing
      service.sendUserStoppedTyping = function() {
        return $http({
          method: "POST",
          url: "/api/sendUserStoppedTyping",
          headers: {
            Authorization: "Bearer " + Cookies.get("auth"),
            'Content-Type': "application/x-www-form-urlencoded",
          }
        });
      };

      //This gets all the users that are currently typing. This function will be run on controller load
      service.getUsersCurrentlyTyping = function() {
        return $http({
          method: "GET",
          url: "/api/getIntialUsersTyping",
          headers: {
            Authorization: "Bearer " + Cookies.get("auth"),
          }
        });
      }
      return service;
    }
  })();
