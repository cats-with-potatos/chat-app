const chatRoutes = {};

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
  res.json([{"message": "hello"},
            {"message": "hello again"},
            {"message": "hello again x 2"}]);
};

chatRoutes.getChannelMessages = (req, res) => { // TYPE: "GET"
  const channelId = req.query.channelId;
  //Logic goes here
  res.status(200).json({"response": "success"});
};

module.exports = chatRoutes;
