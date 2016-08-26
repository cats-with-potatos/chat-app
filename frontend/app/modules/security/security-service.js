(function() {
  angular
  .module('chat-app.security')
  .service('SecurityService', ['$http', Service]);

  function Service($http) {
    var service = this;



    service.signup = function(creds) {
      return $http({
        method: "POST",
        url: "/api/signup",
        data: $.param({'username': creds.username, "password": creds.password, "validationPassword": creds.passwordVerif}),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }})
        .then(function(res) {
          return res;
        })
        .catch(function(e) {
          return e;
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
