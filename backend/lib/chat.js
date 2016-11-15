const Promise = require("bluebird")
, io = require("./socketio.js").listen()
, clients = require("./socketio.js").clients
, mysqlWrap = require("./db.js")
, chat = {}
// userTypingMap is a dictionary that defines who is currently typing
chat.userTypingMap = {}
chat.userTypingPMMap = {};

//Populates the user is typing map
chat.populateUserTypingMap = () => {
  return new Promise((resolve, reject) => {
    mysqlWrap.getConnection((err, mclient) => {
      if (err) {
        reject("serverError");
      }
      else {
        mclient.query("SELECT chan_id FROM ChannelsTable", (err, data) => {
          mclient.release();
          if (err) {
            reject("serverError");
          }
          else {
            data.forEach((val) => {
              chat.userTypingMap[val.chan_id] = new Set();
            });
          }
        });
      }
    })
  });
};

chat.populateUserPMTypingMap = () => {
  return new Promise((resolve, reject) => {
    mysqlWrap.getConnection((err, mclient) => {
      if (err) {
        reject("serverError");
      }
      else {
        mclient.query("SELECT user_id FROM UserTable", (err, data) => {
          mclient.release();
          if (err) {
            reject("serverError");
          }
          else {
            data.forEach((val) => {
              chat.userTypingPMMap[val.user_id] = new Set();
            });
          }
        });
      }
    });
  });
};

chat.populateUserTypingMap();
chat.populateUserPMTypingMap();


//Checks to see if there are any problems with the message being sent or any details of the mesage
chat.checkMessageError = (messageDet) => {
  if (typeof messageDet.userid === "undefined" || isNaN(messageDet.channelId) || typeof messageDet.message === "undefined") {
    console.log(typeof messageDet.userid === "undefined");
    console.log(isNaN(messageDet.channelId));
    console.log(messageDet.message);

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
  return new Promise((resolve, reject) => {
    const peopleInChannel = [];

      mysqlWrap.getConnection((err, mclient) => {
        if (err) {
          reject("serverError");
        }
        else {
          mclient.query("SELECT inchan_userid FROM UserInChannel WHERE inchan_channel_id = ? AND inchan_userid != ?", [obj.channelId, obj.userid], (err, data) => {
            mclient.release();
            if (err) {
              reject("serverError");
            }
            else {
              const usersInChannel = Object.keys(clients).filter((val) => {
                for (let i = 0;i<data.length;i++) {
                  if (data[i].inchan_userid === Number(val)) {
                    return true;
                  }
                }
                return false;
              });
              usersInChannel.forEach((val) => {

                io.sockets.connected[clients[val].socket].emit(obj.eventname, {name: obj.name, id: Number(obj.userid), channelId: Number(obj.channelId)});
              });

              resolve();
            }
          });
        }

    /*
    if (val !== String(obj.userid)) {
    console.log("I am typing to "val);
    io.sockets.connected[clients[val].socket].emit(obj.eventname, obj.name);
  }
  */
});
});
};

//Emits to the other user in the private messages that the user is typipng
chat.emitUserTypingPM = (obj) => {
  return new Promise((resolve, reject) => {
    if (clients[obj.userTo]) {
      io.sockets.connected[clients[obj.userTo].socket].emit(obj.eventname, {name: obj.name, id: obj.userid});
    }
    resolve();
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

    chat.userTypingMap[obj.channelId].forEach((val) => {
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

chat.checkUserIsTyping = (userid) => {
  const userTypingMapKeys = Object.keys(chat.userTypingMap);
  for (let i = 0;i<Object.keys(userTypingMapKeys).length;i++) {
    if (chat.userTypingMap[userTypingMapKeys[i]].has(Number(userid))) {
      return userTypingMapKeys[i];
    }
  }
  return false;
};

/*

I had to move this section into the chat.js file to prevent circular dependencies
Maybe in the future we could look into a cleaner solution

//Work on this
This will emit an event to all the users if the user is currently typing.
*/
io.on('connection', (socket) => {
  socket.on('disconnect', () => {
    console.log("hello?");
    const keys = Object.keys(clients);

    for (let i = 0;i<keys.length;i++) {
      //To make sure that only properties of the clients object are iterated over
        if (clients[keys[i]].socket === socket.id) { //Checks to see if the user's id matches the disconnected id
        const isUserTyping = chat.checkUserIsTyping(keys[i]);



        if (isUserTyping) { //Checks to see if the user is already typing
          chat.deleteUserFromMap({userid: Number(keys[i]), channelId: isUserTyping}) //Deletes a user from the map
          console.log("The key should still be 4: " + keys[i]);

          chat.getNameFromId(Number(keys[i]))
          .then((name) => {
            console.log("The key should still be 4: " + keys[i]);
            //Emits that the user has stopped typing if they are currently typing
            return chat.emitUserTyping({
              channelId: isUserTyping,
              userid: Number(keys[i]),
              eventname: "userIsNotTyping",
              name: name,
            });
          })
          .then(() => {
            delete clients[keys[i]];
          });
        }
        else {
          delete clients[keys[i]];
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

//Inserted the private message in to the db
chat.insertPrivateMessageToDb = (obj) => {
  return new Promise((resolve, reject) => {
    mysqlWrap.getConnection((err, mclient) => {
      if (err) {
        reject("serverError");
      }
      else {
        mclient.query("INSERT INTO PrivateMessages (pm_id, pm_from, pm_to, pm_message, pm_date) VALUES (DEFAULT, ?, ?, ?, ?)", [obj.userid, obj.messageTo, obj.message, new Date().getTime()], (err, data) => {
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


//Checks to see if there are any problems with the private message being sent to the user
chat.checkParamError = (obj) => {
  if (!obj.messageTo || !obj.message || obj.userid === obj.messageTo) {
    return "paramError";
  }


  //Will check that the message is JSON stringified. If it is not, the request has obviously been automated
  try {
    if (JSON.parse(obj.message).length > 100) {
      return "messageTooLong";
    }
  }
  catch(e) {
    return "paramError";
  }
  return null;
};

//Sends a private message to the user

chat.sendPMToUser = (obj) => {
  return new Promise((resolve, reject) => {
    mysqlWrap.getConnection((err, mclient) => {
      if (err) {
        reject("serverError");
      }
      else {
        mclient.query("SELECT username FROM UserTable WHERE user_id = ?", [obj.userid], (err, data) => {
          mclient.release();
          if (err) {
            reject("serverError");
          }
          else {
            obj.username = data[0].username;
            obj.contents = obj.message;
            delete obj.message;


            console.log("messageTo is: " + obj.messageTo);
            console.log("clients is");
            console.log(clients);

            if (clients[obj.messageTo]) {
              console.log("I have emitted to : " + obj.messageTo);
              io.sockets.connected[clients[obj.messageTo].socket].emit("newPrivateMessage", obj);
            }
            console.log(obj.userid);
            if (clients[obj.userid]) {
              console.log("I am sending the message to : " + obj.userid);
              io.sockets.connected[clients[obj.userid].socket].emit("newPrivateMessage", obj);
            }
            resolve();
          }
        })
      }
    });
  });
};

//Checks if the messageTo id exists
chat.checkPMIdExists = (messageTo) => {
  return new Promise((resolve, reject) => {
    mysqlWrap.getConnection((err, mclient) => {
      if (err) {
        reject("serverError");
      }
      else {
        mclient.query("SELECT user_id FROM UserTable WHERE user_id = ?", [messageTo], (err, data) => {
          mclient.release();
          if (err) {
            reject("serverError");
          }
          else {
            if (data.length === 0) {
              reject("userDoesNotExist");
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

//Gets the private messages
chat.getPrivateMessages = (obj) => {
  return new Promise((resolve, reject) => {
    mysqlWrap.getConnection((err, mclient) => {
      if (err) {
        reject("serverError");
      }
      else {
        mclient.query("SELECT PrivateMessages.pm_id, PrivateMessages.pm_to, PrivateMessages.pm_message AS contents, UserTable.username FROM PrivateMessages INNER JOIN UserTable ON PrivateMessages.pm_from = UserTable.user_id WHERE (PrivateMessages.pm_from = ? || PrivateMessages.pm_from = ?) AND (PrivateMessages.pm_to = ? || PrivateMessages.pm_to = ?)", [obj.userid, obj.userTo, obj.userid, obj.userTo], (err, data) => {
          mclient.release();
          if (err) {
            reject('serverError');
          }
          else {
            resolve(data);
          }
        });
      }
    });
  });
};

//Checks if the user is already typing
chat.userAlreadyTypingPM = (obj) => {
  return new Promise((resolve, reject) => {
    if (chat.userTypingPMMap[obj.userFrom].has(obj.userTo)) {
      reject("userAlreadyTyping");
    }
    else {
      resolve();
    }
  });
};

//Adds the user to the pm map
chat.addUserToPMMap = (obj) => {
  return new Promise((resolve, reject) => {
    chat.userTypingPMMap[obj.userFrom].add(obj.userTo);
    resolve();
  });
};

module.exports = chat;
