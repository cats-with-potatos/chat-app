const Promise = require("bluebird")
, mysqlWrap = require("./db.js")
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

module.exports = channel;
