(function() {
  angular
    .module('chat-app.sample')
    .service('SampleService', ['$http', Service]);

  function Service($http) {
    var service = this;
    service.makeCall = function() {
      return $http.get('data.json').then(function(response) {
        return response.data;
      });
    };

    service.makeExpressCall = function() {
      return $http.get('/api').then(function(response) {
        return response.data;
      });
    };
    return service;
  }
})();
