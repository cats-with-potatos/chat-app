const bluebird = require("bluebird")
, crypto = require("crypto")
, jwt = require("jsonwebtoken")
, config = require("../config.js")
, mysqlWrap = require("./db.js")
, auth = {};


/*
Checks if the username and password are valid,
If there is an error, the error will be returns
If not, null will be returned
*/
auth.signUpError = (cred) => {
  const errorArray = [];

  //Checks to see if user didn't input username or password
  if (typeof cred.username === "undefined" || typeof cred.password === "undefined" || typeof cred.validationPassword === "undefined" || cred.username.trim() === "" || cred.password.trim() === "" || cred.validationPassword.trim() === "") {
    return ["paramUndefined"];
  }
    //If the username or pass is over 30 characters long
  if (cred.username.length > 30 || cred.password.length > 30) {
    errorArray.push("tooLong");
  }
  // Regular expression to match a username. Can only have upper/lowercase, numbers, and _ or -
  if (/[^a-zA-Z0-9_-]/.test(cred.username)){
    errorArray.push("badUsername");
  }
  /*
  Uses 3 regular expressions tested in order. If pass doesn't have an uppercase char,
  a lowercase char, and a number, it fails.
  */
  if (!/[a-z]/.test(cred.password) ||
  !/[A-Z]/.test(cred.password) ||
  !/[0-9]/.test(cred.password)){
    errorArray.push("badPassword");
  }
  if (cred.password !== cred.validationPassword){
    errorArray.push("passNoMatch");
  }
  return errorArray;
};

//A randomly generated salt is prepended to the password and then sha1 hashed.
auth.createHashAndSalt = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.createHash('sha1').update(salt + password).digest('hex');

  return {hash: hash, salt: salt};
};




//Checks to see if user if the user does not exist
auth.checkUserDoesNotExist = (username) => {
  return new Promise((resolve, reject) => {
    mysqlWrap.getConnection((err, mclient) => {
      if (err) {
        reject("serverError");
      }
      else {
        mclient.query("SELECT user_id FROM UserTable WHERE username like binary ?", [username], (err, results) => {
          mclient.release();
          if (err) {
            reject("serverError");
          }
          //If results array is not 0, then someone has the same name
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
        mclient.query("INSERT INTO UserTable (user_id, username, password, salt) VALUES (DEFAULT, ?, ?, ?)", [
          fullCreds.username,
          fullCreds.hash,
          fullCreds.salt,
        ], (err, results) => {
          mclient.release();
          if (err) {
            reject("serverError");
          }
          else {
            resolve(results.insertId);
          }
        });
      }
    });
  });
};

//Gets a user's id and username and returns a JWT
auth.createJwt = (user) => {
  return new Promise((resolve, reject) => {
    //If any params are undefined, return serverError
    if (typeof user === "undefined" || typeof config.JWT_PASSWORD === "undefined") {
      reject("serverError");
    }
    else {
      //Makes the jwt with the payload being the user object and password being the JWT_PASSWORD
      jwt.sign(user, config.JWT_PASSWORD, {
        expiresIn: 604800,
      }, (err, token) => {
        if (err) {
          reject("serverError");
        }
        else {
          resolve(token);
        }
      })
    }
  });
};

auth.checkJwt = (token) => {
  return new Promise((resolve, reject) => {
    //Checks if token param was undefined
    if (typeof token === "undefined") {
      reject("serverError");
    }
    else {
      //Verifies the token against the JWT_PASSWORD
      jwt.verify(token, config.JWT_PASSWORD, (err, decoded) => {
        if (err) {
          reject("serverError");
        }
        else {
          resolve(decoded);
        }
      })
    }
  });
};

//Checks if user is already in database
auth.checkUserExists = (username) => {
  return new Promise((resolve, reject) => {
    mysqlWrap.getConnection((err, mclient) => {
      if (err) {
        reject("serverError");
      }
      else {
        mclient.query("SELECT * FROM UserTable WHERE username like binary ?", [username], (err, results) => {
          mclient.release();
          if (err) {
            reject("serverError");
          }
          else if (results.length === 0) {
            reject("wrongCred");
          }
          else {
            resolve(results[0]);
          }
        });
      }
    });
  });
};


//Checks if the hash(salt + inputtedPassword) is equal to the hash in db
auth.checkPass = (cred) => {
  return new Promise((resolve, reject) => {
    const newHash = crypto.createHash('sha1').update(cred.salt + cred.password).digest('hex');
    if (newHash === cred.hash) {
      resolve({
        id: cred.id,
        username: cred.username
      });
    }
    else {
      reject("wrongCred");
    }
  });
};

//Adds the user to the general channel
auth.addToGenChannel = (id) => {
  return new Promise((resolve, reject) => {
    mysqlWrap.getConnection((err, mclient) => {
      if (err) {
        reject("serverError");
      }
      else {
        mclient.query("INSERT INTO UserInChannel (inchan_id, inchan_userid, inchan_channel_id) VALUES (DEFAULT, ?, ?)", [id, 1], (err, results) => {
          mclient.release();
          if (err) {
            reject("serverError");
          }
          else {
            resolve(id);
          }
        });
      }
    })
  });
};


module.exports = auth;
