// James Taylor - 466598
// Framing module - Decodes and packages data

function framer() {

	var connections = require("./connections");
	// used for the server to emit events
	var emitter = "";
	var connection;


	// Ensures the full length of the frame has been recieved
	this.checkRecievedData = function(data, connectionID) {

		// checks to see if more frames are expected
		if (connection.returnWaitState(connectionID) == true) {
			connection.addWaitArray(data, connectionID);
			var concatenatedArray = connection.returnWaitArray(connectionID);

			// Set length of expected data
			if ((concatenatedArray[1] & 127) <= 125) {
				var setLength = (concatenatedArray[1] & 127) + 6;
				connection.addFullWaitLength(connectionID, setLength);
			}
			if ((concatenatedArray[1] & 127) == 126) {
				if (concatenatedArray.length > 4) {
					var setLength = returnLength(concatenatedArray);
					connection.addFullWaitLength(connectionID, setLength);
				}
			}
			if ((concatenatedArray[1] & 127) == 127) {
				if (concatenatedArray.length > 10) {
					var setLength = returnLength(concatenatedArray);
					connection.addFullWaitLength(connectionID, setLength);
				}
				
			}
			if (concatenatedArray.length == connection.returnFullWaitLength(connectionID)) {
				// Reset wait variables
				connection.changeWaitState(connectionID, false);
				connection.clearWaitArray(connectionID);
				connection.clearWaitLength(connectionID);

				// Pass on message for decoding
				decode(concatenatedArray, connectionID);
			}
		}
		else {
			if (data[0] == 129 || data[0] == 130 || data[0] == 136 || data[0] == 137 || data[0] == 138) {
				if (data[0] == 138) {
					function splitFrames(data) {
						var checkLength = returnLength(data);
						if (data.length > checkLength) {
							var newFragment = data.slice(0, checkLength);
							decode(newFragment, connectionID);
							var unhandledFragment = data.slice(checkLength);
							splitFrames(unhandledFragment);
						}
						else {
							checkFullFrameRecieved(data, connectionID);
							decode(data, connectionID);
						}
					}
					splitFrames(data);
				}
				else if (data[0] == 136) {
					decode(data, connectionID);
					return;
				}
				else {
					checkFullFrameRecieved(data,connectionID);
				}
				if (connection.returnWaitState(connectionID) == false) {
					decode(data, connectionID);
				}
				else {
					connection.addWaitArray(data, connectionID);
				}
			}
			else if (data[0] == 1 || data[0] == 2 || data[0] == 128 || data[0] == 0) { // fragmentation
				// if continuation frame is sent with no message to continue
				if (data[0] == 0 && connection.fragmentArray("get", data, connectionID).length == 0) {
					connection.closeConnection(connectionID, 1002);
				}
				// if continuation frame is sent with its FIN set but it has no message to continue
				else if (data[0] == 128 && connection.fragmentArray("get", data, connectionID).length == 0) {
					connection.closeConnection(connectionID, 1002);
				}
				else if (data.length < 6) {
					connection.changeWaitState(connectionID, true);
					connection.addWaitArray(data, connectionID);
				}
				else {
					function checkFragments(data) {
						//check frame is fragmented, if not divide it
						var checkLength = returnLength(data);
						if (data.length > checkLength) {
							var newFragment = data.slice(0, checkLength);
							handleFragmentation(newFragment, connectionID);
							var unhandledFragment = data.slice(checkLength);
							checkFragments(unhandledFragment);
						}
						else {
							handleFragmentation(data, connectionID);
						}
					}
					checkFragments(data);
				}
			}
			else {
				connection.closeConnection(connectionID, 1002);
			}
		}
	}

	// Handles fragmentation cases
	function handleFragmentation(data, connectionID) {
		var opcode = data[0];

		// Pings may be sent in the middle of fragments
		if (opcode == 137) {
			decode(data, connectionID);
			return;
		}
		else if (opcode == 136) {
			decode(data, connectionID);
			return;
		}
		if (opcode == 0 && connection.fragmentArray("get", data, connectionID).length == 0) {
			connection.closeConnection(connectionID, 1002);
		}
		else if ((opcode == 1 || opcode == 2 || opcode == 129) && (connection.fragmentArray("get", data, connectionID).length != 0)) {
			connection.closeConnection(connectionID, 1002);
		}

		// remember the opcode for sending later
		if (opcode == 1) {
			connection.fragmentOpcode("set", 129, connectionID);
		}
		else if (opcode == 2) {
			connection.fragmentOpcode("set", 130, connectionID);
		}
		// unmask the message
		var maskLocation = 2;
		var dataLength = data[1] & 127;
		if (dataLength == 126) {
			maskLocation = 4;
		}
		else if (dataLength == 127) {
			maskLocation = 10;
		}
		var unmaskedData = [];
		var maskingKey = data.slice(maskLocation, maskLocation + 4);
		var dataLocation = maskLocation + 4;
		for (var i = 0; dataLocation < data.length; i++) {
			var newData = data[dataLocation] ^ maskingKey[i % 4];
			unmaskedData.push(newData);
			dataLocation++;
		}


		var buf = new Buffer(unmaskedData);
		connection.fragmentArray("set", buf, connectionID);

		// Message with FIN set to 1, package fragments for sending
		if (opcode == 128) {
			var dataBuffer = connection.fragmentArray("get", buf, connectionID);
			connection.fragmentArray("reset", buf, connectionID);
			opcode = connection.fragmentOpcode("get", 0, connectionID);

			// Construct the first bytes of the message
			var newData = [];
			newData[0] = opcode;
			setPayloadLength(newData, dataBuffer.length);

			var buf = new Buffer(newData);
			var bufList = [];
			bufList[0] = buf;
			bufList[1] = dataBuffer;
			var packagedMessage = Buffer.concat(bufList);
			connection.sendFrame(packagedMessage, connectionID);
		}
	}

	// Used to correctly handle the data recieved from the client
	function decode(data, connectionID) {
		
		// The type of data (Opcode)
		var opcode = data[0];
		// The length of the data must be greater than 5 to be a valid frame
		if (data.length <= 5) {
			connection.closeConnection(connectionID, 1008);
			console.log("Frame Length too short!");
			return;
		}

		// make the initial check on the RSV numbers
		if (invalidRSV(opcode)) {
			connection.closeConnection(connectionID, 1002);
		}

		if (opcode == 129) { // text message
			emitter.emit("message", data, connectionID);
			var decodedData = unmaskMessage(data);
			var packagedData = packageData(decodedData);
			var encodedBuffer = new Buffer(packagedData);
			connection.sendFrame(encodedBuffer, connectionID);
		}
		else if (opcode == 1 || opcode == 2 || opcode == 0 || opcode == 128) { // fragmented messages
			handleFragmentation(data, connectionID);
		}
		else if (opcode == 130) { // binary frame
			emitter.emit("message", data, connectionID);
			var decodedData = unmaskMessage(data);
			var packagedData = packageData(decodedData);
			var encodedBuffer = new Buffer(packagedData);
			connection.sendFrame(encodedBuffer, connectionID);
		}
		else if (opcode == 136) { // close frame
			// Check for valid close code and close the connection
			validateCloseFrame(connectionID, data);
		}
		else if (opcode == 137) { // ping frame
			if (data.length <= 131) {
				var decodedData = unmaskMessage(data);
				var packagedData = constructPongFrame(decodedData);
				var encodedBuffer = new Buffer(packagedData);
				connection.sendFrame(encodedBuffer, connectionID);
			}
			else {
				connection.closeConnection(connectionID, 1002);
			}
		}
		else if (opcode == 138) { // pong frame
			console.log("Pong recieved");
		}
		else {
			connection.closeConnection(connectionID, 1002);
		}

	}


	// Used to package the data in the correct framing format for WebSockets
	function packageData(data) {
		// extract the opcode from the data array then remove it from the array
		var opcode = data.pop();
		var newData = [];
		newData[0] = opcode;

		var payloadLength = data.length;

		if (payloadLength <= 125) {
			var dataLocation = 2;
			newData[1] = payloadLength;
		}
		else if (payloadLength >= 126 && payloadLength <= 65535) {
			var dataLocation = 4;
			newData[1] = 126;
			newData[2] = payloadLength >>> 8;
			newData[3] = payloadLength & 255;
		}
		else if (payloadLength >= 65536) {
			var dataLocation = 10;
			newData[1] = 127;

			// The first 32 bits
			newData[9] = (payloadLength) & 255;
			newData[8] = (payloadLength >> 8) & 255;
			newData[7] = (payloadLength >> 16) & 255;
			newData[6] = (payloadLength >> 24) & 255;

			// if the number is greater than 32bit
			if (payloadLength >= 4294967296) {
				// Get the higher 64 bit
				var sixtyFourBit = payloadLength.toString(2);
				var thirtyTwoBit = sixtyFourBit.slice(0, (sixtyFourBit.length - 32));
				var secondThirtyTwoBits = parseInt(thirtyTwoBit, 2);

				newData[5] = (secondThirtyTwoBits) & 255;
				newData[4] = (secondThirtyTwoBits >> 8) & 255;
				newData[3] = (secondThirtyTwoBits >> 16) & 255;
				newData[2] = (secondThirtyTwoBits >> 24) & 255;
			}
			else { // if number is less than 32bit
				newData[5] = 0;
				newData[4] = 0;
				newData[3] = 0;
				newData[2] = 0;
			}
			
		}

		for (var i = 0; i < payloadLength; i++) {
			newData[dataLocation] = data[i];
			dataLocation++;
		}
		return newData;

	}

	// unmasks a message
	function unmaskMessage(data) {
		// The payload length
		var payloadLength = data[1];

		// The location of the masking key
		// Defualt 2
		var locationOfMask = 2;

		// Find the length of the message being sent, remove the masking key using & 127
		var payloadLength = payloadLength & 127;
		if (payloadLength == 126) {
			// If the length of the payload is 126, 2 extra bytes represent the length
			locationOfMask = 4;
		}
		else if (payloadLength == 127) {
			// If length of the payload is 127, 8 extra bytes represent the length
			locationOfMask = 10;
		}

		// Mask is 4 bytes long
		var maskingKey = data.slice(locationOfMask, locationOfMask + 4);
		
		var dataLocation = locationOfMask + 4;

		// new array to hold decodedData
		var decodedData = [];

		var logString = "";
		for (var i = 0; dataLocation < data.length; i++) {
			var newData = data[dataLocation] ^ maskingKey[i % 4];
			decodedData.push(newData);
			dataLocation++;
		}

		decodedData.push(data[0]);

		return decodedData;

	}
	 
	// Used to set the correct payload length for packaging data
	function setPayloadLength(newData, payloadLength) {
		if (payloadLength <= 125) {
			var dataLocation = 2;
			newData[1] = payloadLength;
		}
		else if (payloadLength >= 126 && payloadLength <= 65535) {
			var dataLocation = 4;
			newData[1] = 126;
			newData[2] = payloadLength >>> 8;
			newData[3] = payloadLength & 255;
		}
		else if (payloadLength >= 65536) {
			var dataLocation = 10;
			newData[1] = 127;

			// The first 32 bits
			newData[9] = (payloadLength) & 255;
			newData[8] = (payloadLength >> 8) & 255;
			newData[7] = (payloadLength >> 16) & 255;
			newData[6] = (payloadLength >> 24) & 255;

			// if the number is greater than 32bit
			if (payloadLength >= 4294967296) {
				var sixtyFourBit = payloadLength.toString(2);
				var thirtyTwoBit = sixtyFourBit.slice(0, (sixtyFourBit.length - 32));
				var secondThirtyTwoBits = parseInt(thirtyTwoBit, 2);
				newData[5] = (secondThirtyTwoBits) & 255;
				newData[4] = (secondThirtyTwoBits >> 8) & 255;
				newData[3] = (secondThirtyTwoBits >> 16) & 255;
				newData[2] = (secondThirtyTwoBits >> 24) & 255;
			}
			else { // if number is less than 32bit
				newData[5] = 0;
				newData[4] = 0;
				newData[3] = 0;
				newData[2] = 0;
			}
		}
	}

	// Creates a Pong frame
	function constructPongFrame(data) {
		var pingOpcode = data.pop();
		var newData = [];
		newData[0] = 138;
		newData[1] = data.length;
		var dataLocation = 2;

		var i = 0;
		while (i < data.length) {
			newData[dataLocation] = data[i];
			dataLocation++;
			i++;
		}
		return newData;
	}

	// Used to check the full frame has been recieved
	function checkFullFrameRecieved(data, connectionID) {
		var payloadLength = data[1] & 127; //remove mask bit
		if (payloadLength <= 125) {
			if ((data.length - 6) == payloadLength) {
				//console.log("Correct Frame Size");
			}
			else {
				connection.changeWaitState(connectionID, true);
			}
		}
		else if (payloadLength == 126) {
			var dataRecieved = data.slice(8, (data.length));
			var payOne = data[2] << 8;
			var payTwo = data[3];
			var dataLength = payOne + payTwo;
			if (dataLength == dataRecieved.length) {
				//console.log("Correct Frame Size");
			}
			else {
				connection.changeWaitState(connectionID, true);
			}
		}
		else if (payloadLength == 127) {
			var dataRecieved = data.slice(14, (data.length));
			var dataLength = "";
			for (var i = 2; i < 10; i++) {
				if (data[i] == 0) {
					var str ="00000000";
				}
				else {
					var newByte = data[i];
					var str = newByte.toString(2);
				}
				dataLength += str;
			}
			dataLength = parseInt(dataLength, 2);
			if (dataLength == dataRecieved.length) {
				//console.log("Frame Recieved");
			}
			else {
				connection.changeWaitState(connectionID, true);
			}
		}
	}

	// Returns the expected length of the data as specified by the Payload Length byte (2nd byte);
	function returnLength(data) {
		if ((data[1] & 127) <= 125) {
			return (data[1] & 127) + 6;
		}
		else if ((data[1] & 127) == 126) {
			var dataLength = (data[2] << 8) + data[3];
			return dataLength + 8;
		}
		else if ((data[1] & 127) == 127) {
			var dataLength = "";
			for (var i = 2; i < 10; i++) {
				if (data[i] == 0) {
					var str ="00000000";
				}
				else {
					var newByte = data[i];
					var str = newByte.toString(2);
				}
				dataLength += str;
			}
			dataLength = parseInt(dataLength, 2);
			return dataLength + 14;
		}
	}

	// Checks that RSV1, RSV2 and RSV3 are all set to 0
	function invalidRSV(firstByte) {
		var check = firstByte;
		// remove opcode and FIN;
		check = check >> 4;
		check = check & 7;

		if (check == 0) {
			return false;
		}
		else {
			return true;
		}
	}

	// Validates a close frame
	function validateCloseFrame(connectionID, data) {
		if (data.length == 6) { // No close code
			connection.closeConnection(connectionID, 1000);
			return;
		}
		else if (data.length == 7) { // Only half close code
			connection.closeConnection(connectionID, 1002);
			return;
		}
		// CLOSE CODE CHECKING
		var mask = data.slice(2, 6);
		var maskedCode = data.slice(6, 8);
		var unmaskedCode = [];
		for (var i = 0; i < maskedCode.length; i++) {
			unmaskedCode[i] = maskedCode[i] ^ mask[i % 4];
		}
		unmaskedCode[0] = unmaskedCode[0] << 8;
		var statusCode = unmaskedCode[0] + unmaskedCode[1];

		if (statusCode <= 999 || statusCode >= 5000) {
			connection.closeConnection(connectionID, 1002);
		}
		else if (statusCode >= 3000 && statusCode <= 4999) {
			connection.closeConnection(connectionID, 1000);
		}
		else {
			switch(statusCode) {
				case 1000: connection.closeConnection(connectionID, 1000); break;
				case 1001: connection.closeConnection(connectionID, 1000); break;
				case 1002: connection.closeConnection(connectionID, 1000); break;
				case 1003: connection.closeConnection(connectionID, 1000); break;
				case 1007: connection.closeConnection(connectionID, 1000); break;
				case 1008: connection.closeConnection(connectionID, 1000); break;
				case 1009: connection.closeConnection(connectionID, 1000); break;
				case 1010: connection.closeConnection(connectionID, 1000); break;
				case 1011: connection.closeConnection(connectionID, 1000); break;
				default: connection.closeConnection(connectionID, 1002);
			}
		}

	}

	this.setEmitter = function(object) {
		emitter = object;
	}

	this.setConnectionList = function(list) {
		connection = list;
	}

	this.unmaskMessageCaller = function(message) {
		return unmaskMessage(message);
	}

	this.packageDataCaller = function(data) {
		return packageData(data);
	}

}

module.exports = framer;