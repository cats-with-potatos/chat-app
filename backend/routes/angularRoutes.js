const path = require("path")
, angularRoutes = {};

angularRoutes.serveIndex = (req, res, next) => { // TYPE: GET
  //[JG]: Anguar routes are configured to not be hash prefixed.
    res.sendFile(path.join(__dirname, "../public", "index.html"));
};

module.exports = angularRoutes;
