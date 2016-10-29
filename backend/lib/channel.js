const Promise = require("bluebird")
, mysqlWrap = require("./db.js")
, chat = require("./chat.js")
, channel = {};


channel.checkNameError = (channelName) => {
  const errorsArray = [];

  //Check is the channelName is either undefined or the trimmed length is an empty string
  if (typeof channelName === "undefined" || channelName.trim() === "") {
    return ["paramUndefined"];
  }

  //Checks if the length of the channel is over 30
  if (channelName.length > 30) {
    errorsArray.push("tooLong");
  }

  //Channel name must only have undercase, uppercase, numbers and _ and -
  if (/[^a-zA-Z0-9_-]/.test(channelName)){
    errorsArray.push("badName");
  }

  return errorsArray;
};

//Checks if the channel name is already in the database
channel.checkChannelNameNotExists = (channelName) => {
  return new Promise((resolve, reject) => {
    mysqlWrap.getConnection((err, mclient) => {
      if (err) {
        reject("serverError");
      }
      else {
        mclient.query("SELECT chan_id FROM ChannelsTable WHERE chan_name like binary ?", [channelName], (err, results) => {
          mclient.release();
          if (err) {
            console.log(err);
            reject("serverError");
          }
          else if (results.length !== 0) {
            reject("channelExists");
          }
          else {
            resolve();
          }
        });
      }
    });
  });
};


//Checks if the channel name is already in the database
channel.checkChannelNameExists = (channelName) => {
  return new Promise((resolve, reject) => {
    mysqlWrap.getConnection((err, mclient) => {
      if (err) {
        reject("serverError");
      }
      else {
        mclient.query("SELECT chan_id FROM ChannelsTable WHERE chan_name like binary ?", [channelName], (err, results) => {
          mclient.release();
          if (err) {
            reject("serverError");
          }
          else if (results.length === 0) {
            reject("channelNotExists");
          }
          else {
            resolve(results[0].chan_id);
          }
        });
      }
    });
  });
};


//Inserts the channel into the database
channel.insertChannelToDb = (channelName) => {
  return new Promise((resolve, reject) => {
    mysqlWrap.getConnection((err, mclient) => {
      if (err) {
        reject("serverError");
      }
      else {
        mclient.query("INSERT INTO ChannelsTable (chan_id, chan_name) VALUES (DEFAULT, ?)", [channelName], (err, results) => {
          mclient.release();
          if (err) {
            console.log(err);
            reject("serverError");
          }
          else {
            chat.userTypingMap[results.insertId] = new Set();
            resolve();
          }
        });
      }
    });
  });
};

//Gets all channels from db
channel.getAllChannels = () => {
  return new Promise((resolve, reject) => {
    mysqlWrap.getConnection((err, mclient) => {
      if (err) {
        reject("serverError")
      }
      else {
        mclient.query("SELECT * FROM ChannelsTable", (err, data) => {
          mclient.release();
          if (err) {
            reject("serverError");
          }
          else {
            resolve(data);
          }
        });
      }
    })
  });
};



//Checks if the user is not already in the channel
channel.checkUserNotInChannel = (obj) => {
  return new Promise((resolve, reject) => {
    mysqlWrap.getConnection((err, mclient) => {
      if (err) {
        reject("serverError");
      }
      else {
        mclient.query("SELECT inchan_id FROM UserInChannel WHERE inchan_userid = ? AND inchan_channel_id = ?", [obj.userid, obj.channelId], (err, data) => {
          mclient.release();
          if (err) {
            reject("serverError");
          }
          else {
            if (data.length !== 0) {
              reject("userAlreadyInChannel");
            }
            else {
              resolve(obj.channelId);
            }
          }
        });
      }
    });
  });
};


//Adds the current user to the channel id specified
channel.addUserToChannel = (obj) => {
  return new Promise((resolve, reject) => {
    mysqlWrap.getConnection((err, mclient) => {
      if (err) {
        reject("serverError");
      }
      else {
        mclient.query("INSERT INTO UserInChannel (inchan_id, inchan_userid, inchan_channel_id) VALUES (DEFAULT, ?, ?)", [obj.userid, obj.channelId], (err, data) => {
          mclient.release();
          if (err) {
            console.log(err);
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

//Gets the channel id from the channel name.
channel.getIdFromName = (channelName) => {
  return new Promise((resolve, reject) => {
    mysqlWrap.getConnection((err, mclient) => {
      if (err) {
        reject("serverError");
      }
      else {
        mclient.query("SELECT chan_id FROM ChannelsTable WHERE chan_name = ?", [channelName], (err, data) => {
          mclient.release();
          if (err) {
            reject("serverError");
          }
          else {
            if (data.length === 0) {
              reject("channelDoesNotExist");
            }
            else {
              resolve(data[0].chan_id)
            }
          }
        });
      }
    });
  });
};


module.exports = channel;
