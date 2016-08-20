const routes = {};

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
routes.getAllMessages = (req, res) => { // TYPE: GET
  //Logic goes here
  res.json({"response": "success"});
};

/*
  //If the user logs in correctly, a JSON web token will be delivered. 
*/
routes.login = (req, res) => { // TYPE: "POST"
  const username = req.body.username;
  const password = req.body.password;
  //Logic goes here
  res.json({"response": "success"});
}

routes.getChannelMessages = (req, res) => { // TYPE: "GET"
  const channelId = req.query.channelId;
  //Logic goes here
  res.json({"response": "success"});
};

module.exports = routes;
