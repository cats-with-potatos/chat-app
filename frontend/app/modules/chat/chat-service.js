(function() {
  angular
  .module('chat-app.chat')
  .service('ChatService', ['$http', Service]);

  function Service($http) {
    var service = this;

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
          return res.data.data // Returns data in an array
        })
        };

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
      }

        return service;
      }
    })();
