var keyCodeMap;
var player;
var piano;
var stage;

let beatDuration = 60 / .06; // measure in ms, so bpm / multiplier 

$( document ).ready(function() {
	 
	$.getJSON( "data/test.json", function( data ) {
		keyCodeMap = data["keymap"];
	});
});

// simple example to get started;
MIDI.loadPlugin({
	soundfontUrl: "./include/soundfont/",
    instrument: "acoustic_grand_piano", // or the instrument code 1 (aka the default)
    // instruments: [ "acoustic_grand_piano", "acoustic_guitar_nylon" ], // or multiple instruments
    onsuccess: function() { 
  		// var delay = 0; // play one note every quarter second
		// var note = 50; // the MIDI note
		// var velocity = 127; // how hard the note hits
		MIDI.setVolume(0, 127);
		// MIDI.noteOn(0, note, velocity, delay);
		// MIDI.noteOff(0, note, delay + 0.75);
		player = MIDI.Player;
		// player.BPM = 300;
		// player.loadFile(song, player.start);

		//MIDIPlayerPercentage(player);
	}
});


function keyCodeToNote(kc) {
	var translated = keyCodeMap[kc];
	if (translated == null) {
		translated = kc;
	}
	return translated;
}


var triggeredKeyCodes = [];
var keyCodeRecorder = [];

document.onkeydown = function (e) {
	e = e || window.event;
	
	var note = keyCodeToNote(e.keyCode);
	var alreadyTriggered = false;

    for (var i = 0, kc; kc = triggeredKeyCodes[i]; i++) {
		if (kc == note) {
			alreadyTriggered = true;
		}
	}

	if (!alreadyTriggered) {
		MIDI.noteOn(0, note, 127, 0);
		triggeredKeyCodes.push(note);

		piano.toggleKey(note, true);

		//keyCodeRecorder.push(e.keyCode);
		//console.log(keyCodeRecorder);
	}
};

document.onkeyup = function (e) {
	e = e || window.event;
	//console.log("keyup fired " + e.keyCode);
	var note = keyCodeToNote(e.keyCode);
	MIDI.noteOff(0, note, 0);

	piano.toggleKey(note, false);

	var temp = triggeredKeyCodes.slice();
	triggeredKeyCodes = [];
    for (var i = 0, kc; kc = temp[i]; i++) {
		if (note != kc) {
			triggeredKeyCodes.push(kc);
		}
	}
};


var time;

// Easel.JS
function init() {
	stage = new createjs.Stage("demoCanvas");

	createjs.Ticker.timingMode = createjs.Ticker.RAF; // syncs to display, does not respect framerate value
	//createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED; // synce to display but tries to use framerate
	//createjs.Ticker.timingMode = createjs.Ticker.TIMEOUT; // does not sync to display, just uses a simple timer
	createjs.Ticker.framerate = 60;
	createjs.Ticker.addEventListener("tick", tick);

	if (window.devicePixelRatio) {
		// grab the width and height from canvas
		var height = stage.canvas.getAttribute('height');
		var width = stage.canvas.getAttribute('width');
		// reset the canvas width and height with window.devicePixelRatio applied
		stage.canvas.setAttribute('width', Math.round(width * window.devicePixelRatio));
		stage.canvas.setAttribute('height', Math.round( height * window.devicePixelRatio));
		// force the canvas back to the original size using css
		stage.canvas.style.width = width+"px";
		stage.canvas.style.height = height+"px";
		// set CreateJS to render scaled
		stage.scaleX = stage.scaleY = window.devicePixelRatio;
	}

 	piano = new PianoVisualizer(stage);
	time = document.getElementById("time");
}


function tick(event) {
	let p = (event.time % beatDuration) / beatDuration;

	piano.tick(p);
	
	//var truncated = Math.floor(p * 100) / 100;
	//time.innerHTML = truncated;
	stage.update(event);
}

