const authFunctions = require("../lib/auth.js")
, authRoutes = require("./authRoutes.js")
, chatRoutes = require("./chatRoutes.js")
, channelRoutes = require("./channelRoutes.js")
, angularRoutes = require("./angularRoutes.js")
, routes = {};


routes.authRoutes = authRoutes;
routes.chatRoutes = chatRoutes;
routes.channelRoutes = channelRoutes;
routes.angularRoutes = angularRoutes;
module.exports = routes;
