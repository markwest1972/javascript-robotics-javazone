'use strict';

var RollingSpider = require('rolling-spider');
var five = require('johnny-five');

var rollingSpider = new RollingSpider();
var board = new five.Board();

// Setup rolling spider
rollingSpider.connect(function () {

  rollingSpider.setup(function () {
    rollingSpider.flatTrim();
    rollingSpider.startPing();
    rollingSpider.flatTrim();

    setTimeout(function () {
      log('['+rollingSpider.name+'] connected and ready for flight: ');
    }, 1000);
  });

});

board.on('ready', function() {

  // Three motion detectors (sensors)
  var motionTakeoff = new five.Motion(12);
  var motionFlip = new five.Motion(7);
  var motionLand = new five.Motion(4);

  // LED (actuator)
  var led = new five.Led(13);
  var ledBlinking = false;

  // Handle calibration events for all sensors
  motionTakeoff.on('calibrated', function() {
    log('Arduino motionTakeoff calibrated: ');
  });

  motionFlip.on('calibrated', function() {
    log('Arduino motionFlip calibrated: ');
  });

  motionLand.on('calibrated', function() {
    log('Arduino motionLand calibrated: ');
  });


  // Handle event from "takeoff" motion dectector
  motionTakeoff.on('motionstart', function() {
    log('motionTakeoff: ');

    resetBlinkingLed();
    led.on();

    setTimeout(function () {
      rollingSpider.flatTrim();
      rollingSpider.takeOff();
      rollingSpider.flatTrim();
      rollingSpider.up({steps: 50});
    }, 1000);

    log('Taken off....: ');
  });

  // Handle event from "flip" motion dectector
  motionFlip.on('motionstart', function() {
    log('motionFlip: ');

    resetBlinkingLed();
    led.blink(500);
    ledBlinking = true;

    setTimeout(function () {
      rollingSpider.leftFlip({ steps: 1 });
    }, 1000);

    log('Flipped....: ');
  });

  // Handle event from "land" motion dectector
  motionLand.on('motionstart', function() {
    log('motionLand: ');

    resetBlinkingLed();
    led.off();

    setTimeout(function () {
      rollingSpider.land();
    }, 1000);

    log('Landed....: ');
  });

  // Ensure that blinking Led is stopped before switching it on or off
  function resetBlinkingLed(){
    if (ledBlinking) {
      led.stop();
      ledBlinking = false;
    }
  }

});

// Get pretty date stamp
function log(message) {
  var date = new Date();
  var timeString = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' +  date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
  console.log(message + timeString)
}
