const authFunctions = require("../lib/auth.js")
, authRoutes = require("./authRoutes.js")
, chatRoutes = require("./chatRoutes.js")
, angularRoutes = require("./angularRoutes.js")
, routes = {};


routes.authRoutes = authRoutes;
routes.chatRoutes = chatRoutes;
routes.angularRoutes = angularRoutes;

module.exports = routes;
