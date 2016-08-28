const mysqlWrap = require("../lib/db.js")
, channel = require("../lib/channel.js")
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
    res.status(200).json({"response": "error", "data": [e]});
  });
};

module.exports = channelRoutes;
