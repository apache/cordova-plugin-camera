/*jslint node: true, plusplus: true */
'use strict';

var wd = global.WD || require('wd');
var driver;

module.exports.getDriver = function (platform, callback) {
    var serverConfig = {
        host: 'localhost',
        port: 4723
    },
        driverConfig = {
            browserName: '',
            'appium-version': '1.3',
            platformName: platform,
            platformVersion: global.PLATFORM_VERSION || '',
            deviceName: global.DEVICE_NAME || '',
            app: global.PACKAGE_PATH,
            autoAcceptAlerts: true,
        };

    if (process.env.CHROMEDRIVER_EXECUTABLE) {
        driverConfig.chromedriverExecutable = process.env.CHROMEDRIVER_EXECUTABLE;
    }
    driver = wd.promiseChainRemote(serverConfig);
    module.exports.configureLogging(driver);
    driver.init(driverConfig).setImplicitWaitTimeout(10000)
        .sleep(20000) // wait for the app to load
        .then(callback);

    return driver;
};

module.exports.getWD = function () {
    return wd;
};

module.exports.configureLogging = function (driver) {
    driver.on('status', function (info) {
        console.log(info);
    });
    driver.on('command', function (meth, path, data) {
        console.log(' > ' + meth, path, data || '');
    });
    driver.on('http', function (meth, path, data) {
        console.log(' > ' + meth, path, data || '');
    });
};
