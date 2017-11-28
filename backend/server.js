const express = require("express")
, app = express()
, router = express.Router()
, bodyParser = require("body-parser")
, server = require("http").Server(app)
, io = require('./lib/socketio.js').listen(server)
, upload = require("./lib/multerSetup.js")
, routes = require("./routes/routes.js") , middleware = require("./lib/middleware.js");

const PORT = process.env.NODE_ENV === "production" ? 8082 : 8080;

//Middleware
app.use('/', express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use('/api', router);

//User Routes
router.get("/checkUserExists", middleware.checkToken, routes.userRoutes.checkUserExists);
router.get("/getFiveUsers", middleware.checkToken, routes.userRoutes.getFiveUsers);
router.get("/getAllUsers", middleware.checkToken, routes.userRoutes.getAllUsers);
router.post("/changeUserProfile", middleware.checkToken, routes.userRoutes.changeUserProfile);


//Auth Routes
router.get("/checkUserLoggedIn", middleware.checkToken, routes.authRoutes.checkUserLoggedIn);
router.post("/signup", routes.authRoutes.signup);
router.post("/signin", routes.authRoutes.signin);

//Chat Routes
router.get("/getAllMessages", routes.chatRoutes.getAllMessages);
router.get("/getChannelMessages", middleware.checkToken, routes.chatRoutes.getChannelMessages);
router.get("/getPrivateMessages", middleware.checkToken, routes.chatRoutes.getPrivateMessages);
router.get("/getIntialUsersTyping", middleware.checkToken, routes.chatRoutes.getIntialUsersTyping);
router.get("/loadPartnerCurrentlyTyping", middleware.checkToken, routes.chatRoutes.loadPartnerCurrentlyTyping);

router.post("/sendChatMessage", middleware.checkToken, routes.chatRoutes.sendChatMessage);
router.post("/sendUserIsTyping", middleware.checkToken, routes.chatRoutes.sendUserIsTyping);
router.post("/sendUserIsTypingPM", middleware.checkToken, routes.chatRoutes.sendUserIsTypingPM);
router.post("/sendUserStoppedTyping", middleware.checkToken, routes.chatRoutes.sendUserStoppedTyping);
router.post("/sendUserStoppedTypingPM", middleware.checkToken, routes.chatRoutes.sendUserStoppedTypingPM);
router.post("/sendPrivateMessage", middleware.checkToken, routes.chatRoutes.sendPrivateMessage);
router.put("/updateMessage", middleware.checkToken, routes.chatRoutes.updateMessage);
router.put("/updatePrivateMessage", middleware.checkToken, routes.chatRoutes.updatePrivateMessage);
router.delete("/deleteMessage", middleware.checkToken, routes.chatRoutes.deleteMessage);
router.delete("/deletePrivateMessage", middleware.checkToken, routes.chatRoutes.deletePrivateMessage);


//Channel Routes
router.post("/addUserToChannel", middleware.checkToken, routes.channelRoutes.addUserToChannel);
router.post("/createNewChannel", middleware.checkToken, routes.channelRoutes.createNewChannel);
router.get("/getAllChannels", middleware.checkToken, routes.channelRoutes.getAllChannels);
router.get("/checkUserInChannel", middleware.checkToken, routes.channelRoutes.checkUserInChannel);

//404 route
router.use(middleware.NotFoundApiRoute);

//Serve the angular app when request url is not prefied with /api
app.get('/*', routes.angularRoutes.serveIndex);

server.listen(PORT, () => {
	console.log(`Listening on port ${PORT}`)
});
