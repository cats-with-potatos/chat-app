const chat = require("../lib/chat.js")
, chatRoutes = {};

/*
Will get all the messages from all the channels.

"1" and "2" mark the channel id's

Example output
---------------
{
"response: "success",
data: {
"1": [{from:{user_id: 1, user_name: "raf"}, message: "This is my message!"},
{from:{user_id: 2, user_name: "jp"}, message: "This is jp's message message!"}]
"2": [{from:{user_id: 1, user_name: "raf"}, message: "This is my message!"},
{from:{user_id: 2, user_name: "jp"}, message: "This is jp's message message!"}]
}
}
*/
chatRoutes.getAllMessages = (req, res) => { // TYPE: GET
  //Logic goes here


  //This will get the messages from ALL the channels. Most likely only getChannelMessages should be used
  res.json({"response": "success"});
  res.status(200).json({"response": "success"});
};

chatRoutes.getChannelMessages = (req, res) => { // TYPE: "GET"
  const userId = req.decoded.id;
  const channelId = Number(req.query.channelId);

  if (isNaN(channelId)) {
    res.status(400).json({"response": "error", "errorType": "paramError"});
    return;
  }


  //Getting all the channels messages
  chat.checkUserInChannel({
    userid: userId,
    channelId: channelId,
  })
  .then(() => {
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
chatRoutes.sendChatMessage = (req, res) => {
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
  .then(() => {
    //Emits the message to all the people in that channel that are online
    return chat.emitMessageToChannel()
  })
  .then(() => {
    res.status(200).json({"response": "success"});
  })
  .catch((e) => {
    const status = e === "serverError" ? 500 : 400;
    res.status(status).json({"response": "error", "errorType": e})
  });
};




module.exports = chatRoutes;
