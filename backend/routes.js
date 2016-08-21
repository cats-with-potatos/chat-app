const authFunctions = require("./lib/auth.js")
, routes = {};


/*
Will get all the messages from all the channels.

"1" and "2" mark the channel id's

Example output
---------------
{
"response: "success",
data: {
"1": [{from:{user_id: 1, user_name: "raf"}, message: "This is my message!"},
{from:{user_id: 2, user_name: "jp"}, message: "This is jp's message message!"}]
"2": [{from:{user_id: 1, user_name: "raf"}, message: "This is my message!"},
{from:{user_id: 2, user_name: "jp"}, message: "This is jp's message message!"}]
}
}
*/
routes.getAllMessages = (req, res) => { // TYPE: GET
  //Logic goes here
  res.json({"response": "success"});
};

/*
//If the user logs in correctly, a JSON web token will be delivered.
*/
routes.signin = (req, res) => { // TYPE: "POST"
const username = req.body.username;
const password = req.body.password;
res.json({"response": "success"});
}

routes.signup = (req, res) => {
  //Get username and password from body
  const username = req.body.username;
  const password = req.body.password;

  const credentials = {
    username: username,
    password: password
  };

  const signUpError = authFunctions.signUpError(credentials);

  if (signUpError) {
    res.json({"response": "error", "errorType": signUpError});
    return;
  }

  //Checks if user exists, if not then resolve, else reject
  authFunctions.checkUserExists(username)
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

    //Insert user to db
    return authFunctions.insertUserToDb(fullCredentials);
  })
  .then(() => {
    res.json({"response": "success"});
  })
  .catch((e) => {
    console.log(e);
    res.json({"response": "error", "errorType": e})
  });
};

routes.getChannelMessages = (req, res) => { // TYPE: "GET"
const channelId = req.query.channelId;
//Logic goes here
res.json({"response": "success"});
};

module.exports = routes;
