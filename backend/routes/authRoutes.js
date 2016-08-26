const authFunctions = require("../lib/auth.js")
, authRoutes = {};

/*
//If the user logs in correctly, a JSON web token will be delivered.
*/
authRoutes.signin = (req, res) => { // TYPE: POST
  const username = req.body.username;
  const password = req.body.password;

  //Check if user exists to get hash
  authFunctions.checkUserExists(username)
  .then((user) => {
    return authFunctions.checkPass(
      {
        password: password,
        hash: user.password,
        salt: user.salt,
        username: user.username,
        id: user.user_id,
      })
  })
  .then((jwtPayload) => {
    return authFunctions.createJwt(jwtPayload);
  })
  .then((jwt) => {
    console.log(jwt);
    res.cookie("auth", jwt, {maxAge: 604800, httpOnly: false});
    res.status(200).json({"response": "success"});
  })
  .catch((e) => {
    const status = e === "serverError" ? 500 : 400; //If error is server error set to 500, else set to 400
    res.status(status).json({"response": "error", "errorType": e})
  })
};

authRoutes.signup = (req, res) => { //TYPE: POST
  //Get username and password and validationPassword from body
  const username = req.body.username;
  const password = req.body.password;
  const validationPassword = req.body.validationPassword;

  const credentials = {
    username: username,
    password: password,
    validationPassword: validationPassword,
  };

  //Validate credentials
  const signUpError = authFunctions.signUpError(credentials);

  if (signUpError.length !== 0) {
    res.status(400).json({"response": "error", "data": signUpError});
    return;
  }

  //Checks if user exists
  authFunctions.checkUserDoesNotExist(username)
  .then(() => {
    //Create hash and salt
    const hashAndSalt = authFunctions.createHashAndSalt(password)
    const hash = hashAndSalt.hash;
    const salt = hashAndSalt.salt;


    const fullCredentials = {
      username: username,
      hash: hash,
      salt: salt,
    };

    //Insert user to db since user does not exist
    return authFunctions.insertUserToDb(fullCredentials);
  })
  .then((id) => {
    return authFunctions.addToGenChannel(id);
  })
  .then((id) => {
    return authFunctions.createJwt({username: username, id: id});
  })
  .then((token) => {
    console.log(token);
    res.cookie("auth", token, {maxAge: 604800, httpOnly: false});
    res.status(200).json({"response": "success"});
  })
  .catch((e) => {
    const status = e === "serverError" ? 500 : 400; //If error is server error set to 500, else set to 400
    res.status(status).json({"response": "error", "data": [e]})
  });
};


module.exports = authRoutes;
