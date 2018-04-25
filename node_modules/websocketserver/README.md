WebSocketServer
===============
A WebSocket server implementation for Node.js, various features to still implement such as support for wss:// and performance analytics centre.

Installation
============
Install using npm - https://npmjs.org/package/websocketserver

<pre>npm install websocketserver</pre>

Basic Usage
===========
In a project require the websocketserver module and create an instance of it:

<pre>var WebSocketServer = require("websocketserver");
var server = new WebSocketServer("all", 9000);</pre>

This will create a WebSocket server that runs on 9000 (default 8080) and uses a sendMethod that sends recieved connections to all server connections. Four sendMethods can be used:
 
  1) `all` - will send received messages to all users
  
  2) `others` - will send messages to all users apart from the sender
  
  3) `echo` - will echo the message back to the sender
  
  4) `none` - will not automatically send any messages (useful for when more control is needed over message sending, use API to send messages)
  
Events
======
The server emits events on a new connection, message and a closed connection:

  1) `connection` event - use to built a list of connections
  
  <pre>var connectionList = [];
server.on("connection", function(id) {
    connectionList.push(id);
});</pre>

  2) `message` event - get hold of the message
  <pre>server.on("message", function(data, id) {
    var mes = server.unmaskMessage(data);
    var str = server.convertToString(mes.message);
    console.log(str);
});</pre>

  3) `connectionclosed` - log a connection has left (can also use id to remove from connectionList)
  <pre>server.on("closedconnection", function(id) {
    console.log("Connection " + id + " has left the server");
});</pre>
  
Functions
==========

  1) `WebSocketServer.sendMessage(people, data, id);` - send a message to specified `people` (`all`, `others` or `one`), `data` supports strings and packaged WebSocket messages (use `packageMessage` function for packaging), `id` is relates to the connection that you would like (or not to if `others` has been selected for the `people` argument, `id` not required if all has been selected).
  
  This example shows how new connections to the server can be welcomed with a message:
  
  <pre>server.on('connection', function(id) {
    server.sendMessage("one", "Welcome to the server!", id);
});</pre>

  2) `WebSocketServer.unmaskMessage(frame);` - unmasks a WebSocket frame recieved by the server - returns a JavaScript objects with two properties: `opcode` and `message` (`message` is an array of bytes holding character codes - use `convertToString(message)` function to get the string representation)
  
  Example shows how a message could be logged to the console:
  
  <pre>server.on('message', function(data, id) {
    var mesObj = server.unmaskMessage(data);
    console.log(server.convertToString(mesObj.message));
});</pre>
  
  3) `WebSocketServer.convertToString(bytes);` - converts an array of bytes containing character codes to a string.
  
  4) `WebSocketServer.packageMessage(opcode, message);` - packages a recieved WebSocket message into a sendable WebSocket message - this function is only really necessary after use of `unmaskMessage()` as it is only really necessary for data that needs to pass through the server (primarily binary messages)
  
  Example shows how we may filter binary data to send straight through the server as most of the time we have no reason to log it.
  
  <pre>server.on('message', function(data, id) {
     var mes = server.unmaskMessage(data);
     if (mes.opcode == 130) {
         var packagedMessage = server.packageMessage(mes.opcode, mes.message);
         server.sendMessage('all', packagedMessage);
     }
});</pre>

  5) `WebSocketServer.closeConnection(id);` close a specific connection
  
 
      
