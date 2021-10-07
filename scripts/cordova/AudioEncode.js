
cordova.define("cordova.phonegap.audio.encode.AudioEncode", function(require, exports, module) { var exec = require('cordova/exec');

var encodeAudio = function(originalSrc, successCallback, failCallback) {
  exec(successCallback, failCallback, 'AudioEncode', 'encodeAudio', [originalSrc]);
};

module.exports = encodeAudio;

});
