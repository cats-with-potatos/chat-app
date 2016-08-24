const Promise = require("bluebird")
, io = require("./socketio.js").listen()
, mysqlWrap = require("./db.js")
, chat = {};


chat.checkMessageError = (messageDet) => {
  //Checks if any of the params are undefined
  if (typeof messageDet.userid === "undefined" || isNaN(messageDet.channelId) || typeof messageDet.message === "undefined") {
    return "paramUndefined";
  }

  //Will do some error checking here later in regards to message error checking
  return null;
};

//Checks to see if user is in channel. If they are, then resolve, else reject.
chat.checkUserInChannel = (messageDet) => {
  return new Promise((resolve, reject) => {
    mysqlWrap.getConnection((err, mclient) => {
      if (err) {
        reject("serverError");
      }
      else {
        //Check to see if user is in channel
        mclient.query("SELECT inchan_id FROM UserInChannel WHERE inchan_userid = ? AND inchan_channel_id = ?", [messageDet.userid, messageDet.channelId], (err, results) => {
          mclient.release();
          if (err) {
            reject("serverError");
          }
          else {
            if (results.length === 0) {
              reject("notInChannel");
            }
            else {
              resolve();
            }
          }
        });
      }
    });
  });
};

//Inserts the users into a database
chat.insertMessageToDb = (messageDet) => {
  return new Promise((resolve, reject) => {
    mysqlWrap.getConnection((err, mclient) => {
      if (err) {
        reject("serverError");
      }
      else {
        mclient.query("INSERT INTO MessagesTable (message_id, contents, sender, chan_link_id) VALUES (DEFAULT, ?, ?, ?)", [messageDet.message, messageDet.userid, messageDet.channelId], (err, resuts) => {
          mclient.release();
          if (err) {
            reject("serverError");
          }
          else {
            resolve();
          }
        });
      }
    })
  });
};

//Emits message to all the people in the specific channel
chat.emitMessageToChannel = (channelId) => {
  //Get all the user id's so we can emit socket.io events to them

  mysqlWrap.getConnection((err, mclient) => {
    if (err) {
      reject("serverError");
    }
    else {
      mclient.query("SELECT inchan_userid FROM UserInChannel WHERE inchan_channel_id = ?", [channelId], (err, results) => {
        mclient.release();
        if (err) {
          reject("serverError");
        }
        else {
          results.forEach((val) => {
            io.sockets.connected[clients[val.inchan_userid].socket].emit("newChannelMessage", {
              channelId: channelId,
            });
          });
        }
      });
    }
  });
};

module.exports = chat;
