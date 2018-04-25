// WebSocket Server
// James Taylor - 466598

// Emit events
var events = require("events");
var util = require("util");


function WebSocketServer(sendMethod, port) {

	// Used to create the http server that will be upgraded
	var http = require("http");
	// Used to create the "sec-websocket-accept" key
	var crypto = require("crypto");
	// Used to retrive a message sent by the client
	var recievedFrame = require("./framing");
	// Used to create a connection instance
	var connections = require("./connections");

	var connectionList = new connections.serverConnections();
	var frameOperation = new recievedFrame();
	frameOperation.setConnectionList(connectionList);
	this.framer = frameOperation;
	this.connect = connectionList;
	var port = port || 8080;

	events.EventEmitter.call(this);
	var self = this;
	frameOperation.setEmitter(this);

	console.log("Creating Server...");

	switch(sendMethod) {
		case "all":
			connectionList.setSend("all");
			break;
		case "others":
			connectionList.setSend("others");
			break;
		case "echo":
			connectionList.setSend("echo");
			break;
		case "none":
			connectionList.setSend("none");
			break;
		default:
			connectionList.setSend("all");
	}

	// The http server that acts as the underlying server
	var newServer = http.createServer(function (request, response) {
		request.on("end", function() {
			response.writeHead(200, {
				'Content-Type': 'text/html'
			});
			response.end("Connect using the ws:// prefix");
		});
	}).listen(port);

	console.log("Server started and listening for connections on port " + port);

	//listens for an upgrade
	newServer.on("upgrade", function (res, socket, head) {
		var key = acceptKey(res.headers["sec-websocket-key"]);
		socket.write("HTTP/1.1 101 Switching Protocols\r\n" +
					"Upgrade: websocket\r\n" +
					"Connection: Upgrade\r\n" +
					"Sec-WebSocket-Accept: " + key + "\r\n" +
					"\r\n");
		socket.setKeepAlive(true);
		socket.removeAllListeners("timeout");
		var newConnection = new connections.socketConnection(socket, connectionList.getNewID());
		connectionList.addToConnectionList(newConnection);
		var connectionID = newConnection.returnID();
		self.emit("connection", connectionID);
		socket.on("data", function(data) {
			frameOperation.checkRecievedData(data, connectionID);
		});
		socket.on("close", function(e) {
			self.emit("closedconnection", connectionID);
		});
	});

	// Used to return the accept key
	function acceptKey(clientKey) {
		// The Globally Unique Identifier
		var GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
		var key = clientKey + GUID;
		var sha = crypto.createHash('sha1');
		sha.update(key);
		key = sha.digest(encoding="base64");
		return key;
	}


	exports.sendFrame = connections.sendFrame;

}

util.inherits(WebSocketServer, events.EventEmitter);

// Send a message to a client
WebSocketServer.prototype.sendMessage = function(people, data, id) {
	// Data type checks
	if (typeof data == "string") {
		var newData = [];
		opcode = 129;
		for (var i = 0; i < data.length; i++) {
			newData.push(data.charCodeAt(i));
		}
		newData.push(opcode);
		data = new Buffer(this.framer.packageDataCaller(newData));
	}
	else if (!Buffer.isBuffer(data)) {
		console.log("You need to use the ws.packageMessage() first");
		return;
	}

	// Send the data
	if (people == "all") {
		this.connect.sendToAll(data);
	}
	else if (people == "others") {
		if (!id) {
			console.log("The others parameter cannot be used if an ID is not specified");
		}
		this.connect.sendToOthers(data, id)
	}
	else if (people == "one") {
		if (!id) {
			console.log("The others parameter cannot be used if an ID is not specified");
		}
		this.connect.echoBack(data, id)
	}
	else {
		console.log("Unknown Send Command: " + people);
	}
}

// Unmask a message
WebSocketServer.prototype.unmaskMessage = function(message) {
	if (!Buffer.isBuffer(message)) {
		console.log("You must supply a valid WebSocket frame to unmask.");
		return;
	}
	var unmasked = this.framer.unmaskMessageCaller(message);
	var obj = { };
	obj.opcode = unmasked.pop();
	obj.message = unmasked;
	return obj;
}

// Package a message
WebSocketServer.prototype.packageMessage = function(opcode, message) {
	if (Array.isArray(message)) {
		message.push(opcode);
		return new Buffer(this.framer.packageDataCaller(message));
	}
	else {
		console("Wrong data type fed to packageMessage");
	}
}


// Close a connection
WebSocketServer.prototype.closeConnection = function(id) {
	if (typeof id != "number") {
		console.log("closeConnection needs a valid integer id");
		return;
	}
	this.connect.closeConnection(id, 1000);
}

// Convert bytes to a string
WebSocketServer.prototype.convertToString = function(message) {
	if (!Array.isArray(message)) {
		console.log("You must enter an array of bytes to convert to a string");
		return;
	}
	var str = "";
	for (var i = 0; i < message.length; i++) {
		str += String.fromCharCode(message[i]);
	}
	return str;
}

// Return the type of received message
WebSocketServer.prototype.messageType = function(opcode) {
	// Check that the opcode is a valid whole number
	if ((typeof opcode != 'number') || (opcode % 1 != 0)) {
		console.log("An opcode must be an integer");
		return "invalid";
	}
	if (opcode === 129) {
		return "text";
	}
	else if (opcode === 130) {
		return "binary";
	}
	else {
		console.log("Cannot determine type of message");
		return "invalid";
	}

}

module.exports = WebSocketServer;



