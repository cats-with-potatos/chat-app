const chat = require("../lib/chat.js")
, channel = require("../lib/channel.js")
, chatRoutes = {};

//Will get all the messages from all the channels.
chatRoutes.getAllMessages = (req, res) => { // TYPE: GET
  //Logic goes here

  //This will get the messages from ALL the channels. Most likely only getChannelMessages should be used
  res.json({"response": "success"});
  res.status(200).json({"response": "success"});
};

//This will get all the messages from a specific channel
chatRoutes.getChannelMessages = (req, res) => { // TYPE: "GET"
const userId = req.decoded.id;
const channelName = req.query.channelName;

//Checks to see of the channel is not a number
if (!channelName) {
  res.status(400).json({"response": "error", "errorType": "paramError"});
  return;
}

//Checks to see if the user is in the channel
channel.getIdFromName(channelName)
.then((channelId) => {
  console.log(channelId);
  return chat.checkUserInChannel({
    userid: userId,
    channelId: channelId,
  });
})
.then((channelId) => {
  console.log(channelId);
  //Getting all the channels messages
  return chat.getAllChannelMessages(channelId)
})
.then((data) => {
  res.status(200).json({"response": "success", "data": data});
})
.catch((e) => {
  const status = e === "serverError" ? 500 : 400;
  res.status(status).json({"response": "error", "errorType": e});
});
};


//Called by users to send chat messages
chatRoutes.sendChatMessage = (req, res) => { // TYPE POST
  const userid = req.decoded.id;
  const channelId = Number(req.body.channelId); //Will return "NaN" if not present
  const message = req.body.message;

  //Checks for errors with user input
  const chatError = chat.checkMessageError({
    userid: userid,
    channelId: channelId,
    message: message,
  });


  //Checks if user input errors were there
  if (chatError) {
    res.status(400).json({"response": "error", "errorType": chatError});
    return;
  }



  //Check to see if the user id in the channel
  chat.checkUserInChannel({
    userid: userid,
    channelId: channelId,
  })
  .then(() => {

    //Insert message to database
    return chat.insertMessageToDb({
      userid: userid,
      channelId: channelId,
      message: message,
    });
  })
  .then((messageId) => {
    //Gets the whole message info from messageId
    return chat.getMessagesInfo(messageId);
  })
  .then((messageInfo) => {
    //Emits the message to all the people in that channel that are online
    return chat.emitMessageToChannel(messageInfo);
  })
  .then(() => {
    res.status(200).json({"response": "success"});
  })
  .catch((e) => {
    const status = e === "serverError" ? 500 : 400;
    res.status(status).json({"response": "error", "errorType": e})
  });
};

/*
Called when a user types something in the text input.
This route will notify all the other users in the channel that they are typing
*/

chatRoutes.sendUserIsTyping = (req, res) => { // TYPE: POST
  const userid = req.decoded.id;
  const channelId = req.body.channelId;

  if (!channelId) {
    res.json({
      "response": "error",
      "errorType": "paramError",
    });
    return;
  }

  chat.checkUserInChannel({
    userid: userid,
    channelId: channelId,
  })
  .then(() => {
    //Checks if the user is already typing
    if (chat. userAlreadyTyping({
      userid: userid,
      channelId: channelId,
    })) {
      throw new Error("alreadyTyping");
    }
    //If they are not, add them
    chat.addUserToMap({
      userid: userid,
      channelId: channelId,
    });
    return chat.getNameFromId(userid);
  })
  .then((name) => {
    //Emit to all other users that they are currently typing
    return chat.emitUserTyping({
      name: name,
      userid: userid,
      channelId: channelId,
      eventname: "userIsTyping",
    });
  })
  .then(() => {
    res.json({"response": "success"});
  })
  .catch((e) => {
    console.log(e);
    //If error was serverError then return status 500, otherwise, return 400
    const status = e === "serverError" ? 500 : 400;
    res.status(status).json({
      "response": "error",
      "errorType": e,
    });
  });
};


//This is sent from the client when the user has stopped typing.

chatRoutes.sendUserStoppedTyping = (req, res) => { // TYPE: POST
  const userid = req.decoded.id;
  const channelId = req.body.channelId;

  if (!channelId) {
    res.json({
      "response": "error",
      "errorType": "paramError",
    });
    return;
  }

  chat.checkUserInChannel({
    userid: userid,
    channelId: channelId,
  })
  .then(() => {
    //Check to see if the user is already not typing and return error
    if (chat.userIsNotTyping({
      userid: userid,
      channelId: channelId,
    })) {
      throw new Error("alreadyNotTyping");
    }
    chat.deleteUserFromMap({
      userid: userid,
      channelId: channelId,
    });

    return chat.getNameFromId(userid);
  })
  .then((name) => {
    //Emit that the user has stopped typing
    chat.emitUserTyping({
      name: name,
      userid: userid,
      channelId: channelId,
      eventname: "userIsNotTyping",
    });
    res.json({"response": "success"});
  })
  .catch((e) => {
    const status = e === "serverError" ? 500 : 400;
    res.status(400).json({
      "response": "error",
      "errorType": e,
    });
  });
};

//This route will send an array with all the users that are currently typing
chatRoutes.getIntialUsersTyping = (req, res) => { // TYPE: GET

  const channelId = Number(req.query.channelId);
  const userid = req.decoded.id;

  if (!channelId) {
    res.json({
      "response": "error",
      "errorType": "paramError",
    });
    return;
  }
  chat.checkUserInChannel({
    userid: userid,
    channelId: channelId,
  })
  .then(() => {
    return chat.getNamesFromTypingHash({
      userid: userid,
      channelId: channelId,
    })
  })
  .then((names) => {
    res.json({"response": "success", "data": names});
  })
  .catch((e) => {
    const status = e === "serverError" ? 500 : 400;
    res.status(status).json({"response": "error", "errorType": e});
  });
};

//This route will update a message
chatRoutes.updateMessage = (req, res) => { // TYPE: PUT
  const userid = req.decoded.id;
  const messageId = Number(req.body.messageId);
  const channelId = Number(req.body.channelId);
  const contents = req.body.contents;


  if (chat.checkMessageError({
    userid: userid,
    channelId: channelId,
    message: contents,
  }) || isNaN(messageId)) {
    res.json({
      "response": "error",
      "errorType": "paramError",
    });
    return;
  }

  chat.checkUserOwnsMessage({
    userid: userid,
    messageId: messageId,
    channelId: channelId,
  })
  .then(() => {
    return chat.updateMessage({
      userid: userid,
      messageId: messageId,
      channelId: channelId,
      contents: contents,
    });
  })
  .then(() => {
    res.json({"response": "success"});
  })
  .catch((e) => {
    const status = e === "serverError" ? 500 : 400;
    res.json({"response": "error", "errorType": e});
  });
};

//This route will delete a message.
chatRoutes.deleteMessage = (req, res) => { // TYPE: DELETE
  const userid = req.decoded.id;
  const messageId = Number(req.query.messageId);
  const channelId = Number(req.query.channelId);

  if (isNaN(messageId) || isNaN(channelId)) {
    res.json({
      "response": "error",
      "errorType": "paramError",
    });
    return;
  }

  chat.checkUserOwnsMessage({
    userid: userid,
    messageId: messageId,
    channelId: channelId,
  })
  .then(() => {
    return chat.deleteMessage({
      userid: userid,
      messageId: messageId,
      channelId: channelId,
    });
  })
  .then(() => {
    res.json({
      "response": "success",
    });
  })
  .catch((e) => {
    const status = e === "serverError" ? 500 : 400;
    res.json({
      "response": "error",
      "errorType": e,
    });
  });
};

//Sends a private message
chatRoutes.sendPrivateMessage = (req, res) => { // TYPE: POST
  const userid = req.decoded.id;
  const messageTo = Number(req.body.messageTo);
  const message = req.body.message;

  if (chat.checkParamError({
    messageTo: messageTo,
    message: message,
    userid: userid,
  })) {
    res.status(400).json({
      "response": "error",
      "errorType": "paramError",
    });
    return;
  }
  chat.checkPMIdExists(messageTo)
  .then(() => {
    return chat.insertPrivateMessageToDb({
      userid: userid,
      messageTo: messageTo,
      message: message,
    });
  })
  .then(() => {
    return chat.sendPMToUser({
      userid: userid,
      messageTo: messageTo,
      message: message,
    });
  })
  .then(() => {
    res.status(200).json({
      "response": "success",
    });
  })
  .catch((e) => {
    console.log(e);
    const status = e === "serverError" ? 500 : 400;
    res.status(status).json({
      "response": "error",
      "errorType": e,
    });
  });
};

//This route will get all messages between the user and another person
chatRoutes.getPrivateMessages = (req, res) => { // TYPE: GET
  const userid = req.decoded.id;
  const userTo = Number(req.query.userTo);

  if (!userTo || userid === userTo) {
    res.status(400).json({
      "response": "error",
      "errorType": "paramError",
    });
    return;
  }

  chat.checkPMIdExists(userTo)
  .then(() => {
    return chat.getPrivateMessages({
      userid: userid,
      userTo: userTo,
    });
  })
  .then(function(messages) {
    res.json({
      "response": "success",
      "data": messages,
    });
  })
  .catch((e) => {
    const status = e === "serverError" ? 500 : 400;
    res.status(status).json({
      "response": "error",
      "errorType": e,
    });
  });
};

module.exports = chatRoutes;
