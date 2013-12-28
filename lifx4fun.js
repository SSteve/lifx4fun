var lifx = require("../lifxjs/lifx");
//I'm using lifx.js available through http://github.com/magicmonkey/lifx.js
//This program is based on the cli*. examples from that project. It's my first time writing Javascript
//so the clever parts of this program are copied from those and the lame parts are mine.

var util = require("util");

var loggingEnabled = 0;

var bulbCount = 4;
var colorWheelStep = 0x10000 / bulbCount;
var step = 0x40;
var bulbsFound = 0;
var currentHue = 0;
var saturation = 0x8000;
var luminance = 0xFFFF;
var whiteLevel = 0
var timing = 0;
var timer = 0;
var blinkingOdds = 0;

var redHue = 0;
var greenHue = 0x4000;

var myBulbs = []; //Associative array keyed on bulb name. Stores complete state of each bulb

conditionalLog = function(message) {
	if (loggingEnabled)	console.log(message);
}

//Set colors of the bulbs 90 degrees apart on the color wheel then increase the current hue by the step size
setColors = function() {
	for (var i = 0; i < bulbsFound; i++) {
		var newHue = (currentHue + i * colorWheelStep) & 0xFFFF;
		lx.lightsColour(newHue, saturation, luminance, whiteLevel, timing, lx.bulbs[i]);
		conditionalLog("Bulb " + lx.bulbs[i].name + " hue set to 0x" + newHue.toString(16));
	}
	currentHue = (currentHue + step) & 0xFFFF;
	lx.requestStatus(); //request status to update myBulbs array
}

startRedAndGreen = function() {
	for (var i = 0; i < bulbsFound; i++) {
		var currentHue = myBulbs[lx.bulbs[i].name].hue;
		var newHue = (i & 1) ? redHue : greenHue;
		lx.lightsColour(newHue, saturation, luminance, whiteLevel, timing, lx.bulbs[i]);
		conditionalLog("Bulb " + lx.bulbs[i].name + " hue set from 0x" + currentHue.toString(16) + " to 0x" + newHue.toString(16));
	}
}

//Alternate bulbs between red and green at random times
redAndGreen = function() {
	for (var i = 0; i < bulbsFound; i++) {
		if (Math.random() < blinkingOdds) {
			//For some reason, hue isn't always what I set it to last. It's often off by 1 or 2. Until I figure out why, I'll
			// just do this dumb test instead of fixing the problem. If it's closer to red than green, make it green and vice versa.
			var currentHue = myBulbs[lx.bulbs[i].name].hue;
			var newHue = (currentHue < 0x2000 || currentHue > 0x6000) ? greenHue : redHue;
			lx.lightsColour(newHue, saturation, luminance, whiteLevel, timing, lx.bulbs[i]);
			conditionalLog("Bulb " + lx.bulbs[i].name + " hue set from 0x" + currentHue.toString(16) + " to 0x" + newHue.toString(16));
		}
	}
	lx.requestStatus(); //request status to update myBulbs array
}

initBulbs = function() {
	console.log("Initializing bulbs");
	lx.lightsOn();
	setColors();
	timer = setInterval(setColors, 500);
}

var lx = lifx.init();

lx.on("bulb", function(b) {
	console.log("New bulb found: " + b.name);
	
	if (bulbCount == ++bulbsFound) {
		//After all four bulbs have been found, start controlling them
		initBulbs();
	}
});

//Keep a local copy of the bulb state
lx.on("bulbstate", function(b) {
	//conditionalLog("Bulb state: " + util.inspect(b));
	myBulbs[b.bulb.name] = b;
});



//Program starts here

var stdin = process.openStdin();
process.stdin.setRawMode(true)
process.stdin.resume();

stdin.on("data", function (key) {
	//process.stdout.write("Got key " + util.inspect(key) + "\n");

	switch (key[0]) {

		case 0x03: // ctrl-c
			console.log("Closing...");
			if (timer) {
				clearInterval(timer);
			}
			lx.lightsOff();
			lx.close();
			process.stdin.pause();
			//process.exit();
			break;
			
		case 0x31: // 1
			console.log("Slow cycle");
			if (timer) {
				clearInterval(timer);
			}
			step = 0x40;
			saturation = 0x8000;
			timing = 0;
			timer = setInterval(setColors, 500);
			break;

		case 0x32: // 2
			console.log("Fast cycle");
			if (timer) {
				clearInterval(timer);
			}
			step = 0x200;
			saturation = 0x8000;
			timing = 0;
			timer = setInterval(setColors, 200);
			break;

		case 0x33: // 3
			console.log("Blink red and green now and then");
			if (timer) {
				clearInterval(timer);
			}
			saturation = 0xFFFF;
			timing = 0x8000;
			blinkingOdds = 0.1; //blink 10% of the time
			startRedAndGreen()
			timer = setInterval(redAndGreen, 2500);
			break;

		case 0x34: // 4
			console.log("Blink red and green in an annoying fashion");
			if (timer) {
				clearInterval(timer);
			}
			saturation = 0xFFFF;
			timing = 0;
			blinkingOdds = 1.0;
			startRedAndGreen()
			timer = setInterval(redAndGreen, 1000);
			break;

		case 0x6C: // l
			loggingEnabled = 1 - loggingEnabled;
			if (loggingEnabled)
				console.log("Logging enabled");
			else
				console.log("Logging disabled");
			break;

		case 0x72: // r
			//Light bulb roll call: Cambot!
			for (i = 0; i < bulbsFound; i++) {
				console.log(util.inspect(myBulbs[lx.bulbs[i].name]));
			}
			break;

		case 0x73: // s
			//toggle saturation between full and half
			saturation = 0x17FFF - saturation;
			console.log("saturation set to 0x" + saturation.toString(16));
			break;
	}
});
