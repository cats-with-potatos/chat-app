const Promise = require("bluebird")
, io = require("./socketio.js").listen()
, clients = require("./socketio.js").clients
, mysqlWrap = require("./db.js")
, chat = {}
// userTypingMap is a dictionary that defines who is currently typing
chat.userTypingMap = {}

//Populates the user is typing map
chat.populateUserTypingMap = () => {
  return new Promise((resolve, reject) => {
    mysqlWrap.getConnection((err, mclient) => {
      if (err) {
        console.log(err);
      }
      else {
        mclient.query("SELECT chan_id FROM ChannelsTable", (err, data) => {
          mclient.release();
          if (err) {
            console.log(err);
          }
          else {
            data.forEach((val) => {
              chat.userTypingMap[val.chan_id] = new Set();
            });
            console.log(chat.userTypingMap);
          }
        });
      }
    })
  });
};

chat.populateUserTypingMap();

//Checks to see if there are any problems with the message being sent or any details of the mesage
chat.checkMessageError = (messageDet) => {
  if (typeof messageDet.userid === "undefined" || isNaN(messageDet.channelId) || typeof messageDet.message === "undefined") {
    return "paramError";
  }

  //Will check that the message is JSON stringified. If it is not, the request has obviously been automated
  try {
    if (JSON.parse(messageDet.message).length > 100) {
      return "messageTooLong";
    }
  }
  catch(e) {
    return "paramError";
  }
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
              resolve(messageDet.channelId);
            }
          }
        });
      }
    });
  });
};

//Checks to see if user is in channel. If they are, then resolve, else reject.
chat.checkUserInChannelByName = (messageDet) => {
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

//Get all the details of the message from the messageId
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
chat.getAllChannelMessages = (channelId) => {
  return new Promise((resolve, reject) => {
    mysqlWrap.getConnection((err, mclient) => {
      if (err) {
        reject("serverError");
      }
      else {
        mclient.query("SELECT MessagesTable.message_id, MessagesTable.contents, UserTable.user_id, UserTable.username, ChannelsTable.chan_id, ChannelsTable.chan_name FROM MessagesTable INNER JOIN UserTable ON MessagesTable.sender = UserTable.user_id INNER JOIN ChannelsTable ON MessagesTable.chan_link_id = ChannelsTable.chan_id WHERE MessagesTable.chan_link_id = ?", [channelId], (err, results) => {
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
chat.userAlreadyTyping = (obj) => {
  if (chat.userTypingMap[obj.channelId].has(obj.userid)) {
    return true;
  }
  return false;
};

//Adds the currently typing user to the map
chat.addUserToMap = (obj) => {
  chat.userTypingMap[obj.channelId].add(obj.userid);
};

//Emits that the current user is typing to everone but him/herself
chat.emitUserTyping = (obj) => {
  chat.userTypingMap[obj.channelId].forEach((val) => {
    if (val !== String(obj.userid)) {
      io.sockets.connected[clients[val].socket].emit(obj.eventname, obj.name);
    }
  });
};

//Returns true if the user is not currently in the map
chat.userIsNotTyping = (obj) => {
  if (!chat.userTypingMap[obj.channelId].has(obj.userid)) {
    return true;
  }
  return false;
};

//Deletes the currently typing user from the map
chat.deleteUserFromMap = (obj) => {
  delete chat.userTypingMap[obj.channelId].delete(obj.userid);
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

//Will get all the id's that are currently typing and get the users names
chat.getNamesFromTypingHash = (obj) => {
  return new Promise((resolve, reject) => {
    const promiseArray = [];

    Object.keys(chat.userTypingMap[obj.channelId]).forEach((val) => {
      if (Number(val) !== obj.userid) {
        promiseArray.push(chat.getNameFromId(Number(val)));
      }
    });

    //Asynchronously executes all the promises
    Promise.all(promiseArray)
    .then((names) => {
      resolve(names);
    })
    .catch((e) => {
      reject(e);
    });
  });
};

/*

I had to move this section into the chat.js file to prevent circular dependencies
Maybe in the future we could look into a cleaner solution

//Work on this
This will emit an event to all the users if the user is currently typing.
*/
io.on('connection', (socket) => {
  socket.on('disconnect', () => {
    for (key in clients) {
      //To make sure that only properties of the clients object are iterated over
      if (clients.hasOwnProperty(key)) {
        if (clients[key].socket === socket.id) { //Checks to see if the user's id matches the disconnected id
        if (chat.userAlreadyTyping(key)) { //Checks to see if the user is already typing
          chat.deleteUserFromMap(key) //Deletes a user from the map

          chat.getNameFromId(Number(key))
          .then((name) => {
            //Emits that the user has stopped typing if they are currently typing
            chat.emitUserTyping(name, Number(key), "userIsNotTyping");
          })
        }
        delete clients[key];
        break;
      }
    }
  }
});
});

//Checks if the user owns a specific message
chat.checkUserOwnsMessage = (obj) => {
  return new Promise((resolve, reject) => {
    mysqlWrap.getConnection((err, mclient) => {
      if (err) {
        console.log(err);
        reject("serverError");
      }
      else {
        mclient.query("SELECT * FROM MessagesTable WHERE message_id = ? AND sender = ? AND chan_link_id = ?", [obj.messageId, obj.userid, obj.channelId], (err, data) => {
          mclient.release();
          if (err) {
            console.log(err);
            reject("serverError");
          }
          else {
            if (data.length === 0) {
              reject("paramError");
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

//Updates a specific message
chat.updateMessage = (obj) => {
  return new Promise((resolve, reject) => {
    mysqlWrap.getConnection((err, mclient) => {
      if (err) {
        reject("serverError");
      }
      else {
        mclient.query("UPDATE MessagesTable SET contents = ? WHERE message_id = ? AND sender = ? AND chan_link_id = ?", [obj.contents, obj.messageId, obj.userid, obj.channelId], (err, data) => {
          mclient.release();
          if (err) {
            console.log(err);
            reject("serverError");
          }
          else {
            resolve();
          }
        })
      }
    });
  });
};

//Deletes a specific message
chat.deleteMessage = (obj) => {
  return new Promise((resolve, reject) => {
    mysqlWrap.getConnection((err, mclient) => {
      if (err) {
        reject("serverError");
      }
      else {
        mclient.query("DELETE FROM MessagesTable WHERE message_id = ? AND sender = ? AND chan_link_id = ?", [obj.messageId, obj.userid, obj.channelId], (err, data) => {
          mclient.release();
          if (err) {
            reject("serverError")
          }
          else {
            resolve();
          }
        });
      }
    });
  });
};


module.exports = chat;
