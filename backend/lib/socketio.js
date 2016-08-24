const socketio = require("socket.io")

exports.listen = (app) => {
	io = socketio(app)

	// Defining the connection behavior
	io.on('connection', (socket) => {
		console.log("a user connected!");
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
};
