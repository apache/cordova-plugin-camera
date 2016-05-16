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
var wd = wdHelper.getWD();
var cameraConstants = require('../../www/CameraConstants');
var cameraHelper = require('../helpers/cameraHelper');

var MINUTE = 60 * 1000;
var BACK_BUTTON = 4;
var DEFAULT_SCREEN_WIDTH = 360;
var DEFAULT_SCREEN_HEIGHT = 567;
var DEFAULT_WEBVIEW_CONTEXT = 'WEBVIEW';
var PROMISE_PREFIX = 'appium_camera_promise_';

describe('Camera tests Android.', function () {
    var driver;
    // the name of webview context, it will be changed to match needed context if there are named ones:
    var webviewContext = DEFAULT_WEBVIEW_CONTEXT;
    // this indicates that the device library has the test picture:
    var isTestPictureSaved = false;
    // we need to know the screen width and height to properly click on an image in the gallery:
    var screenWidth = DEFAULT_SCREEN_WIDTH;
    var screenHeight = DEFAULT_SCREEN_HEIGHT;
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
            ];
        var destinationTypes = cameraConstants.DestinationType;
        var encodingTypes = cameraConstants.EncodingType;
        var allowEditOptions = [ true, false ];
        var correctOrientationOptions = [ true, false ];

        return cameraHelper.generateSpecs(sourceTypes, destinationTypes, encodingTypes, allowEditOptions, correctOrientationOptions);
    }

    // invokes Camera.getPicture() with the specified options
    // and goes through all UI interactions unless 'skipUiInteractions' is true
    function getPicture(options, skipUiInteractions) {
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
                // selecting a picture from gallery
                if (options.hasOwnProperty('sourceType') &&
                        (options.sourceType === cameraConstants.PictureSourceType.PHOTOLIBRARY ||
                        options.sourceType === cameraConstants.PictureSourceType.SAVEDPHOTOALBUM)) {
                    var tapTile = new wd.TouchAction();
                    var swipeRight = new wd.TouchAction();
                    tapTile
                        .tap({
                            x: Math.round(screenWidth / 4),
                            y: Math.round(screenHeight / 5)
                        });
                    swipeRight
                        .press({x: 10, y: 100})
                        .wait(300)
                        .moveTo({x: Math.round(screenWidth / 2), y: 0})
                        .release()
                        .wait(1000);
                    if (options.allowEdit) {
                        return driver
                            // always wait before performing touchAction
                            .sleep(7000)
                            .performTouchAction(tapTile);
                    }
                    return driver
                        .elementByXPath('//android.widget.TextView[@text="Gallery"]')
                        .fail(function () {
                            return driver
                                .performTouchAction(swipeRight)
                                .elementByXPath('//android.widget.TextView[@text="Gallery"]');
                        })
                        .click()
                        // always wait before performing touchAction
                        .sleep(7000)
                        .performTouchAction(tapTile);
                }
                // taking a picture from camera
                return driver
                    .waitForElementByXPath('//android.widget.ImageView[contains(@resource-id,\'shutter\')]', MINUTE)
                    .click()
                    .waitForElementByXPath('//android.widget.ImageView[contains(@resource-id,\'done\')]', MINUTE)
                    .click();
            })
            .then(function () {
                if (skipUiInteractions) {
                    return;
                }
                if (options.allowEdit) {
                    return driver
                        .waitForElementByXPath('//*[contains(@resource-id,\'save\')]', MINUTE)
                        .click();
                }
            })
            .fail(function (failure) {
                console.log(failure);
                throw failure;
            });
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
                    if (result.length === 0) {
                        throw 'The result is an empty string.';
                    }
                    if (result.indexOf('ERROR') >= 0) {
                        throw result;
                    }
                } else {
                    if (result.indexOf('ERROR') === -1) {
                        throw 'Unexpected success callback with result: ' + result;
                    }
                }
            });
    }

    // deletes the latest image from the gallery
    function deleteImage() {
        var holdTile = new wd.TouchAction();
        holdTile.press({x: Math.round(screenWidth / 4), y: Math.round(screenHeight / 5)}).wait(1000).release();
        return driver
            // always wait before performing touchAction
            .sleep(7000)
            .performTouchAction(holdTile)
            .elementByXPath('//android.widget.TextView[@text="Delete"]')
            .then(function (element) {
                return element
                    .click()
                    .elementByXPath('//android.widget.Button[@text="OK"]')
                    .click();
            }, function () {
                // couldn't find Delete menu item. Possibly there is no image.
                return driver;
            });
    }

    function getDriver() {
        driver = wdHelper.getDriver('Android');
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

    function recreateSession() {
        return driver
            .quit()
            .finally(function () {
                return getDriver();
            });
    }

    function tryRunSpec(spec) {
        return driver
            .then(spec)
            .fail(function () {
                return recreateSession()
                    .then(spec)
                    .fail(function() {
                        return recreateSession()
                            .then(spec);
                    });
            })
            .fail(saveScreenshotAndFail);
    }

    function runCombinedSpec(s) {
        var spec = function () {
            return driver
                .then(function () {
                    return getPicture(s.options);
                })
                .then(function () {
                    return checkPicture(true);
                });
        };
        return tryRunSpec(spec);
    }

    it('camera.ui.util configuring driver and starting a session', function (done) {
        getDriver()
            .fail(fail)
            .done(done);
    }, 5 * MINUTE);

    it('camera.ui.util determine screen dimensions', function (done) {
        return driver
            .context(webviewContext)
            .execute(function () {
                return {
                    'width': window.innerWidth,
                    'height': window.innerHeight
                };
            }, [])
            .then(function (size) {
                screenWidth = Number(size.width);
                screenHeight = Number(size.height);
            })
            .done(done);
    }, MINUTE);

    describe('Specs.', function () {
        // getPicture() with saveToPhotoLibrary = true
        it('camera.ui.spec.1 Saving a picture to the photo library', function (done) {
            var spec = function() {
                var options = {
                    quality: 50,
                    allowEdit: false,
                    sourceType: cameraConstants.PictureSourceType.CAMERA,
                    saveToPhotoAlbum: true
                };
                return driver
                    .then(function () {
                        return getPicture(options);
                    })
                    .then(function () {
                        isTestPictureSaved = true;
                        return checkPicture(true);
                    });
            };

            return tryRunSpec(spec)
                .done(done);
        }, 10 * MINUTE);

        // getPicture() with mediaType: VIDEO, sourceType: PHOTOLIBRARY
        it('camera.ui.spec.2 Selecting only videos', function (done) {
            var spec = function () {
                var options = { sourceType: cameraConstants.PictureSourceType.PHOTOLIBRARY,
                                mediaType: cameraConstants.MediaType.VIDEO };
                return driver
                    .then(function () {
                        return getPicture(options, true);
                    })
                    .context('NATIVE_APP')
                    .then(function () {
                        // try to find "Gallery" menu item
                        // if there's none, the gallery should be already opened
                        return driver
                            .elementByXPath('//android.widget.TextView[@text="Gallery"]')
                            .then(function (element) {
                                return element.click();
                            }, function () {
                                return driver;
                            });
                    })
                    .then(function () {
                        // if the gallery is opened on the videos page,
                        // there should be a "Choose video" caption
                        return driver
                            .elementByXPath('//*[@text="Choose video"]')
                            .fail(function () {
                                throw 'Couldn\'t find "Choose video" element.';
                            });
                    })
                    .deviceKeyEvent(BACK_BUTTON)
                    .elementByXPath('//android.widget.TextView[@text="Gallery"]')
                    .deviceKeyEvent(BACK_BUTTON)
                    .finally(function () {
                        return driver
                            .elementById('action_bar_title')
                            .then(function () {
                                // success means we're still in native app
                                return driver
                                    .deviceKeyEvent(BACK_BUTTON);
                            }, function () {
                                // error means we're already in webview
                                return driver;
                            });
                    });
            };
            return tryRunSpec(spec)
                .done(done);
        }, 10 * MINUTE);

        // getPicture(), then dismiss
        // wait for the error callback to be called
        it('camera.ui.spec.3 Dismissing the camera', function (done) {
            var spec = function () {
                var options = { quality: 50,
                                allowEdit: true,
                                sourceType: cameraConstants.PictureSourceType.CAMERA,
                                destinationType: cameraConstants.DestinationType.FILE_URI };
                return driver
                    .then(function () {
                        return getPicture(options, true);
                    })
                    .context("NATIVE_APP")
                    .waitForElementByXPath('//android.widget.ImageView[contains(@resource-id,\'cancel\')]', MINUTE / 2)
                    .click()
                    .then(function () {
                        return checkPicture(false);
                    });
            };

            return tryRunSpec(spec)
                .done(done);
        }, 10 * MINUTE);

        // getPicture(), then take picture but dismiss the edit
        // wait for the error callback to be called
        it('camera.ui.spec.4 Dismissing the edit', function (done) {
            var spec = function () {
                var options = { quality: 50,
                                allowEdit: true,
                                sourceType: cameraConstants.PictureSourceType.CAMERA,
                                destinationType: cameraConstants.DestinationType.FILE_URI };
                return driver
                    .then(function () {
                        return getPicture(options, true);
                    })
                    .context('NATIVE_APP')
                    .waitForElementByXPath('//android.widget.ImageView[contains(@resource-id,\'shutter\')]', MINUTE / 2)
                    .click()
                    .waitForElementByXPath('//android.widget.ImageView[contains(@resource-id,\'done\')]', MINUTE / 2)
                    .click()
                    .waitForElementByXPath('//*[contains(@resource-id,\'discard\')]', MINUTE / 2)
                    .click()
                    .then(function () {
                        return checkPicture(false);
                    });
            };

            return tryRunSpec(spec)
                .done(done);
        }, 10 * MINUTE);

        // combine various options for getPicture()
        generateSpecs().forEach(function (spec) {
            it('camera.ui.spec.5.' + spec.id + ' Combining options. ' + spec.description, function (done) {
                runCombinedSpec(spec)
                    .done(done);
            }, 10 * MINUTE);
        });

        it('camera.ui.util Delete test image from device library', function (done) {
            if (!isTestPictureSaved) {
                // couldn't save test picture earlier, so nothing to delete here
                done();
                return;
            }
            // delete exactly one latest picture
            // this should be the picture we've taken in the first spec
            return driver
                .context('NATIVE_APP')
                .deviceKeyEvent(BACK_BUTTON)
                .sleep(1000)
                .deviceKeyEvent(BACK_BUTTON)
                .sleep(1000)
                .deviceKeyEvent(BACK_BUTTON)
                .elementById('Apps')
                .click()
                .elementByXPath('//android.widget.TextView[@text="Gallery"]')
                .click()
                .elementByXPath('//android.widget.TextView[contains(@text,"Pictures")]')
                .click()
                .then(deleteImage)
                .deviceKeyEvent(BACK_BUTTON)
                .sleep(1000)
                .deviceKeyEvent(BACK_BUTTON)
                .sleep(1000)
                .deviceKeyEvent(BACK_BUTTON)
                .fail(fail)
                .finally(done);
        }, 3 * MINUTE);
    });

    it('camera.ui.util Destroy the session', function (done) {
        driver
            .quit()
            .done(done);
    }, 5 * MINUTE);
});
