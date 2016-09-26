(function() {
  angular
  .module('chat-app.security')
  .service('SecurityService', ['$http', Service]);

  function Service($http) {
    var service = this;


    //signup service
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

      //signin/login service
      service.signin = function(creds) {
        return $http({
          method: "POST",
          url: "/api/signin",
          data: $.param({'username': creds.username, "password": creds.password, checkbox: creds.checkbox}),
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

        service.checkUserLoggedIn = function() {
          return $http(
            {
              method: "POST",
              url: "/api/checkUserLoggedIn",
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': "Bearer " + Cookies.get("auth"),
              }
            }
          );
        };
        return service;
      };
    })();
