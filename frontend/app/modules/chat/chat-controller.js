(function() {
  'use strict';
  angular
  .module('chat-app.chat')
  .controller('ChatController', ['SampleService', Controller]);

  function Controller(SampleService) {
    var vm = this;
    vm.showChatMessage = function() {
      SampleService.makeChatMessage().then(function(messages) {
          vm.messages = messages;
      });
    };
  }

}());
