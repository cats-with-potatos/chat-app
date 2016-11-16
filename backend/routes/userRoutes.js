const user = require("../lib/user.js")
, userRoutes = {};


//Checks if the users account exists
userRoutes.checkUserExists = (req, res) => { // TYPE: GET
  const pmUsername = req.query.username;

  if (!pmUsername) {
    res.status(400).json({
      "response": "error",
      "errorType": "paramError",

    });
    return;
  }

  user.checkUserExists(pmUsername)
  .then((userId) => {
    res.json({
      "response": "success",
      "data": {id: userId},
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

//Gets five users based on the priority below:

//First priority goes to online users that the user has currently chatted with
//Second goes to online users
//Thirdly goes to offline users recently chatted to.

userRoutes.getFiveUsers = (req, res) => { // TYPE: GET
  const userid = req.decoded.id;

  if (!userid) {
    res.status(400).json({
      "response": "erorr",
      "errorType": "paramError",
    });
    return;
  }

  res.json({"response": "success", "data": "hey"});
};

//Gets all the users from UsersTable
userRoutes.getAllUsers = (req, res) => { // TYPE: GET
  const userid = Number(req.decoded.id);

  if (!userid)  {
    res.status(400).json({
      "response": "error",
      "errorType": "paramError",
    });
    return;
  }

  user.getAllUsers(userid)
  .then((users) => {
    res.json({
      "response": "success",
      "data": users,
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



module.exports = userRoutes;
