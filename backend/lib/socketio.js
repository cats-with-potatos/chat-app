var socketio = require("socket.io")(8080);
var socketFunctions = require('socketFunctions.js');

module.exports.listen = (app) => {
	io = socketio.listen(app)

	// Defining the connection behavior
	io.on('connection', (socket) => {
		io.emit('connectionMessage', "A user connected!");
		socket.on('userMessage', (message) => {
			// Real logic to handle messages goes here
			io.emit('userMessage', message);
		});
		socket.on('disconnect', () => {
			io.emit('disconnectMessage', "A user disconnected!");
		});
	});
	return io;
}

