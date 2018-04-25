var http = require('http');
var url = require('url');
var fs = require('fs');
var util = require('util');
var ws = require('nodejs-websocket');

// the HTTP server
var httpServer;
// the WebSocket server
var wsServer;
// the server port
// (used by both HTTP connections and WebSockets)
var port = 80;

function contentType(path) {
  if (path.match('.js$')) {
    return 'application/javascript';
  } else if (path.match('.css$')) {
    return 'text/css';
  } else if (path.match('.jpg$')) {
    return 'image/jpeg';
  } else if (path.match('.png$')) {
    return 'image/png';
  } else if (path.match('.json$')) {
    return 'application/json';
  } else {
    return 'text/html';
  }
}

httpServer = http.createServer(function(req, res) {
  var path = url.parse(req.url).pathname;
  if (path == '/') {
    path = 'index.html';
}
  fs.readFile(path, function(err, data) {
    if (err) {
      res.writeHead(404);
      res.end();
    } else {
      res.writeHead(200, {'Content-Type': contentType(path)});
      res.write(data);
      res.end();
    }
  });
});

wsServer = ws.createServer({server: httpServer});

wsServer.addListener('connection', function(connection) {
  connection.addListener('message', function(message) {
    // TODO: directly inject the id without JSON decoding
    var obj = JSON.parse(message);
    obj.id = connection.id;
    var out = JSON.stringify(obj);
    console.log(out);
    connection.broadcast(out);
  });
});

wsServer.listen(port);
console.log('Server running at http://localhost:' + port);
