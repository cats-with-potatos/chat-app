const chat = require("../lib/chat.js")
, chatRoutes = {};

//Will get all the messages from all the channels.
chatRoutes.getAllMessages = (req, res) => { // TYPE: GET
  //Logic goes here


  //This will get the messages from ALL the channels. Most likely only getChannelMessages should be used
  res.json({"response": "success"});
  res.status(200).json({"response": "success"});
};

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



  //Check to see if the user is in the channel
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

chatRoutes.sendUserIsTyping = (req, res) => {
  const userid = req.decoded.id;
  console.log(req.decoded);


  if (chat.userAlreadyTyping(userid)) {
    res.status(400).json({
      "response": "error",
      "errorType": "alreadyTyping",
    });
    return;
  }
  chat.addUserToMap(userid);

  chat.getNameFromId(userid)
  .then((name) => {
    chat.emitUserTyping(name, userid, "userIsTyping");
    res.json({"response": "success"});
  })
  .catch((e) => {
    const status = e === "serverError" ? 500 : 400;
    res.status(status).json({
      "response": "error",
      "errorType": e,
    });
  });
};

chatRoutes.sendUserStoppedTyping = (req, res) => {
  const userid = req.decoded.id;


  if (chat.userIsNotTyping(userid)) {
    res.status(400).json({
      "response": "error",
      "errorType": "User is not even typing",
    });
    return;
  }

  chat.deleteUserFromMap(userid);

  chat.getNameFromId(userid)
  .then((name) => {
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


chatRoutes.getPeopleTyping = (req, res) => {
  const userid = req.decoded.id;
  res.json({
    "response": "success",
    "data": "dothislaters",
  });


};

module.exports = chatRoutes;
