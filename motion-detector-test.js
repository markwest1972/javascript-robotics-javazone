var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {

  // Three motion detectors (sensors)
  var motionTakeoff = new five.Motion(12);
  var motionFlip = new five.Motion(7);
  var motionLand = new five.Motion(4);

  // LED (actuator)
  var led = new five.Led(13);
  var ledBlinking = false;

  // Handle calibration events for all sensors
  motionTakeoff.on("calibrated", function() {
    console.log("motionTakeoff calibrated: " + getFormattedDate());
  });

  motionFlip.on("calibrated", function() {
    console.log("motionFlip calibrated: " + getFormattedDate());
  });

  motionLand.on("calibrated", function() {
    console.log("motionLand calibrated: " + getFormattedDate());
  });


  // Handle event from "takeoff" motion dectector
  motionTakeoff.on("motionstart", function() {
    console.log("motionTakeoff: "+ getFormattedDate());
    if (ledBlinking) {
      resetBlinkingLed();
      ledBlinking = false;
    }
    led.on();
  });

  // Handle event from "flip" motion dectector
  motionFlip.on("motionstart", function() {
    console.log("motionFlip: "+getFormattedDate());
    resetBlinkingLed();
    led.blink(500);
    ledBlinking = true;
  });

  // Handle event from "land" motion dectector
  motionLand.on("motionstart", function() {
    console.log("motionLand: "+getFormattedDate());
    resetBlinkingLed();
    led.off();
  });

  // Ensure that blinking Led is stopped before switching it on or off
  function resetBlinkingLed(){
    if (ledBlinking) {
      led.stop();
      ledBlinking = false;
    }
  }

  // Get pretty date stamp
  function getFormattedDate() {
    var date = new Date();
    var str = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +  date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    return str;
  }

});
