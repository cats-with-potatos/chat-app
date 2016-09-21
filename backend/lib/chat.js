const Promise = require("bluebird")
, io = require("./socketio.js").listen()
, clients = require("./socketio.js").clients
, mysqlWrap = require("./db.js")
, chat = {}
// userTypingMap is a dictionary that defines who is currently typing
, userTypingMap = {}


chat.checkMessageError = (messageDet) => {
  //Checks if any of the params are undefined
  if (typeof messageDet.userid === "undefined" || isNaN(messageDet.channelId) || typeof messageDet.message === "undefined") {
    return "paramError";
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
        mclient.query("INSERT INTO MessagesTable (message_id, contents, sender, chan_link_id) VALUES (DEFAULT, ?, ?, ?)", [messageDet.message, messageDet.userid, messageDet.channelId], (err, results) => {
          mclient.release();
          if (err) {
            reject("serverError");
          }
          else {
            resolve(results.insertId);
          }
        });
      }
    })
  });
};

//Emits message to all the people in the specific channel
chat.emitMessageToChannel = (messageInfo) => {
  //Get all the user id's so we can emit socket.io events to them
  return new Promise((resolve, reject) => {
    mysqlWrap.getConnection((err, mclient) => {
      if (err) {
        reject("serverError");
      }
      else {
        mclient.query("SELECT inchan_userid FROM UserInChannel WHERE inchan_channel_id = ?", [messageInfo.chan_id], (err, results) => {
          mclient.release();
          if (err) {
            reject("serverError");
          }
          else {
            results.forEach((val) => {
              if (typeof clients[val.inchan_userid] !== "undefined") {
                console.log(val.inchan_userid);
                io.sockets.connected[clients[val.inchan_userid].socket].emit("newChannelMessage", messageInfo);
              }
            });
            resolve();
          }
        });
      }
    });
  })
};

chat.getMessagesInfo = (messageId) => {
  return new Promise((resolve, reject) => {
    mysqlWrap.getConnection((err, mclient) => {
      if (err) {
        reject("serverError");
      }
      else {
        mclient.query("SELECT MessagesTable.message_id, MessagesTable.contents, UserTable.user_id, UserTable.username, ChannelsTable.chan_id, ChannelsTable.chan_name FROM MessagesTable INNER JOIN UserTable ON MessagesTable.sender = UserTable.user_id INNER JOIN ChannelsTable ON MessagesTable.chan_link_id = ChannelsTable.chan_id WHERE MessagesTable.message_id = ?", [messageId], (err, results) => {
          mclient.release();
          if (err) {
            reject("serverError");
          }
          else {
            resolve(results[0]);
          }
        });

      }
    });
  });
};

//Gets all messages from channel
chat.getAllChannelMessages = (channel) => {
  return new Promise((resolve, reject) => {
    mysqlWrap.getConnection((err, mclient) => {
      if (err) {
        reject("serverError");
      }
      else {
        mclient.query("SELECT MessagesTable.message_id, MessagesTable.contents, UserTable.user_id, UserTable.username, ChannelsTable.chan_id, ChannelsTable.chan_name FROM MessagesTable INNER JOIN UserTable ON MessagesTable.sender = UserTable.user_id INNER JOIN ChannelsTable ON MessagesTable.chan_link_id = ChannelsTable.chan_id", (err, results) => {
          mclient.release();
          if (err) {
            reject("serverError");
          }
          else {
            resolve(results);
          }
        })
      }
    });
  });
};

//Checks to see if user is already in typing dictionary
chat.userAlreadyTyping = (userid) => {
  if (typeof userTypingMap[userid] !== "undefined") {
    return true;
  }
  return false;
};

//Adds the currently typing user to the map
chat.addUserToMap = (userid) => {
  userTypingMap[userid] = true;
};

//Emits that the current user is typing to everone but him/herself
chat.emitUserTyping = (name, userid, eventname) => {
  Object.keys(clients).forEach((val) => {
    if (val !== String(userid)) {
      io.sockets.connected[clients[val].socket].emit(eventname, name);
    }
  });
};

//Returns true if the user is not currently in the map
chat.userIsNotTyping = (userid) => {
  if (typeof userTypingMap[userid] === "undefined") {
    return true;
  }
  return false;
};

chat.deleteUserFromMap = (userid) => {
  delete userTypingMap[userid];
};

//Gets the user's name from their id
chat.getNameFromId = (userid) => {
  return new Promise((resolve, reject) => {
    mysqlWrap.getConnection((err, mclient) => {
      if (err) {
        reject("serverError");
      }
      else {
        mclient.query("SELECT username FROM UserTable WHERE user_id = ?", [userid], (err, data) => {
          mclient.release();
          if (err) {
            reject("serverError");
          }
          else {
            if (data.length === 0) {
              reject("userDoesNotExist");
            }
            else {
              resolve(data[0].username);
            }
          }
        });
      }
    })
  });
};


module.exports = chat;
