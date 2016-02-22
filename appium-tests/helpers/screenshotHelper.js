/* jshint node: true */
'use strict';

var path = require('path');
var screenshotPath = global.SCREENSHOT_PATH || path.join(__dirname, '../../appium_screenshots/');

function generateScreenshotName() {
    var date = new Date();

    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var min = date.getMinutes();
    var sec = date.getSeconds();

    month = (month < 10 ? "0" : "") + month;
    day = (day < 10 ? "0" : "") + day;
    hour = (hour < 10 ? "0" : "") + hour;
    min = (min < 10 ? "0" : "") + min;
    sec = (sec < 10 ? "0" : "") + sec;

    return date.getFullYear() + '-' + month + '-' + day + '_' +  hour + '.' + min + '.' + sec + '.png';
}

module.exports.saveScreenshot = function (driver) {
    var oldContext;
    return driver
        .currentContext()
        .then(function (cc) {
            oldContext = cc;
        })
        .context('NATIVE_APP')
        .saveScreenshot(screenshotPath + generateScreenshotName())
        .then(function () {
            return driver.context(oldContext);
        });
};
