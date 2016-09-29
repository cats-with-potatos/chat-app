const chat = require("../lib/chat.js")
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
  const channelId = Number(req.query.channelId);

  //Checks to see of the channel is not a number
  if (isNaN(channelId)) {
    res.status(400).json({"response": "error", "errorType": "paramError"});
    return;
  }

  //Checks to see if the user is in the channel
  chat.checkUserInChannel({
    userid: userId,
    channelId: channelId,
  })
  .then(() => {
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

  //Checks if the user is already typing
  if (chat.userAlreadyTyping(userid)) {
    res.status(400).json({
      "response": "error",
      "errorType": "alreadyTyping",
    });
    return;
  }

  //If they are not, add them
  chat.addUserToMap(userid);

  chat.getNameFromId(userid)
  .then((name) => {
    //Emit to all other users that they are currently typing
    chat.emitUserTyping(name, userid, "userIsTyping");
    res.json({"response": "success"});
  })
  .catch((e) => {
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

  //Check to see if the user is already not typing and return error
  if (chat.userIsNotTyping(userid)) {
    res.status(400).json({
      "response": "error",
      "errorType": "alreadyNotTyping",
    });
    return;
  }

  //If they are not, then delete them
  chat.deleteUserFromMap(userid);

  chat.getNameFromId(userid)
  .then((name) => {
    //Emit that the user has stopped typing
    chat.emitUserTyping(name, userid, "userIsNotTyping");
  })
  .catch((e) => {
    const status = e === "serverError" ? 500 : 400;
    res.status(400).json({
      "response": "error",
      "errorType": e,
    });
  });
  res.json({"response": "success"});
};

//This route will send an array with all the users that are currently typing
chatRoutes.getIntialUsersTyping = (req, res) => { // TYPE: GET
  //We will need to use this later once we implement multiple channels
  const channelId = req.body.channelId;
  const userid = req.decoded.id;

  chat.getNamesFromTypingHash(userid)
  .then((names) => {
    res.json({"response": "success", "data": names});
  })
  .catch((e) => {
    const status = e === "serverError" ? 500 : 400;
    res.status(status).json({"response": "error", "errorType": e});
  });
};

module.exports = chatRoutes;
