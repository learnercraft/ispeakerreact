var fs = require("fs");
var http = require("http");
var url = require("url");

http.createServer(function (request, response) {

    var pathname = url.parse(request.url).pathname;
    console.log("Request for " + pathname + " received.");

    response.writeHead(200);

    if(pathname == "/") {
        html = fs.readFileSync("index.html", "utf8");
        response.write(html);
    } else if (pathname == "/scripts/controller.js") {
        script = fs.readFileSync("scripts/controller.js", "utf8");
        response.write(script);
    }
	else if (pathname == "/scripts/jquery-2.0.0.min.js") {
        script = fs.readFileSync("scripts/jquery-2.0.0.min.js", "utf8");
        response.write(script);
    }
	else if (pathname == "/scripts/jquery-ui-1.10.3.custom.min.js") {
        script = fs.readFileSync("scripts/jquery-ui-1.10.3.custom.min.js", "utf8");
        response.write(script);
    }
	else if (pathname == "/scripts/jquery.ui.touch-punch.min.js") {
        script = fs.readFileSync("scripts/jquery.ui.touch-punch.min.js", "utf8");
        response.write(script);
    }
	else if (pathname == "/scripts/angular.min.js") {
        script = fs.readFileSync("scripts/angular.min.js", "utf8");
        response.write(script);
    }
	else if (pathname == "/scripts/angular-ui.min.js") {
        script = fs.readFileSync("scripts/angular-ui.min.js", "utf8");
        response.write(script);
    }
	else if (pathname == "/scripts/angular-animate.js") {
        script = fs.readFileSync("scripts/angular-animate.js", "utf8");
        response.write(script);
    }
	else if (pathname == "/scripts/angular-route.min.js") {
        script = fs.readFileSync("scripts/angular-route.min.js", "utf8");
        response.write(script);
    }
	else if (pathname == "/scripts/sortable.js.js") {
        script = fs.readFileSync("scripts/sortable.js.js", "utf8");
        response.write(script);
    }
	else if (pathname == "/scripts/angular-dragdrop.min.js") {
        script = fs.readFileSync("scripts/angular-dragdrop.min.js", "utf8");
        response.write(script);
    }
	else if (pathname == "/scripts/filters.js") {
        script = fs.readFileSync("scripts/filters.js", "utf8");
        response.write(script);
    }
	else if (pathname == "/scripts/jquery.fancybox.js") {
        script = fs.readFileSync("scripts/jquery.fancybox.js", "utf8");
        response.write(script);
    }
	else if (pathname == "/scripts/html5sql.js") {
        script = fs.readFileSync("scripts/html5sql.js", "utf8");
        response.write(script);
    }
		else if (pathname == "/scripts/recorder.js") {
        script = fs.readFileSync("scripts/recorder.js", "utf8");
        response.write(script);
    }
		else if (pathname == "/scripts/custom.js") {
        script = fs.readFileSync("scripts/custom.js", "utf8");
        response.write(script);
    }
		else if (pathname == "/scripts/easeljs-0.7.1.min.js") {
        script = fs.readFileSync("scripts/easeljs-0.7.1.min.js", "utf8");
        response.write(script);
    }
		else if (pathname == "/scripts/tweenjs-0.5.1.min.js") {
        script = fs.readFileSync("scripts/tweenjs-0.5.1.min.js", "utf8");
        response.write(script);
    }
		else if (pathname == "/scripts/movieclip-0.7.1.min.js") {
        script = fs.readFileSync("scripts/movieclip-0.7.1.min.js", "utf8");
        response.write(script);
    }
		else if (pathname == "/scripts/anim_yes_no.js") {
        script = fs.readFileSync("scripts/anim_yes_no.js", "utf8");
        response.write(script);
    }
    response.end();
}).listen(8888);

console.log("Listening to server on 8888...");