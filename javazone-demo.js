// Import dependancies from FileSystem
var Swarm = require('rolling-spider').Swarm;
var five = require('johnny-five');
var temporal = require('temporal');

// Global variables
var ACTIVE = true;
var STEPS = 2;

var rollingSpiderSwarm = new Swarm({
  timeout: 10,
  membership: 'RS_B030598'
});
var board = new five.Board();

// Initalise Rolling Spider Swarm
rollingSpiderSwarm.assemble();
rollingSpiderSwarm.on('assembled', function () {
  ACTIVE = true;
  rollingSpiderSwarm.wheelOff();
  rollingSpiderSwarm.flatTrim();
  log('Swarm ['+rollingSpiderSwarm.targets+'] assembled and ready for flight: ');
});

board.on('ready', function() {

  // Three motion detectors (sensors)
  var motionTakeoff = new five.Motion(12);
  var motionDance = new five.Motion(7);
  var motionLand = new five.Motion(4);

  // LED (actuator)
  var led = new five.Led(13);
  var ledBlinking = false;

  // Handle calibration events for all sensors
  motionTakeoff.on('calibrated', function() {
    log('motionTakeoff calibrated: ');
  });

  motionDance.on('calibrated', function() {
    log('motionDance calibrated: ');
  });

  motionLand.on('calibrated', function() {
    log('motionLand calibrated: ');
  });

  // Handle event from "takeoff" motion dectector
  motionTakeoff.on('motionstart', function() {
    log('motionTakeOff: ');

    resetBlinkingLed();
    led.on();
    temporal.queue([
      {
        delay: 1000,
        task: function () {
          rollingSpiderSwarm.takeOff();
          console.log('takeOff:');
        }
      },
      {
        delay: 2000,
        task: function () {
          rollingSpiderSwarm.up({steps:20});
          console.log('up:');
        }
      },
      {
        delay: 1000,
        task: function () {
          temporal.clear();
        }
      }
    ]);

    log('Taken off....: ');
  });

  // Handle event from "flip" motion dectector
  motionDance.on('motionstart', function() {
    log('motionDance: ');

    resetBlinkingLed();
    led.blink(500);
    ledBlinking = true;

    temporal.queue([
      {
        delay: 1000,
        task: function () {
          log('Start Dancing....: ');
          rollingSpiderSwarm.tiltLeft({steps:20});
        }
      },
      {
        delay: 2000,
        task: function () {
          rollingSpiderSwarm.forward({steps:20});
        }
      },
      {
        delay: 2000,
        task: function () {
          rollingSpiderSwarm.tiltRight({steps:20});
        }
      },{
        delay: 2000,
        task: function () {
          rollingSpiderSwarm.backward({steps:20});
        }
      },
      {
        delay: 1000,
        task: function () {
          rollingSpiderSwarm.hover();
        }
      },
      {
        delay: 2000,
        task: function () {
          rollingSpiderSwarm.leftFlip();
        }
      },
      {
        delay: 5000,
        task: function () {
          log('Finished Dancing....: ');
          temporal.clear();
        }
      }
    ]);
  });

  // Handle event from "land" motion dectector
  motionLand.on('motionstart', function() {
    log('motionLand: ');
    resetBlinkingLed();
    led.off();
    rollingSpiderSwarm.land();
    log('Landed....:');
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
