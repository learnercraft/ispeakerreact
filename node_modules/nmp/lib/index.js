var path = require("path");

var NativeModulePath = function() {
	return "this";
};

NativeModulePath.prototype.versionString = function() {
	var v8 = 'v8-'+ /[0-9]+\.[0-9]+/.exec(process.versions.v8)[0];
	var modulePath = process.platform + '-' + process.arch+ '-'+ v8;
	return modulePath;
};

NativeModulePath.prototype.join = function(/*rootFolder, binaryName*/) {
	var args = [];

	for (var i = 0; i < arguments.length-1; i++) {
		args.push(arguments[i]);
	}

	args.push(this.versionString());
	args.push(arguments[arguments.length-1]);

	var result = path.join.apply(path.join, args);
	return result;
};

module.exports = NativeModulePath;