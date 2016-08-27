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

			socket.on('disconnect', () => {
				for (key in clients) {
					//To make sure that only properties of the clients object are iterated over
					if (clients.hasOwnProperty(key)) {
						if (clients[key].socket === socket.id) {
							console.log("You are deleted of the clients");
							delete clients[key];
							break;
						}
					}
				}
			});
		});
	}
	return io;
};

exports.listen = listen;
exports.clients = clients;
