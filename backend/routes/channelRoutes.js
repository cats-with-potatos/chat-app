const mysqlWrap = require("../lib/db.js")
, channel = require("../lib/channel.js")
, chat = require("../lib/chat.js")
, channelRoutes = {};


//Creates a new channel
channelRoutes.createNewChannel = (req, res) => { // TYPE: POST
  const channelName = req.body.channelName;

  //Checks for error with channel name
  const channelError = channel.checkNameError(channelName);

  //Check if errors are present
  if (channelError.length !== 0) {
    res.status(400).json({"response": "error", "data": channelError});
    return;
  }

  //Checking if the channel name already exists
  channel.checkChannelNameNotExists(channelName)
  .then(() => {
    return channel.insertChannelToDb(channelName);
  })
  .then((insertedRow) => {
    res.json({"response": "success", data: insertedRow})
  })
  .catch((e) => {
    const status = e === "serverError" ? 500 : 400;
    res.status(status).json({"response": "error", "data": [e]});
  });
};

//Will get all channels
channelRoutes.getAllChannels = (req, res) => { // TYPE: GET
  channel.getAllChannels()
  .then((data) => {
    res.json({"response": "success", "data": data});
  })
  .catch((e) => {
    const status = e === "serverError" ? 500 : 400;
    res.status(status).json({"response": "error", "errorType": e});
  });
};

//Will check if the user is in the channel
channelRoutes.checkUserInChannel = (req, res) => { // TYPE: GET
  const userid = req.decoded.id;
  const channelName = req.query.channelName;

  if (!channelName) {
    res.json({"response": "error", "errorType": "paramError"});
    return;
  }

  channel.checkChannelNameExists(channelName)
  .then((channelId) => {
    return chat.checkUserInChannel({
      userid: userid,
      channelId: channelId,
    });
  })
  .then((channelId) => {
    res.json({"response": "success", "data": channelId});
  })
  .catch((e) => {
    const status = e  === "serverError" ? 500 : 400;
    res.status(status).json({"response": "error", "errorType": e});
  });
};

//Adds users to channels
channelRoutes.addUserToChannel = (req, res) => { // TYPE: POST
  const userid = req.decoded.id;
  const channelName = req.body.channelName;

  if (!channelName) {
    res.status(400).json({
      "response": "error",
      "errorType": "paramError",
    })
    return;
  }

  channel.checkChannelNameExists(channelName)
  .then((channelId) => {
    return channel.checkUserNotInChannel({
      userid: userid,
      channelId: channelId,
    });
  })
  .then((channelId) => {
    return channel.addUserToChannel({
      userid: userid,
      channelId: channelId,
    });
  })
  .then(() => {
    res.json({
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
  })
};


module.exports = channelRoutes;
