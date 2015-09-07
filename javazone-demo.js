// Import dependancies from FileSystem
var Swarm = require('rolling-spider').Swarm;
var five = require('johnny-five');
var temporal = require('temporal');

// Global variables
var ACTIVE = true;
var STEPS = 10;

var rollingSpiderSwarm = new Swarm({
  timeout: 10/*,
  membership: 'RS_B030598,RS_R107118'*/
});
var board = new five.Board();

// Initalise Rolling Spider Swarm
rollingSpiderSwarm.assemble();
rollingSpiderSwarm.on('assembled', function () {
  ACTIVE = true;
  rollingSpiderSwarm.wheelOff();
  rollingSpiderSwarm.flatTrim();
  log('Swarm assembled:');
  this.members.forEach(function (member) {
    log(' * [' + member.name +  '] ready for takeoff : ');
  });

});

board.on('ready', function() {

  // Three motion detectors (sensors)
  var motionTakeoff = new five.Motion(4);
  var motionDance = new five.Motion(5);
  var motionLand = new five.Motion(2);

  // Button (kill switch)
  var killSwitch = new five.Button(8);

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

  killSwitch.on('down', function(){
    rollingSpiderSwarm.emergancy();
    resetBlinkingLed();
    ledBlinking = true;
    led.blink(100);
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
          rollingSpiderSwarm.hover();
          console.log('hover:');
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
        delay: 2000,
        task: function () {
          log('Start Dancing....: ');
          rollingSpiderSwarm.up({steps:STEPS});
        }
      },
      {
        delay: 3000,
        task: function () {
          rollingSpiderSwarm.turnRight({steps:STEPS*4, speed:80});
        }
      },{
        delay: 2500,
        task: function () {
          rollingSpiderSwarm.turnLeft({steps:STEPS*4, speed:80});
        }
      },
      {
        delay: 2000,
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
