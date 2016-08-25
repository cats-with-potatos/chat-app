(function() {
  'use strict';
  angular
  .module('chat-app.security')
  .controller('SecurityController', ['$state', 'SecurityService', Controller]);
  function Controller($state, SecurityService) {
    var vm = this;
    vm.buttonDisabled = false;

    //Function called when signing up
    vm.signup = function() {
      //Check to see if form input is not undefined
      if (typeof vm.input !== "undefined" && typeof vm.input.username !== "undefined" && typeof vm.input.password !== "undefined" && typeof vm.input.passwordVerif !== "undefined") {
        //Disable button so users can't press it too many times in a row
        vm.buttonDisabled = true;

        //Call /api/signup route.
        SecurityService.signup({
          username: vm.input.username,
          password: vm.input.password,
          passwordVerif: vm.input.passwordVerif,
        })
        .then((res) => {
          //Set the buttonDisabled to false
          vm.buttonDisabled = false;

          if (res.data.response === "success") {
            //Show no error messages
            vm.errorMessage = false;

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
          fm.buttonDisabled = false;
        });
      }
    };
  }
}());
