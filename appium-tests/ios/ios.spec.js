/*jshint node: true, jasmine: true */
/* global navigator, Q */
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

// these tests are meant to be executed by Cordova Medic Appium runner
// you can find it here: https://github.com/apache/cordova-medic/
// it is not necessary to do a full CI setup to run these tests
// just run "node cordova-medic/medic/medic.js appium --platform android --plugins cordova-plugin-camera"

'use strict';

var wdHelper = global.WD_HELPER;
var screenshotHelper = global.SCREENSHOT_HELPER;
var wd = wdHelper.getWD();
var isDevice = global.DEVICE;
var cameraConstants = require('../../www/CameraConstants');
var cameraHelper = require('../helpers/cameraHelper');

var MINUTE = 60 * 1000;
var DEFAULT_WEBVIEW_CONTEXT = 'WEBVIEW_1';
var PROMISE_PREFIX = 'appium_camera_promise_';

describe('Camera tests iOS.', function () {
    var driver;
    var webviewContext = DEFAULT_WEBVIEW_CONTEXT;
    // promise count to use in promise ID
    var promiseCount = 0;

    function getNextPromiseId() {
        promiseCount += 1;
        return getCurrentPromiseId();
    }

    function getCurrentPromiseId() {
        return PROMISE_PREFIX + promiseCount;
    }

    function saveScreenshotAndFail(error) {
        fail(error);
        return screenshotHelper
            .saveScreenshot(driver)
            .quit()
            .then(function () {
                return getDriver();
            });
    }

    // generates test specs by combining all the specified options
    // you can add more options to test more scenarios
    function generateSpecs() {
        var sourceTypes = [
                cameraConstants.PictureSourceType.CAMERA,
                cameraConstants.PictureSourceType.PHOTOLIBRARY
            ],
            destinationTypes = cameraConstants.DestinationType,
            encodingTypes = [
                cameraConstants.EncodingType.JPEG,
                cameraConstants.EncodingType.PNG
            ],
            allowEditOptions = [
                true,
                false
            ];

        return cameraHelper.generateSpecs(sourceTypes, destinationTypes, encodingTypes, allowEditOptions);
    }

    function usePicture() {
        return driver
            .elementByXPath('//*[@label="Use"]')
            .click()
            .fail(function () {
                return driver
                    // For some reason "Choose" element is not clickable by standard Appium methods
                    // So getting its position and tapping there using TouchAction
                    .elementByXPath('//UIAButton[@label="Choose"]')
                    .getLocation()
                    .then(function (loc) {
                        var tapChoose = new wd.TouchAction();
                        tapChoose.tap(loc);
                        return driver
                            .performTouchAction(tapChoose);
                    });
            });
    }

    function getPicture(options, cancelCamera, skipUiInteractions) {
        var promiseId = getNextPromiseId();
        if (!options) {
            options = {};
        }

        return driver
            .context(webviewContext)
            .execute(cameraHelper.getPicture, [options, promiseId])
            .context('NATIVE_APP')
            .then(function () {
                if (skipUiInteractions) {
                    return;
                }
                if (options.hasOwnProperty('sourceType') && options.sourceType === cameraConstants.PictureSourceType.PHOTOLIBRARY) {
                    return driver
                        .waitForElementByXPath('//*[@label="Camera Roll"]', MINUTE / 2)
                        .click()
                        .elementByXPath('//UIACollectionCell')
                        .click()
                        .then(function () {
                            if (!options.allowEdit) {
                                return driver;
                            }
                            return usePicture();
                        });
                }
                if (options.hasOwnProperty('sourceType') && options.sourceType === cameraConstants.PictureSourceType.SAVEDPHOTOALBUM) {
                    return driver
                        .waitForElementByXPath('//UIACollectionCell', MINUTE / 2)
                        .click()
                        .then(function () {
                            if (!options.allowEdit) {
                                return driver;
                            }
                            return usePicture();
                        });
                }
                if (cancelCamera) {
                    return driver
                        .waitForElementByXPath('//*[@label="Cancel"]', MINUTE / 2)
                        .click();
                }
                return driver
                    .waitForElementByXPath('//*[@label="Take Picture"]', MINUTE / 2)
                    .click()
                    .elementByXPath('//*[@label="Use Photo"]')
                    .click();
            })
            .fail(fail);
    }

    // checks if the picture was successfully taken
    // if shouldLoad is falsy, ensures that the error callback was called
    function checkPicture(shouldLoad) {
        return driver
            .context(webviewContext)
            .setAsyncScriptTimeout(MINUTE)
            .executeAsync(cameraHelper.checkPicture, [getCurrentPromiseId()])
            .then(function (result) {
                if (shouldLoad) {
                    expect(result.length).toBeGreaterThan(0);
                    if (result.indexOf('ERROR') >= 0) {
                        return fail(result);
                    }
                } else {
                    if (result.indexOf('ERROR') === -1) {
                        return fail('Unexpected success callback with result: ' + result);
                    }
                    expect(result.indexOf('ERROR')).toBe(0);
                }
            });
    }

    function runCombinedSpec(spec) {
        return driver
            .then(function () {
                return getPicture(spec.options);
            })
            .then(function () {
                return checkPicture(true);
            })
            .fail(saveScreenshotAndFail);
    }

    function getDriver() {
        driver = wdHelper.getDriver('iOS');
        return wdHelper.getWebviewContext(driver)
            .then(function(context) {
                webviewContext = context;
                return driver.context(webviewContext);
            })
            .then(function () {
                return wdHelper.waitForDeviceReady(driver);
            })
            .then(function () {
                return wdHelper.injectLibraries(driver);
            });
    }

    it('camera.ui.util configure driver and start a session', function (done) {
        getDriver()
            .fail(fail)
            .finally(done);
    }, 5 * MINUTE);

    describe('Specs.', function () {
        // getPicture() with mediaType: VIDEO, sourceType: PHOTOLIBRARY
        it('camera.ui.spec.1 Selecting only videos', function (done) {
            var options = { sourceType: cameraConstants.PictureSourceType.PHOTOLIBRARY,
                            mediaType: cameraConstants.MediaType.VIDEO };
            driver
                // skip ui unteractions
                .then(function () { return getPicture(options, false, true); })
                .waitForElementByXPath('//*[contains(@label,"Videos")]', MINUTE / 2)
                .elementByXPath('//*[@label="Cancel"]')
                .click()
                .fail(saveScreenshotAndFail)
                .done(done);
        }, 3 * MINUTE);

        // getPicture(), then dismiss
        // wait for the error callback to be called
        it('camera.ui.spec.2 Dismissing the camera', function (done) {
            // camera is not available on the iOS simulator
            if (!isDevice) {
                pending();
            }
            var options = { sourceType: cameraConstants.PictureSourceType.CAMERA };
            driver
                .then(function () {
                    return getPicture(options, true);
                })
                .then(function () {
                    return checkPicture(false);
                })
                .fail(saveScreenshotAndFail)
                .done(done);
        }, 3 * MINUTE);

        // combine various options for getPicture()
        generateSpecs().forEach(function (spec) {
            it('camera.ui.spec.3.' + spec.id + ' Combining options', function (done) {
                // camera is not available on iOS simulator
                if (!isDevice && spec.options.sourceType === cameraConstants.PictureSourceType.CAMERA) {
                    pending();
                }
                runCombinedSpec(spec).done(done);
            }, 3 * MINUTE);
        });

    });

    it('camera.ui.util.4 Destroy the session', function (done) {
        driver
            .quit()
            .done(done);
    }, MINUTE);
});
