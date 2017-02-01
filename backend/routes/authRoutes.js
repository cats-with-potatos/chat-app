const authFunctions = require("../lib/auth.js")
, authRoutes = {};

/*
//If the user logs in correctly, a JSON web token will be delivered.
*/
authRoutes.signin = (req, res) => { // TYPE: POST
  const username = req.body.username;
  const password = req.body.password;
  const checkbox = req.body.checkbox;

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
    return authFunctions.getUserImage({id: jwt.payload.id, jwt: jwt, username: username});
  })
  .then((data) => {
    if (checkbox === "true") {
      res.cookie("auth", data.jwt.token, {maxAge: 604800000, httpOnly: false});
    }
    else {
      res.cookie("auth", data.jwt.token, {httpOnly: false});
    }

    res.status(200).json({"response": "success", data: data.userdata});
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
    console.log("did I get here");
    return authFunctions.insertUserToDb(fullCredentials);
  })
  .then((id) => {
    console.log("did I get here");
    return authFunctions.addToGenChannel(id);
  })
  .then((id) => {
    console.log("did I get here");
    return authFunctions.createJwt({id: id});
  })
  .then((jwt) => {
    console.log("did I get here");
    res.cookie("auth", jwt.token, {maxAge: 604800000, httpOnly: false});

    res.status(200).json({"response": "success", data: {id: jwt.payload.id, username: username, image: "/api/userimages/default.png"}});
  })
  .catch((e) => {
    const status = e === "serverError" ? 500 : 400; //If error is server error set to 500, else set to 400
    res.status(status).json({"response": "error", "data": [e]})
  });
};

authRoutes.checkUserLoggedIn = (req, res) => {
  authFunctions.getUserInfo(req.decoded.id)
  .then((userInfo) => {
    res.json({
      "response": "success",
      "data": userInfo,
    });
  })
  .catch((e) => {
    console.log(e);
    res.status(500).json({
      "response": "error",
      "errorType": e,
    });
  })
}


module.exports = authRoutes;
