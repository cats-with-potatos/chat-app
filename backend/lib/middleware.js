const authFunctions = require("./auth.js")
, middleware = {};


middleware.checkToken = (req, res, next) => {
  //Extracts token from header e.g. "Bear token".split(" ")[1] will equal "token"
  const token = req.get("Authorization").split(" ")[1];

  //Checks if the jwt has been encrypted with our JWT_PASSWORD
  authFunctions.checkJwt(token)
  .then((decoded) => {
    req.decoded = decoded;
    next();
  })
  .catch((e) => {
    res.json({"response": "error", "errorType": "noauth"})
  })
};

middleware.NotFoundApiRoute = (req, res, next) => {
    //If url does not satisfy any route, then set status to 404 and send error message
    res.status = 404;
    res.json({"response": "error", "errorType": "404"});
};

module.exports = middleware;
