/* jshint node: true */
/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
*/

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
            'appium-version': '1.5',
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

    return driver.init(driverConfig).setImplicitWaitTimeout(10000)
        .sleep(20000) // wait for the app to load
        .then(callback);
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
