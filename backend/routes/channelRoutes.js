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
    res.json({"response": "error", "data": channelError});
    return;
  }

  //Checking if the channel name already exists
  channel.checkChannelNameExists(channelName)
  .then(() => {
    return channel.insertChannelToDb(channelName);
  })
  .then(() => {
    res.json({"response": "success"})
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
/*channelRoutes.checkUserInChannel = (req, res) => {
  const userid = req.decoded.id;
  const channelId = req.query.channelId;

  if (!channelId) {
    res.json({"response": "error", "errorType": "paramError"});
    return;
  }

  channel.checkChanExistsId(channelId)
  .then(() => {
    return chat.checkUserInChannel({
      userid: userid,
      channelId: channelId,
    });
  })
  .then(() => {
    res.json({"response": "success"});
  })
  .catch((e) => {
    const status = e  === "serverError" ? 500 : 400;
    res.status(status).json({"response": "error", "errorType": e});
  });
};

*/

module.exports = channelRoutes;
