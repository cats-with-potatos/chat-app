const socketio = require("socket.io")
, auth = require("./auth.js")
, clients = {};

let io;
const listen = (app) => {
	if (typeof app !== "undefined") {
		io = socketio(app)

		// Defining the connection behavior
		io.on('connection', (socket) => {
			socket.on("newUser", (token) => {
				auth.checkJwt(token)
				.then((decoded) => {
					console.log("You have connected");
					clients[decoded.id] = {
						socket: socket.id,
					};
				})
				.catch((e) => {
					console.log("Invalid token");
				})
			});
		});
	}
	return io;
};

exports.listen = listen;
exports.clients = clients;
