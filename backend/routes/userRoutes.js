const userFunctions = require("../lib/user.js")
, fs = require("fs")
, upload = require("../lib/multerSetup.js")
, mmm = require("mmmagic")
, Magic = mmm.Magic
, magic = new Magic(mmm.MAGIC_MIME_TYPE)
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

  userFunctions.checkUserExists(pmUsername)
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
  const userid = req.decoded.id;

  if (!userid)  {
    res.status(400).json({
      "response": "error",
      "errorType": "paramError",
    });
    return;
  }

  userFunctions.getAllUsers(userid)
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

userRoutes.changeUserProfile = (req, res) => {
  upload(req, res, (err) => {
    const userid = req.decoded.id;
    let errorsArray = [];

    const username = req.body.username;

    if (req.file) {
    if (err) {
      errorsArray.push("imgError");
      fs.unlink(`public/api/userimages/${req.file.filename}`);
    }


    magic.detectFile(`public/api/userimages/${req.file.filename}`, (err, result) => {
      if (err) {
        fs.unlink(`public/api/userimages/${req.file.filename}`);
        errorsArray.push("imgError");
      }

      if (["image/png", "image/jpeg", "image/jpg", "image/gif"].indexOf(result) === -1) {
        fs.unlink(`public/api/userimages/${req.file.filename}`);
        errorsArray.push("wrongMimeType");
      }

      const userNameErrorArray = userFunctions.checkUserNameError(username);



      if (userNameErrorArray.length !== 0) {
        errorsArray = errorsArray.concat(userNameErrorArray);
      }


      //Send error messages
      if (errorsArray.length !== 0) {
        return res.status(400).json({
          "response": "error",
          "data": errorsArray,
        });
      }

      console.log("hehexd1 ");
      userFunctions.checkUserAlreadyExists({userid, username})
      .then(() => {
        console.log("hehexd2 ");
        return userFunctions.changeUserName({userid, username})
      })
      .then(() => {
        console.log("hehexd3 ");

        return userFunctions.getOldImage({userid});
      })
      .then((oldImage) => {
        return userFunctions.deleteOldImage({oldImage});
      })
      .then(() => {
        return userFunctions.setNewImage({image: req.file.filename, userid});
      })
      .then(() => {
        res.json({
          response: "success",
          data: {
            image: `/api/userimages/${req.file.filename}`,
          }
        });
      })
      .catch((e) => {
        const status = e === "serverError" ? 500 : 400;
        res.status(status).json({
          response: "error",
          data: [e],
        });
      });
    });

    }
    else {
      const userNameErrorArray = userFunctions.checkUserNameError(username);

      if (userNameErrorArray.length !== 0) {
        return res.status(400).json({
          "response": "error",
          "data": userNameErrorArray,
        });
      }

      userFunctions.checkUserAlreadyExists({userid, username})
      .then(() => {
        userFunctions.changeUserName({userid, username});
      })
      .then(() => {
        return res.json({
          "response": "success"
        });
      })
      .catch((e) => {
        const status = e === "serverError" ? 500 : 400;
        res.status(status).json({
          "response": "error",
          "data": [e],
        });
      });
    }
  });
};



module.exports = userRoutes;
