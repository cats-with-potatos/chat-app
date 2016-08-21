const bluebird = require("bluebird")
, crypto = require("crypto")
, mysqlWrap = require("./db.js")
, auth = {};

/*
Checks if the username and password are valid,
If there is an error, the error will be returns
If not, null will be returned
*/
auth.signUpError = (cred) => {
  //Checks to see if user didn't input username or password
  if (typeof cred.username === "undefined" || typeof cred.password === "undefined") {
    return "paramUndefined";
  }
  //If the user inputted nothing e.g. "   " or ""
  if (cred.username.trim() === "" || cred.password.trim() === "") {
    return "whitespace";
  }
  //If the username or pass is over 30 characters long
  if (cred.username.length > 30 || cred.password.length > 30) {
    return "tooLong";
  }
  return null;
};

//A randomly generated salt is prepended to the password and then sha1 hashed.
auth.createHashAndSalt = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.createHash('sha1').update(salt + password).digest('hex');

  return {hash, salt: salt};
};


//Checks to see if user is already in Db
auth.checkUserExists = (username) => {
  return new Promise((resolve, reject) => {
    mysqlWrap.getConnection((err, mclient) => {
      if (err) {
        reject("serverError");
      }
      else {
        mclient.query("SELECT user_id FROM UserTable WHERE username = ?", [username], (err, results) => {
          mclient.release();
          if (err) {
            reject("serverError");
          }
          else if (results.length !== 0) {
            reject("accountExists");
          }
          else {
            resolve();
          }
        });
      }
    });
  });
};

//Inserts users to Db
auth.insertUserToDb = (fullCreds) => {
  return new Promise((resolve, reject) => {
    mysqlWrap.getConnection((err, mclient) => {
      if (err) {
        reject("serverError");
      }
      else {
        console.log(fullCreds);
        mclient.query("INSERT INTO UserTable (user_id, username, password, salt) VALUES (DEFAULT, ?, ?, ?)", [
          fullCreds.username,
          fullCreds.hash,
          fullCreds.salt,
        ], (err, results) => {
          mclient.release();
          if (err) {
            console.log("do i reach here", err);
            reject("serverError");
          }
          else {
            resolve();
          }
        });
      }
    });
  });
};



module.exports = auth;
