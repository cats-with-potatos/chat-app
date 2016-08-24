const authFunctions = require("./auth.js")
, middleware = {};


middleware.checkToken = (req, res, next) => {
  const token = req.get("Authorization");

  authFunctions.checkJwt(token)
  .then((decoded) => {
    req.decoded = decoded;
    next();
  })
  .catch((e) => {
    res.json({"response": "error", "errorType": "noauth"})
  })
};

module.exports = middleware;
