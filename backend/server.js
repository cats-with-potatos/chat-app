const express = require("express")
, app = express()
, routes = require("./routes/routes.js")
, router = express.Router()
, bodyParser = require("body-parser")

//Middleware
app.use('/', express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use('/api', router);

//Auth Routes
router.post("/signup", routes.authRoutes.signup);
router.post("/signin", routes.authRoutes.signin);

//Chat Routes
router.get("/getAllMessages", routes.chatRoutes.getAllMessages);
router.get("/getChannelMessages", routes.chatRoutes.getChannelMessages);

app.get('/*', routes.angularRoutes.serveIndex);

app.listen(8080);
