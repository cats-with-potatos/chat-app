const angularRoutes = {};

angularRoutes.serveIndex = (req, res, next) => {
  //[JG]: Anguar routes are configured to not be hash prefixed.
  if (req.url.indexOf('/api') === 0) {
    next();
  }
  else {
    res.sendFile(__dirname + '/public/index.html');
  }
};

module.exports = angularRoutes;
