(function() {
  'use strict';
  angular
  .module('chat-app.security')
  .controller('SecurityController', ['$state' , '$location', '$rootScope', 'SecurityService', Controller]);


  function Controller($state, $location, $rootScope, SecurityService) {
    var vm = this;
    vm.buttonDisabled = false;
    vm.checkbox = false;

    $rootScope.channelName = "";


    //Function called when signing up
    vm.signup = function() {
      //Check to see if form input is not undefined
      if (vm.input && vm.input.username && vm.input.password && vm.input.passwordVerif) {
        //Disable button so users can't press it too many times in a row
        vm.buttonDisabled = true;

        //Call /api/signup route.
        SecurityService.signup({
          username: vm.input.username,
          password: vm.input.password,
          passwordVerif: vm.input.passwordVerif,
        })
        .then(function(res) {
          //Set the buttonDisabled to false
          vm.buttonDisabled = false;

          if (res.data.response === "success") {
            //Show no error messages
            vm.errorMessage = false;
            $rootScope.notLoggedIn = false;
            $rootScope.loggedIn = true;;
            $rootScope.username = res.data.data.username;
            $rootScope.userid = res.data.data.id;
            $rootScope.profilepic = res.data.data.image;
            $state.go('chat-app.messages');
          }
          else {
            //Iterate through the error messages and add them to array
            vm.errorMessage = [];
            res.data.data.forEach(function(val) {
              switch (val) {
                case "paramUndefined":
                //Please change this error message, it is truly cancer..
                vm.errorMessage.push("Please make sure all the fields are filled in");
                break;
                case "tooLong":
                vm.errorMessage.push("Please make sure your credentials are not longer than 30 characters");
                break;
                case "badUsername":
                vm.errorMessage.push("Username can only have lower, upper case letter and number");
                break;
                case "badPassword":
                vm.errorMessage.push("Password must have lower, upper case letter and number");
                break;
                case "passNoMatch":
                vm.errorMessage.push("Please make sure your passwords match");
                break;
                case "accountExists":
                vm.errorMessage.push("Sorry.. This account name already exists");
                break;
                default:
                vm.errorMessage.push("Sorry there was an error with the server");
              }
            });
          }
        })
        .catch(function(e) {
          vm.buttonDisabled = false;
        });
      }
    };


    //Function logs the user out
    vm.logUserOut = function() {
      $state.go();
    };

    //Function called when signing in
    vm.signin = function() {
      //Check to see if form input is not undefined
      if (vm.input && vm.input.username && vm.input.password) {
        //Disable button so users can't press it too many times in a row
        vm.buttonDisabled = true;

        //Call /api/signin route.
        SecurityService.signin({
          username: vm.input.username,
          password: vm.input.password,
          checkbox: vm.checkbox,
        })
        .then(function(res) {
          //Set the buttonDisabled to false
          vm.buttonDisabled = false;

          if (res.data.response === "success") {
            //Show no error messages
            vm.errorMessage = false;
            $rootScope.loggedIn = true;
            $rootScope.notLoggedIn = false;
            $rootScope.username = res.data.data.username;
            $rootScope.userid = res.data.data.id;
            $rootScope.profilepic = res.data.data.image;


            $state.go('chat-app.messages');
          }
          else {
            //Error message - just display error, do not clear fields.
            vm.errorMessage = "Invalid username or password! Please try again.";
          }
        })
        .catch(function(e) {
          vm.buttonDisabled = false;
        });
      }
    };

    vm.signout = function() {
      Cookies.remove("auth")
      setTimeout(function() {
        $rootScope.loggedIn = false;
        $rootScope.notLoggedIn = true;
        $state.go("chat-app");
      }, 2000);
    }


    //Code in if statement only runs if user is on /signout page
    if ($location.path() === "/signout") {
      vm.signout();
    }

    //Hide navbar-fixed-top class on messages page
    $rootScope.showFixedTopNav = undefined;

  }
}());
