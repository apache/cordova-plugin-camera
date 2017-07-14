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

// these tests are meant to be executed by Cordova Paramedic test runner
// you can find it here: https://github.com/apache/cordova-paramedic/
// it is not necessary to do a full CI setup to run these tests
// just run "node cordova-paramedic/main.js --platform ios --plugin cordova-plugin-camera"

'use strict';

var wdHelper = global.WD_HELPER;
var screenshotHelper = global.SCREENSHOT_HELPER;
var isDevice = global.DEVICE;
var cameraConstants = require('../../www/CameraConstants');
var cameraHelper = require('../helpers/cameraHelper');

var MINUTE = 60 * 1000;
var DEFAULT_WEBVIEW_CONTEXT = 'WEBVIEW_1';
var PROMISE_PREFIX = 'appium_camera_promise_';
var CONTEXT_NATIVE_APP = 'NATIVE_APP';

describe('Camera tests iOS.', function () {
    var driver;
    var webviewContext = DEFAULT_WEBVIEW_CONTEXT;
    // promise count to use in promise ID
    var promiseCount = 0;
    // going to set this to false if session is created successfully
    var failedToStart = true;
    // points out which UI automation to use
    var isXCUI = false;
    // spec counter to restart the session
    var specsRun = 0;

    function getNextPromiseId() {
        promiseCount += 1;
        return getCurrentPromiseId();
    }

    function getCurrentPromiseId() {
        return PROMISE_PREFIX + promiseCount;
    }

    function gracefullyFail(error) {
        fail(error);
        return driver
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

    function usePicture(allowEdit) {
        return driver
            .sleep(10)
            .then(function () {
                if (isXCUI) {
                    return driver.waitForElementByAccessibilityId('Choose', MINUTE / 3).click();
                } else {
                    if (allowEdit) {
                        return wdHelper.tapElementByXPath('//UIAButton[@label="Choose"]', driver);
                    }
                    return driver.elementByXPath('//*[@label="Use"]').click();
                }
            });
    }

    function clickPhoto() {
        if (isXCUI) {
            // iOS >=10
            return driver
                .context(CONTEXT_NATIVE_APP)
                .elementsByXPath('//XCUIElementTypeCell')
                .then(function(photos) {
                    if (photos.length == 0) {
                        return driver
                            .sleep(0) // driver.source is not a function o.O
                            .source()
                            .then(function (src) {
                                console.log(src);
                                gracefullyFail('Couldn\'t find an image to click');
                            });
                    }
                    // intentionally clicking the second photo here
                    // the first one is not clickable for some reason
                    return photos[1].click();
                });
        }
        // iOS <10
        return driver
            .elementByXPath('//UIACollectionCell')
            .click();
    }

    function getPicture(options, cancelCamera, skipUiInteractions) {
        var promiseId = getNextPromiseId();
        if (!options) {
            options = {};
        }
        // assign defaults
        if (!options.hasOwnProperty('allowEdit')) {
            options.allowEdit = true;
        }
        if (!options.hasOwnProperty('destinationType')) {
            options.destinationType = cameraConstants.DestinationType.FILE_URI;
        }
        if (!options.hasOwnProperty('sourceType')) {
            options.destinationType = cameraConstants.PictureSourceType.CAMERA;
        }

        return driver
            .context(webviewContext)
            .execute(cameraHelper.getPicture, [options, promiseId])
            .context(CONTEXT_NATIVE_APP)
            .then(function () {
                if (skipUiInteractions) {
                    return;
                }
                if (options.hasOwnProperty('sourceType') && options.sourceType === cameraConstants.PictureSourceType.PHOTOLIBRARY) {
                    return driver
                        .waitForElementByAccessibilityId('Camera Roll', MINUTE / 2)
                        .click()
                        .then(function () {
                            return clickPhoto();
                        })
                        .then(function () {
                            if (!options.allowEdit) {
                                return driver;
                            }
                            return usePicture(options.allowEdit);
                        });
                }
                if (options.hasOwnProperty('sourceType') && options.sourceType === cameraConstants.PictureSourceType.SAVEDPHOTOALBUM) {
                    return clickPhoto()
                        .then(function () {
                            if (!options.allowEdit) {
                                return driver;
                            }
                            return usePicture(options.allowEdit);
                        });
                }
                if (cancelCamera) {
                    return driver
                        .waitForElementByAccessibilityId('Cancel', MINUTE / 2)
                        .click();
                }
                return driver
                    .waitForElementByAccessibilityId('Take Picture', MINUTE / 2)
                    .click()
                    .waitForElementByAccessibilityId('Use Photo', MINUTE / 2)
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
            .executeAsync(cameraHelper.checkPicture, [getCurrentPromiseId(), options, false])
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
    function runSpec(options, done, pending) {
        if (options.sourceType === cameraConstants.PictureSourceType.CAMERA && !isDevice) {
            pending('Camera is not available on iOS simulator');
        }
        checkSession(done);
        specsRun += 1;
        return driver
            .then(function () {
                return getPicture(options);
            })
            .then(function () {
                return checkPicture(true, options);
            })
            .fail(gracefullyFail);
    }

    function getDriver() {
        failedToStart = true;
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
            })
            .sessionCapabilities()
            .then(function (caps) {
                var platformVersion = parseFloat(caps.platformVersion);
                isXCUI = platformVersion >= 10.0;
            })
            .then(function () {
                var options = {
                    quality: 50,
                    allowEdit: false,
                    sourceType: cameraConstants.PictureSourceType.SAVEDPHOTOALBUM,
                    saveToPhotoAlbum: false,
                    targetWidth: 210,
                    targetHeight: 210
                };
                return driver
                    .then(function () { return getPicture(options, false, true); })
                    .context(CONTEXT_NATIVE_APP)
                    .acceptAlert()
                    .then(function alertDismissed() {
                        // TODO: once we move to only XCUITest-based (which is force on you in either iOS 10+ or Xcode 8+)
                        // UI tests, we will have to:
                        // a) remove use of autoAcceptAlerts appium capability since it no longer functions in XCUITest
                        // b) can remove this entire then() clause, as we do not need to explicitly handle the acceptAlert
                        //    failure callback, since we will be guaranteed to hit the permission dialog on startup.
                    }, function noAlert() {
                        // in case the contacts permission alert never showed up: no problem, don't freak out.
                        // This can happen if:
                        // a) The application-under-test already had photos permissions granted to it
                        // b) Appium's autoAcceptAlerts capability is provided (and functioning)
                    })
                    .elementByAccessibilityId('Cancel', 10000)
                    .click();
            })
            .then(function () {
                failedToStart = false;
            });
    }

    function checkSession(done) {
        if (failedToStart) {
            fail('Failed to start a session');
            done();
        }
    }

    it('camera.ui.util configure driver and start a session', function (done) {
        // retry up to 3 times
        getDriver()
            .fail(function () {
                return getDriver()
                    .fail(function () {
                        return getDriver()
                            .fail(fail);
                    });
            })
            .fail(fail)
            .done(done);
    }, 30 * MINUTE);

    describe('Specs.', function () {
        afterEach(function (done) {
            if (specsRun >= 19) {
                specsRun = 0;
                // we need to restart the session regularly because for some reason
                // when running against iOS 10 simulator on SauceLabs, 
                // Appium cannot handle more than ~20 specs at one session
                // the error would be as follows:
                // "Could not proxy command to remote server. Original error: Error: connect ECONNREFUSED 127.0.0.1:8100"
                checkSession(done);
                return driver
                    .quit()
                    .then(function () {
                        return getDriver()
                            .fail(function () {
                                return getDriver()
                                    .fail(function () {
                                        return getDriver()
                                            .fail(fail);
                                    });
                            });
                    })
                    .done(done);
            } else {
                done();
            }
        }, 30 * MINUTE);

        // getPicture() with mediaType: VIDEO, sourceType: PHOTOLIBRARY
        it('camera.ui.spec.1 Selecting only videos', function (done) {
            checkSession(done);
            specsRun += 1;
            var options = { sourceType: cameraConstants.PictureSourceType.PHOTOLIBRARY,
                            mediaType: cameraConstants.MediaType.VIDEO };
            driver
                // skip ui unteractions
                .then(function () { return getPicture(options, false, true); })
                .waitForElementByXPath('//*[contains(@label,"Videos")]', MINUTE / 2)
                .elementByAccessibilityId('Cancel')
                .click()
                .fail(gracefullyFail)
                .done(done);
        }, 7 * MINUTE);

        // getPicture(), then dismiss
        // wait for the error callback to be called
        it('camera.ui.spec.2 Dismissing the camera', function (done) {
            checkSession(done);
            if (!isDevice) {
                pending('Camera is not available on iOS simulator');
            }
            specsRun += 1;
            var options = { sourceType: cameraConstants.PictureSourceType.CAMERA,
                            saveToPhotoAlbum: false };
            driver
                .then(function () {
                    return getPicture(options, true);
                })
                .then(function () {
                    return checkPicture(false);
                })
                .fail(gracefullyFail)
                .done(done);
        }, 7 * MINUTE);

        it('camera.ui.spec.3 Verifying target image size, sourceType=CAMERA', function (done) {
            var options = {
                quality: 50,
                allowEdit: false,
                sourceType: cameraConstants.PictureSourceType.CAMERA,
                saveToPhotoAlbum: false,
                targetWidth: 210,
                targetHeight: 210
            };

            runSpec(options, done, pending).done(done);
        }, 7 * MINUTE);

        it('camera.ui.spec.4 Verifying target image size, sourceType=SAVEDPHOTOALBUM', function (done) {
            var options = {
                quality: 50,
                allowEdit: false,
                sourceType: cameraConstants.PictureSourceType.SAVEDPHOTOALBUM,
                saveToPhotoAlbum: false,
                targetWidth: 210,
                targetHeight: 210
            };

            runSpec(options, done, pending).done(done);
        }, 7 * MINUTE);

        it('camera.ui.spec.5 Verifying target image size, sourceType=PHOTOLIBRARY', function (done) {
            var options = {
                quality: 50,
                allowEdit: false,
                sourceType: cameraConstants.PictureSourceType.PHOTOLIBRARY,
                saveToPhotoAlbum: false,
                targetWidth: 210,
                targetHeight: 210
            };

            runSpec(options, done, pending).done(done);
        }, 7 * MINUTE);

        it('camera.ui.spec.6 Verifying target image size, sourceType=CAMERA, destinationType=FILE_URL', function (done) {
            // remove this line if you don't mind the tests leaving a photo saved on device
            pending('Cannot prevent iOS from saving the picture to photo library');

            var options = {
                quality: 50,
                allowEdit: false,
                sourceType: cameraConstants.PictureSourceType.CAMERA,
                destinationType: cameraConstants.DestinationType.FILE_URL,
                saveToPhotoAlbum: false,
                targetWidth: 210,
                targetHeight: 210
            };

            runSpec(options, done, pending).done(done);
        }, 7 * MINUTE);

        it('camera.ui.spec.7 Verifying target image size, sourceType=SAVEDPHOTOALBUM, destinationType=FILE_URL', function (done) {
            var options = {
                quality: 50,
                allowEdit: false,
                sourceType: cameraConstants.PictureSourceType.SAVEDPHOTOALBUM,
                destinationType: cameraConstants.DestinationType.FILE_URL,
                saveToPhotoAlbum: false,
                targetWidth: 210,
                targetHeight: 210
            };

            runSpec(options, done, pending).done(done);
        }, 7 * MINUTE);

        it('camera.ui.spec.8 Verifying target image size, sourceType=PHOTOLIBRARY, destinationType=FILE_URL', function (done) {
            var options = {
                quality: 50,
                allowEdit: false,
                sourceType: cameraConstants.PictureSourceType.PHOTOLIBRARY,
                destinationType: cameraConstants.DestinationType.FILE_URL,
                saveToPhotoAlbum: false,
                targetWidth: 210,
                targetHeight: 210
            };

            runSpec(options, done, pending).done(done);
        }, 7 * MINUTE);

        it('camera.ui.spec.9 Verifying target image size, sourceType=CAMERA, destinationType=FILE_URL, quality=100', function (done) {
            // remove this line if you don't mind the tests leaving a photo saved on device
            pending('Cannot prevent iOS from saving the picture to photo library');

            var options = {
                quality: 100,
                allowEdit: false,
                sourceType: cameraConstants.PictureSourceType.CAMERA,
                destinationType: cameraConstants.DestinationType.FILE_URL,
                saveToPhotoAlbum: false,
                targetWidth: 305,
                targetHeight: 305
            };
            runSpec(options, done, pending).done(done);
        }, 7 * MINUTE);

        it('camera.ui.spec.10 Verifying target image size, sourceType=SAVEDPHOTOALBUM, destinationType=FILE_URL, quality=100', function (done) {
            var options = {
                quality: 100,
                allowEdit: false,
                sourceType: cameraConstants.PictureSourceType.SAVEDPHOTOALBUM,
                destinationType: cameraConstants.DestinationType.FILE_URL,
                saveToPhotoAlbum: false,
                targetWidth: 305,
                targetHeight: 305
            };

            runSpec(options, done, pending).done(done);
        }, 7 * MINUTE);

        it('camera.ui.spec.11 Verifying target image size, sourceType=PHOTOLIBRARY, destinationType=FILE_URL, quality=100', function (done) {
            var options = {
                quality: 100,
                allowEdit: false,
                sourceType: cameraConstants.PictureSourceType.PHOTOLIBRARY,
                destinationType: cameraConstants.DestinationType.FILE_URL,
                saveToPhotoAlbum: false,
                targetWidth: 305,
                targetHeight: 305
            };

            runSpec(options, done, pending).done(done);
        }, 7 * MINUTE);

        // combine various options for getPicture()
        generateOptions().forEach(function (spec) {
            it('camera.ui.spec.12.' + spec.id + ' Combining options. ' + spec.description, function (done) {
                // remove this check if you don't mind the tests leaving a photo saved on device
                if (spec.options.sourceType === cameraConstants.PictureSourceType.CAMERA &&
                    spec.options.destinationType === cameraConstants.DestinationType.NATIVE_URI) {
                    pending('Skipping: cannot prevent iOS from saving the picture to photo library and cannot delete it. ' +
                        'For more info, see iOS quirks here: https://github.com/apache/cordova-plugin-camera#ios-quirks-1');
                }

                runSpec(spec.options, done, pending).done(done);
            }, 7 * MINUTE);
        });

    });

    it('camera.ui.util Destroy the session', function (done) {
        checkSession(done);
        driver
            .quit()
            .done(done);
    }, 5 * MINUTE);
});
