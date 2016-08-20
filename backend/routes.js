const crypto = require("crypto")
, mysql = require("mysql")
, routes = {};

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'chatdb'
});

connection.connect();

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
  const username = req.body.username;
  const password = req.body.password;

  //Checks to see if user didn't input username or password
  if (typeof username === "undefined" || typeof password === "undefined") {
    res.json({"response": "error", "errorType": "paramUndefined"})
    return;
  }

  //If the user inputted nothing e.g. "   " or ""
  if (username.trim() === "" || password.trim() === "") {
    res.json({"response": "error", "errorType": "whitespace"});
    return;
  }

  //If the username or pass is over 30 characters long
  if (username.length > 30 || password.length > 30) {
    res.json({"response": "error", "errorType": "tooLong"});
    return;
  }

  //Creates a rando salt. Length of salt is 32 chars
  const salt = crypto.randomBytes(16).toString("hex");
  //Creates a sha1 hash of salt + password e.g. sha1(salt + password)
  const hash = crypto.createHash('sha1').update(salt + password).digest('hex');

  //Check to see if username already exists (NOT CASE SENSITIVE)
  connection.query("SELECT user_id FROM UserTable WHERE username = ?", [username], (err, results) => {
    if (err) {
      res.json({"response": "error", "errorType": "serverError"});
      return;
    }
    //Ff it does then respond with error
    if (results.length !== 0) {
      res.json({"response": "error", "errorType": "accountExists"});
      return;
    }
    //If not instead into database
    connection.query("INSERT INTO UserTable (user_id, username, password, salt) VALUES (DEFAULT, ?, ?, ?)", [
      username,
      hash,
      salt,
    ], (err, results) => {
      if (err) {
        res.json({"response": "error", "errorType": "serverError"});
        return;
      }
      //If there are no errors, send success message
      res.json({"response": "success"});
    });
  });
};




routes.getChannelMessages = (req, res) => { // TYPE: "GET"
const channelId = req.query.channelId;
//Logic goes here
res.json({"response": "success"});
};

module.exports = routes;
