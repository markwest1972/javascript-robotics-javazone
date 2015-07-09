'use strict';

var RollingSpider = require('rolling-spider');
var temporal = require('temporal');
var rollingSpider = new RollingSpider();

// Get pretty date stamp
function getFormattedDate() {
  var date = new Date();
  var str = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +  date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
  return str;
}

console.log("waiting to connect: "+ getFormattedDate());

rollingSpider.connect(function () {

  console.log("connected: "+ getFormattedDate());

  rollingSpider.setup(function () {

    console.log("setup: "+ getFormattedDate());

    rollingSpider.flatTrim();
    rollingSpider.startPing();
    rollingSpider.flatTrim();

    console.log("temporal queue starts in 5 seconds: "+ getFormattedDate());

    temporal.queue([
      {
        delay: 5000,
        task: function () {
          rollingSpider.takeOff();
          rollingSpider.flatTrim();
        }
      },
      /*{
        delay: 3000,
        task: function () {
          rollingSpider.forward();
        }
      },*/
      {
        delay: 5000,
        task: function () {
          rollingSpider.land();
        }
      },
      {
        delay: 5000,
        task: function () {
          temporal.clear();
          process.exit(0);
        }
      }
    ]);
  });
});
