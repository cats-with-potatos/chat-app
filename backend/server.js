const express = require("express")
, app = express()
, router = express.Router()
, bodyParser = require("body-parser")
, server = require("http").Server(app)
, io = require('./lib/socketio.js').listen(server)
, routes = require("./routes/routes.js")
, middleware = require("./lib/middleware.js");

//Middleware
app.use('/', express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use('/api', router);

//Auth Routes
router.post("/signup", routes.authRoutes.signup);
router.post("/signin", routes.authRoutes.signin);
router.get("/checkUserLoggedIn", middleware.checkToken, routes.authRoutes.checkUserLoggedIn);

//Chat Routes
router.get("/getAllMessages", routes.chatRoutes.getAllMessages);
router.get("/getChannelMessages", middleware.checkToken, routes.chatRoutes.getChannelMessages);
router.get("/getIntialUsersTyping", middleware.checkToken, routes.chatRoutes.getIntialUsersTyping)

router.post("/sendChatMessage", middleware.checkToken, routes.chatRoutes.sendChatMessage);
router.post("/sendUserIsTyping", middleware.checkToken, routes.chatRoutes.sendUserIsTyping);
router.post("/sendUserStoppedTyping", middleware.checkToken, routes.chatRoutes.sendUserStoppedTyping);

router.delete("/deleteMessage", middleware.checkToken, routes.chatRoutes.deleteMessage);
router.put("/updateMessage", middleware.checkToken, routes.chatRoutes.updateMessage)


//Channel Routes
router.post("/addUserToChannel", middleware.checkToken, routes.channelRoutes.addUserToChannel);
router.post("/createNewChannel", middleware.checkToken, routes.channelRoutes.createNewChannel);

router.get("/getAllChannels", middleware.checkToken, routes.channelRoutes.getAllChannels);
router.get("/checkUserInChannel", middleware.checkToken, routes.channelRoutes.checkUserInChannel);

//404 route
router.use(middleware.NotFoundApiRoute);

//Serve the angular app when request url is not prefied with /api
app.get('/*', routes.angularRoutes.serveIndex);

server.listen(8080);
