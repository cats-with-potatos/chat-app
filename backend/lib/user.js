const mysqlWrap = require("./db.js")
, Promise = require("bluebird")
, user = {};

//Checks if the user exists
user.checkUserExists = (username) => {
  return new Promise((resolve, reject) => {
    mysqlWrap.getConnection((err, mclient) => {
      if (err) {
        reject("serverError");
      }
      else {
        mclient.query("SELECT user_id FROM UserTable WHERE username = ?", [username], (err, data) => {
          mclient.release();
          if (err) {
            reject("serverError");
          }
          else {
            if (data.length === 0) {
              reject("userDoesNotExist");
            }
            else {
              resolve(data[0].user_id);
            }
          }
        });
      }
    });
  });
};

//Gets all the users from the UserTable
user.getAllUsers = (userid) => {
  return new Promise((resolve, reject) => {
    mysqlWrap.getConnection((err, mclient) => {
      if (err) {
        reject("serverError");
      }
      else {
        mclient.query("SELECT * FROM UserTable WHERE user_id != ? ", [userid], (err, data) => {
          if (err) {
            reject("serverError");
          }
          else {
            resolve(data);
          }
        });
      }
    });
  });
};

module.exports = user;
