// James Taylor - 466598
// Connections Module - Used to log information of a connection

function socketConnection(socket, connectionNumber) {
	this.connectionNumber = connectionNumber;
	this.socket = socket;
	this.waitingForFrames = false;
	this.fullWaitLength = 0;
	this.waitArray = [];
	this.arrayIndex;
	this.fragmentOpcode;
	this.fragmentArray = [];
}

socketConnection.prototype = {
		sendData: function(data) {
			this.socket.write(data);
		},
		returnID: function() {
			return this.connectionNumber;
		},
		closeSocket: function(closeFrame) {
			this.socket.write(closeFrame);
			this.socket.end();
			this.socket.destroy();
		},
		returnWaitingFrames: function() {
			return this.waitingForFrames;
		},
		changeWaitingFrames: function(state) {
			this.waitingForFrames = state;
		},
		setWaitArray: function(data) {
			this.waitArray.push(data);
		},
		resetWaitArray: function() {
			this.waitArray = [];
		},
		giveWaitArray: function() {
			var buf = Buffer.concat(this.waitArray)
			return buf;
		},
		setWaitLength: function(length) {
			this.fullWaitLength = length;
		},
		getWaitLength: function() {
			return this.fullWaitLength;
		},
		resetWaitLength: function() {
			this.fullWaitLength = 0;
		},
		setOpcode: function(opcode) {
			this.fragmentOpcode = opcode;
		},
		returnOpcode: function() {
			return this.fragmentOpcode;
		},
		setFragmentArray: function(data) {
			this.fragmentArray.push(data);
		},
		returnFragmentArray: function() {
			var buf = Buffer.concat(this.fragmentArray);
			return buf;
		},
		resetFragmentArray: function() {
			this.fragmentArray = [];
		}

	}

function serverConnections() {

	var connectionNumber = 0;
	var connectionList = [];
	var sendTo = "";
	var self = this;

	// Sends data to all users
	this.sendToAll = function(data) {
		var i = 0;
		while (i < connectionList.length) {
			connectionList[i].sendData(data);
			i++;
		}
	}

	// Sends data to all users apart from the sender
	this.sendToOthers = function(data, id) {
		var i = 0;
		while (i < connectionList.length) {
			if (id != connectionList[i].returnID()) {
				connectionList[i].sendData(data);
			}
			i++;
		}
	}

	// Echo test
	this.echoBack = function(data, id) {
		var i = 0;
		while (i < connectionList.length) {
			if (id == connectionList[i].returnID()) {
				connectionList[i].sendData(data);
			}
			i++;
		} 
	}

	this.addToConnectionList = function(connection) {
		connectionList.push(connection);
	}

	this.closeConnection = function(connectionID, status) {
		connectionID = findConnection(connectionID);
		if (connectionID != -1) {
			var closeFrameArray = [];
			var statusBytes = statusCode(status);
			closeFrameArray[0] = 136;
			closeFrameArray[1] = 2;
			closeFrameArray[2] = statusBytes[0];
			closeFrameArray[3] = statusBytes[1];
			closeFrame = new Buffer(closeFrameArray);
			connectionList[connectionID].closeSocket(closeFrame);
			//connectionList.splice(connectionID, 1);
		}
		else {
			console.log("Error shutting connection.");
		}
	}

	// Changes the state to true if the connection is waiting for more frames
	this.changeWaitState = function(connectionID, state) {
		connectionID = findConnection(connectionID);
		if (connectionID != -1) {
			connectionList[connectionID].changeWaitingFrames(state);
		}
		else {
			console.log("Error changing Connection state");
		}
	}

	this.returnWaitState = function(connectionID) {
		var state;
		connectionID = findConnection(connectionID);
		if (connectionID != -1) {
			state = connectionList[connectionID].returnWaitingFrames();
		}
		else {
			state = -1;
		}
		return state;
	}

	this.addWaitArray = function(data, connectionID) {
		connectionID = findConnection(connectionID);
		if (connectionID != -1) {
			connectionList[connectionID].setWaitArray(data);
		}
		else {
			console.log("Error setting waitArray");
		}
	}

	this.clearWaitArray = function(connectionID) {
		connectionID = findConnection(connectionID);
		if (connectionID != -1) {
			connectionList[connectionID].resetWaitArray();
		}
		else {
			console.log("Error resetting waitArray");
		}
	}

	this.returnWaitArray = function(connectionID) {
		var data = [];
		connectionID = findConnection(connectionID);
		if (connectionID != -1) {
			data = connectionList[connectionID].giveWaitArray();
		}
		return data;
	}

	function findConnection(connectionID) {
		var i = 0;
		while (i < connectionList.length) {
			var lookup = connectionList[i].returnID();
			if (lookup == connectionID) {
				connectionID = i;
			}
			i++;
		}
		return connectionID;
	}

	this.addFullWaitLength = function(connectionID, length) {
		connectionID = findConnection(connectionID);
		if (connectionID != -1) {
			connectionList[connectionID].setWaitLength(length);
		}
	}

	this.returnFullWaitLength = function(connectionID) {
		connectionID = findConnection(connectionID);
		if (connectionID != -1) {
			return connectionList[connectionID].getWaitLength();
		}
	}

	this.clearWaitLength = function(connectionID) {
		connectionID = findConnection(connectionID);
		if (connectionID != -1) {
			connectionList[connectionID].resetWaitLength();
		}
	}

	// used to remember the fragment opcode
	this.fragmentOpcode = function(state, opcode, connectionID) {
		connectionID = findConnection(connectionID);
		if (connectionID != -1) {
			if (state == "set") {
				connectionList[connectionID].setOpcode(opcode);
			}
			else if (state == "get") {
				return connectionList[connectionID].returnOpcode();
			}
			else {
				console.log("INVALID STATE GIVEN!" + state);
			}
		}
	}

	// Used to hold recived fragments
	this.fragmentArray = function(state, data, connectionID) {
		connectionID = findConnection(connectionID);
		if (connectionID != -1) {
			if (state == "set") {
				connectionList[connectionID].setFragmentArray(data);
			}
			else if (state == "get") {
				return connectionList[connectionID].returnFragmentArray();
			}
			else if (state == "reset") {
				connectionList[connectionID].resetFragmentArray();
			}
			else {
				console.log("INVALID STATE GIVEN: " + state);
			}
		}
	}

	// For setting the send method
	this.setSend = function(sendMethod) {
		console.log("Setting server send method to: " + sendMethod);
		sendTo = sendMethod;
	}

	// Handles which method to use to send data
	this.sendFrame = function(data, connectionID) {
		switch(sendTo) {
			case "all": self.sendToAll(data); break;
			case "others": self.sendToOthers(data, connectionID); break;
			case "echo": self.echoBack(data, connectionID); break;
			case "none": break;
		}
	}

	// Returns a new id for a new connection
	this.getNewID = function() {
		connectionNumber++;
		return connectionNumber;
	}

	// Returns the correct byte values for the status code
	function statusCode(status) {
		var first = status >> 8;
		var second = status & 255;

		return [first,second];
	}
}

exports.socketConnection = socketConnection;
exports.serverConnections = serverConnections;