/*jshint node: true, jasmine: true */

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
    // going to set this to false if session is created successfully
    var failedToStart = true;

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
    function generateOptions() {
        var sourceTypes = cameraConstants.PictureSourceType;
        var destinationTypes = cameraConstants.DestinationType;
        var encodingTypes = cameraConstants.EncodingType;
        var allowEditOptions = [ true, false ];
        var correctOrientationOptions = [ true, false ];

        return cameraHelper.generateSpecs(sourceTypes, destinationTypes, encodingTypes, allowEditOptions, correctOrientationOptions);
    }

    function usePicture() {
        return driver
            .elementByXPath('//*[@label="Use"]')
            .click()
            .fail(function () {
                // For some reason "Choose" element is not clickable by standard Appium methods
                return wdHelper.tapElementByXPath('//UIAButton[@label="Choose"]', driver);
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
                        .elementByXPath('//*[@label="Cancel"]')
                        .elementByXPath('//*[@label="Cancel"]')
                        .click();
                }
                return driver
                    .waitForElementByXPath('//*[@label="Take Picture"]', MINUTE / 2)
                    .click()
                    .waitForElementByXPath('//*[@label="Use Photo"]', MINUTE / 2)
                    .click();
            })
            .fail(fail);
    }

    // checks if the picture was successfully taken
    // if shouldLoad is falsy, ensures that the error callback was called
    function checkPicture(shouldLoad, options) {
        if (!options) {
            options = {};
        }
        return driver
            .context(webviewContext)
            .setAsyncScriptTimeout(MINUTE / 2)
            .executeAsync(cameraHelper.checkPicture, [getCurrentPromiseId(), options])
            .then(function (result) {
                if (shouldLoad) {
                    if (result !== 'OK') {
                        fail(result);
                    }
                } else if (result.indexOf('ERROR') === -1) {
                    throw 'Unexpected success callback with result: ' + result;
                }
            });
    }

    // takes a picture with the specified options
    // and then verifies it
    function runSpec(options) {
        return driver
            .then(function () {
                return getPicture(options);
            })
            .then(function () {
                return checkPicture(true, options);
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

    function checkSession(done) {
        if (failedToStart) {
            fail('Failed to start a session');
            done();
        }
    }

    it('camera.ui.util configure driver and start a session', function (done) {
        getDriver()
            .then(function () {
                failedToStart = false;
            }, fail)
            .done(done);
    }, 5 * MINUTE);

    describe('Specs.', function () {
        // getPicture() with mediaType: VIDEO, sourceType: PHOTOLIBRARY
        it('camera.ui.spec.1 Selecting only videos', function (done) {
            checkSession(done);
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
            checkSession(done);
            if (!isDevice) {
                pending('Camera is not available on iOS simulator');
            }
            var options = { sourceType: cameraConstants.PictureSourceType.CAMERA,
                            saveToPhotoAlbum: false };
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

        it('camera.ui.spec.3 Verifying target image size, sourceType=CAMERA', function (done) {
            checkSession(done);
            if (!isDevice) {
                pending('Camera is not available on iOS simulator');
            }
            var options = {
                quality: 50,
                allowEdit: false,
                sourceType: cameraConstants.PictureSourceType.CAMERA,
                saveToPhotoAlbum: false,
                targetWidth: 210,
                targetHeight: 210
            };

            runSpec(options).done(done);
        }, 3 * MINUTE);

        it('camera.ui.spec.4 Verifying target image size, sourceType=SAVEDPHOTOALBUM', function (done) {
            checkSession(done);
            var options = {
                quality: 50,
                allowEdit: false,
                sourceType: cameraConstants.PictureSourceType.SAVEDPHOTOALBUM,
                saveToPhotoAlbum: false,
                targetWidth: 210,
                targetHeight: 210
            };

            runSpec(options).done(done);
        }, 3 * MINUTE);

        it('camera.ui.spec.5 Verifying target image size, sourceType=PHOTOLIBRARY', function (done) {
            checkSession(done);
            var options = {
                quality: 50,
                allowEdit: false,
                sourceType: cameraConstants.PictureSourceType.PHOTOLIBRARY,
                saveToPhotoAlbum: false,
                targetWidth: 210,
                targetHeight: 210
            };

            runSpec(options).done(done);
        }, 3 * MINUTE);

        it('camera.ui.spec.6 Verifying target image size, sourceType=CAMERA, destinationType=NATIVE_URI', function (done) {
            // remove this line if you don't mind the tests leaving a photo saved on device
            pending('Cannot prevent iOS from saving the picture to photo library');

            checkSession(done);
            if (!isDevice) {
                pending('Camera is not available on iOS simulator');
            }
            var options = {
                quality: 50,
                allowEdit: false,
                sourceType: cameraConstants.PictureSourceType.CAMERA,
                destinationType: cameraConstants.DestinationType.NATIVE_URI,
                saveToPhotoAlbum: false,
                targetWidth: 210,
                targetHeight: 210
            };

            runSpec(options).done(done);
        }, 3 * MINUTE);

        it('camera.ui.spec.7 Verifying target image size, sourceType=SAVEDPHOTOALBUM, destinationType=NATIVE_URI', function (done) {
            checkSession(done);
            var options = {
                quality: 50,
                allowEdit: false,
                sourceType: cameraConstants.PictureSourceType.SAVEDPHOTOALBUM,
                destinationType: cameraConstants.DestinationType.NATIVE_URI,
                saveToPhotoAlbum: false,
                targetWidth: 210,
                targetHeight: 210
            };

            runSpec(options).done(done);
        }, 3 * MINUTE);

        it('camera.ui.spec.8 Verifying target image size, sourceType=PHOTOLIBRARY, destinationType=NATIVE_URI', function (done) {
            checkSession(done);
            var options = {
                quality: 50,
                allowEdit: false,
                sourceType: cameraConstants.PictureSourceType.PHOTOLIBRARY,
                destinationType: cameraConstants.DestinationType.NATIVE_URI,
                saveToPhotoAlbum: false,
                targetWidth: 210,
                targetHeight: 210
            };

            runSpec(options).done(done);
        }, 3 * MINUTE);

        it('camera.ui.spec.9 Verifying target image size, sourceType=CAMERA, destinationType=NATIVE_URI, quality=100', function (done) {
            // remove this line if you don't mind the tests leaving a photo saved on device
            pending('Cannot prevent iOS from saving the picture to photo library');

            checkSession(done);
            if (!isDevice) {
                pending('Camera is not available on iOS simulator');
            }
            var options = {
                quality: 100,
                allowEdit: false,
                sourceType: cameraConstants.PictureSourceType.CAMERA,
                destinationType: cameraConstants.DestinationType.NATIVE_URI,
                saveToPhotoAlbum: false,
                targetWidth: 305,
                targetHeight: 305
            };
            runSpec(options).done(done);
        }, 3 * MINUTE);

        it('camera.ui.spec.10 Verifying target image size, sourceType=SAVEDPHOTOALBUM, destinationType=NATIVE_URI, quality=100', function (done) {
            checkSession(done);
            var options = {
                quality: 100,
                allowEdit: false,
                sourceType: cameraConstants.PictureSourceType.SAVEDPHOTOALBUM,
                destinationType: cameraConstants.DestinationType.NATIVE_URI,
                saveToPhotoAlbum: false,
                targetWidth: 305,
                targetHeight: 305
            };

            runSpec(options).done(done);
        }, 3 * MINUTE);

        it('camera.ui.spec.11 Verifying target image size, sourceType=PHOTOLIBRARY, destinationType=NATIVE_URI, quality=100', function (done) {
            checkSession(done);
            var options = {
                quality: 100,
                allowEdit: false,
                sourceType: cameraConstants.PictureSourceType.PHOTOLIBRARY,
                destinationType: cameraConstants.DestinationType.NATIVE_URI,
                saveToPhotoAlbum: false,
                targetWidth: 305,
                targetHeight: 305
            };

            runSpec(options).done(done);
        }, 3 * MINUTE);

        // combine various options for getPicture()
        generateOptions().forEach(function (spec) {
            it('camera.ui.spec.12.' + spec.id + ' Combining options. ' + spec.description, function (done) {
                checkSession(done);
                if (!isDevice && spec.options.sourceType === cameraConstants.PictureSourceType.CAMERA) {
                    pending('Camera is not available on iOS simulator');
                }

                // remove this check if you don't mind the tests leaving a photo saved on device
                if (spec.options.sourceType === cameraConstants.PictureSourceType.CAMERA &&
                    spec.options.destinationType === cameraConstants.DestinationType.NATIVE_URI) {
                    pending('Skipping: cannot prevent iOS from saving the picture to photo library and cannot delete it. ' +
                        'For more info, see iOS quirks here: https://github.com/apache/cordova-plugin-camera#ios-quirks-1');
                }

                runSpec(spec.options).done(done);
            }, 3 * MINUTE);
        });

    });

    it('camera.ui.util Destroy the session', function (done) {
        checkSession(done);
        driver
            .quit()
            .done(done);
    }, 5 * MINUTE);
});
