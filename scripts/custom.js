var event_type = 'click';
var _device = false;
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    event_type = 'touchend';
    _device = true;
}

var isWin = /^win/.test(process.platform);
var recording_path = '';
if (isWin) {
    recording_path = process.env.HOMEDRIVE + process.env.HOMEPATH + '/ispeaker/';
    var fs = require('fs');

    fs.exists(recording_path, function(exists) {
        if (exists) {
            // Do something
        } else {
            fs.mkdir(recording_path, 0777, function(_err) {
                // path was created unless there was error
            });
        }
    });
}



$(document).ready(function() {
    //database
    if (!html5sql.database) {
        html5sql.openDatabase("MITR", "iSpeaker", 5 * 1024 * 1024);
    }
    html5sql.logInfo = true;
    html5sql.logErrors = true;


    $('.main_wrapper').parent().css('padding', '0');// to remove padding
    set_max_height();
    $(window).resize(function() {
        set_max_height();
    });
    $('.models_page_down_arrow').click(function() {
        var dropd = $('.down_arrow_wrapper');
        if (dropd.is(':visible')) {
            $('.down_arrow_wrapper').hide();
        } else {
            $('.down_arrow_wrapper').show();
        }
    });
});
function set_max_height() {
    var window_height = parseInt(($(window).height()));
    if (window_height <= (678)) {
        window_height = (678);
    } else {

    }
    $('.scroll_bar, .left_part, .right_part').css('min-height', (window_height - 50) + 'px').css('max-height', (window_height - 50) + 'px');
    $('.main_wrapper').css('min-height', window_height + 'px');
}

function __log(e, data) {
    //log.innerHTML += "\n" + e + " " + (data || '');
    console.log("\n" + e + " " + (data || ''));
}

var audio_context;
var recorder;

function startUserMedia(stream) {
    var input = audio_context.createMediaStreamSource(stream);
    __log('Media stream created.');

    //input.connect(audio_context.destination);
    __log('Input connected to audio context destination.');

    recorder = new Recorder(input);
    __log('Recorder initialised.');
}

function startRecording(button) {
    recorder && recorder.record();
    //button.disabled = true;
    //button.nextElementSibling.disabled = false;
    __log('Recording...');
}

function stopRecording(button) {
    recorder && recorder.stop();
    //button.disabled = true;
    //button.previousElementSibling.disabled = false;
    __log('Stopped recording.');

    // create WAV download link using audio data blob
    createDownloadLink();
    recorder.clear();
}

function createDownloadLink() {

    recorder && recorder.exportWAV(function(blob) {
        console.log(blob);
        var url = URL.createObjectURL(blob);
        var li = document.createElement('li');
        var au = document.createElement('audio');
        var hf = document.createElement('a');

        au.controls = true;
        au.src = url;
        hf.href = url;
        hf.download = new Date().toISOString() + '.wav';
        hf.innerHTML = hf.download;
        li.appendChild(au);
        li.appendChild(hf);
        recordingslist.appendChild(li);
    });
}

window.onload = function init() {
    try {
        // webkit shim
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
        window.URL = window.URL || window.webkitURL;

        audio_context = new AudioContext;
        __log('Audio context set up.');
        __log('navigator.getUserMedia ' + (navigator.getUserMedia ? 'available.' : 'not present!'));
    } catch (e) {
        alert('No web audio support in this browser!');
    }

    navigator.getUserMedia({audio: true}, startUserMedia, function(e) {
        __log('No live audio input: ' + e);
    });
};
