const mysqlWrap = require("./db.js")
, Promise = require("bluebird")
, fs = require("fs")
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
        mclient.query("SELECT user_id, username FROM UserTable WHERE user_id != ? ", [userid], (err, data) => {
          mclient.release();
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

//Checks if there is an error with the new inputted username
user.checkUserNameError = (username) => {
  const errorArray = [];

  //Checks to see if user didn't input username or password
  if (!username || username.trim() === "") {
    return ["paramUndefined"];
  }
  //If the username or pass is over 30 characters long
  if (username.length > 30) {
    errorArray.push("tooLong");
  }
  // Regular expression to match a username. Can only have upper/lowercase, numbers, and _ or -
  if (/[^a-zA-Z0-9_-]/.test(username)){
    errorArray.push("badUsername");
  }

  return errorArray;
};

//Checks if the user arleady exists
user.checkUserAlreadyExists = (obj) => {
  return new Promise((resolve, reject) => {
    mysqlWrap.getConnection((err, mclient) => {
      if (err) {
        console.log(err);
        reject("serverError")
      }
      else {
        mclient.query("SELECT user_id FROM UserTable WHERE username = ?", [obj.username], (err, data) => {
          mclient.release();
          if (err) {
            console.log(err);
            reject("serverError")
          }
          else {
            if (data.length === 0 || data[0].user_id === obj.userid) {
              resolve();
            }
            else {
              reject("userAlreadyExists");
            }
          }
        });
      }
    });
  });
};

user.changeUserName = (obj) => {
  return new Promise((resolve, reject) => {
    mysqlWrap.getConnection((err, mclient) => {
      if (err) {
        console.log(err);
        reject("serverError");
      }
      else {
        mclient.query("UPDATE UserTable SET username = ? WHERE user_id = ?", [obj.username, obj.userid], (err, data) => {
          mclient.release();
          if (err) {
            console.log(err);
            reject("serverError");
          }
          else {
            console.log(err);
            resolve();
          }
        });
      }
    });
  })
};

user.getOldImage = (obj) => {
  return new Promise((resolve, reject) => {
    mysqlWrap.getConnection((err, mclient) => {
      if (err) {
        return reject("serverError");
      }

      mclient.query("SELECT image FROM UserTable WHERE user_id = ?", [obj.userid], (err, data) => {
        mclient.release();
        if (err) {
          return reject("serverError");
        }

        if (data.length !== 1) {
          return reject("userDoesNotExist");
        }

        resolve(data[0].image);
      });
    })
  })
};

user.deleteOldImage = (obj) => {
  return new Promise((resolve, reject) => {
        fs.unlink(`public${obj.oldImage}`, (err, result) => {
        if (err) {
          console.log(err);
          return reject("serverError");
        }
        resolve();
      });
  });
};

user.setNewImage = (obj) => {
  return new Promise((resolve, reject) => {
    mysqlWrap.getConnection((err, mclient) => {
      if (err) {
        return reject("serverError");
      }
      mclient.query("UPDATE UserTable SET image = ? WHERE user_id = ?", [`/api/userimages/${obj.image}`, obj.userid], (err, data) => {
        if (err) {
          return reject("serverError");
        }
        resolve();
      });
    });
  });
};






module.exports = user;
