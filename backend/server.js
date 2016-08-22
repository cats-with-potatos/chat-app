const express = require("express")
, app = express()
, routes = require("./routes.js")
, router = express.Router();


app.use('/api', router);
router.get('/', (req, res) => {
  res.json({
    message: 'It\'s alive!!'
  });
});
router.get("/getAllMessages", routes.getAllMessages);
router.get("/getChannelMessages", routes.getChannelMessages);
router.post("/signup", routes.signup);

app.use('/', express.static('public'));
app.get('/*', (req, res, next) => {
  //[JG]: Anguar routes are configured to not be hash prefixed.
  if (req.url.indexOf('/api') === 0) {
    next();
  }
  else {
    res.sendFile(__dirname + '/public/index.html');
  }
});

app.listen(8080);
