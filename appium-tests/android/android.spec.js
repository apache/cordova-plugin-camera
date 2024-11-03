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

// these tests are meant to be executed by Cordova ParaMedic Appium runner
// you can find it here: https://github.com/apache/cordova-paramedic/
// it is not necessary to do a full CI setup to run these tests
// Run:
//      node cordova-paramedic/main.js --platform android --plugin cordova-plugin-camera --skipMainTests --target <emulator name>
// Please note only Android 5.1 and 4.4 are supported at this point.

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
var CONTEXT_NATIVE_APP = 'NATIVE_APP';

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
    // determine if Appium session is created successfully
    var appiumSessionStarted = false;
    // determine if camera is present on the device/emulator
    var cameraAvailable = false;
    // determine if emulator is within a range of acceptable resolutions able to run these tests
    var isResolutionBad = true;
    // a path to the image we add to the gallery before test run
    var fillerImagePath;
    var isAndroid7 = getIsAndroid7();

    function getIsAndroid7() {
        if (global.USE_SAUCE) {
            return global.SAUCE_CAPS && (parseFloat(global.SAUCE_CAPS.platformVersion) >= 7);
        } else {
            // this is most likely null, meaning we cannot determine if it is Android 7 or not
            // paramedic needs to be modified to receive and pass the platform version when testing locally
            return global.PLATFORM_VERSION && (parseFloat(global.PLATFORM_VERSION) >= 7);
        }
    }

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

    // combinines specified options in all possible variations
    // you can add more options to test more scenarios
    function generateOptions() {
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
        // assign default values
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
                // selecting a picture from gallery
                if (options.hasOwnProperty('sourceType') &&
                        (options.sourceType === cameraConstants.PictureSourceType.PHOTOLIBRARY ||
                        options.sourceType === cameraConstants.PictureSourceType.SAVEDPHOTOALBUM)) {
                    var tapTile = new wd.TouchAction();
                    var swipeRight = new wd.TouchAction();
                    tapTile
                        .tap({
                            x: Math.round(screenWidth / 4),
                            y: Math.round(screenHeight / 4)
                        });
                    swipeRight
                        .press({x: 10, y: Math.round(screenHeight / 4)})
                        .wait(300)
                        .moveTo({x: Math.round(screenWidth - (screenWidth / 8)), y: 0})
                        .wait(1500)
                        .release()
                        .wait(1000);
                    if (options.allowEdit) {
                        return driver
                            // always wait before performing touchAction
                            .sleep(7000)
                            .performTouchAction(tapTile);
                    }
                    return driver
                        .waitForElementByAndroidUIAutomator('new UiSelector().text("Gallery");', 20000)
                        .fail(function () {
                            // If the Gallery button is not present, swipe right to reveal the Gallery button!
                            return driver
                                .performTouchAction(swipeRight)
                                .waitForElementByAndroidUIAutomator('new UiSelector().text("Gallery");', 20000)
                        })
                        .click()
                        // always wait before performing touchAction
                        .sleep(7000)
                        .performTouchAction(tapTile);
                }
                // taking a picture from camera
                return driver
                    .waitForElementByAndroidUIAutomator('new UiSelector().resourceIdMatches(".*shutter.*")', MINUTE / 2)
                    .click()
                    .waitForElementByAndroidUIAutomator('new UiSelector().resourceIdMatches(".*done.*")', MINUTE / 2)
                    .click()
                    .then(function () {
                        if (isAndroid7 && options.allowEdit) {
                            return driver
                                .elementByAndroidUIAutomator('new UiSelector().text("Crop picture");', 20000)
                                .click()
                                .fail(function () {
                                    // don't freak out just yet...
                                    return driver;
                                })
                                .elementByAndroidUIAutomator('new UiSelector().text("JUST ONCE");', 20000)
                                .click()
                                .fail(function () {
                                    // maybe someone's hit that "ALWAYS" button?
                                    return driver;
                                });
                        }
                        return driver;
                    });
            })
            .then(function () {
                if (skipUiInteractions) {
                    return;
                }
                if (options.allowEdit) {
                    var saveText = isAndroid7 ? 'SAVE' : 'Save';
                    return driver
                        .waitForElementByAndroidUIAutomator('new UiSelector().text("' + saveText + '")', MINUTE)
                        .click();
                }
            })
            .fail(function (failure) {
                throw failure;
            });
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
            .executeAsync(cameraHelper.checkPicture, [getCurrentPromiseId(), options, isAndroid7])
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

    // deletes the latest image from the gallery
    function deleteImage() {
        var holdTile = new wd.TouchAction();
        holdTile
            .press({x: Math.round(screenWidth / 4), y: Math.round(screenHeight / 5)})
            .wait(1000)
            .release();
        return driver
            // always wait before performing touchAction
            .sleep(7000)
            .performTouchAction(holdTile)
            .elementByAndroidUIAutomator('new UiSelector().text("Delete")')
            .then(function (element) {
                return element
                    .click()
                    .elementByAndroidUIAutomator('new UiSelector().text("OK")')
                    .click();
            }, function () {
                // couldn't find Delete menu item. Possibly there is no image.
                return driver;
            });
    }

    function getDriver() {
        driver = wdHelper.getDriver('Android');
        return driver.getWebviewContext()
            .then(function(context) {
                webviewContext = context;
                return driver.context(webviewContext);
            })
            .waitForDeviceReady()
            .injectLibraries()
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
                    .then(function () { return getPicture(options, true); })
                    .context(CONTEXT_NATIVE_APP)
                    // case insensitive select, will be handy with Android 7 support
                    .elementByXPath('//android.widget.Button[translate(@text, "alow", "ALOW")="ALLOW"]')
                    .click()
                    .fail(function noAlert() { })
                    .deviceKeyEvent(BACK_BUTTON)
                    .sleep(2000)
                    .elementById('action_bar_title')
                    .then(function () {
                        // success means we're still in native app
                        return driver
                            .deviceKeyEvent(BACK_BUTTON);
                        }, function () {
                            // error means we're already in webview
                            return driver;
                        });
            })
            .then(function () {
                // doing it inside a function because otherwise 
                // it would not hook up to the webviewContext var change
                // in the first methods of this chain
                return driver.context(webviewContext);
            })
            .deleteFillerImage(fillerImagePath)
            .then(function () {
                fillerImagePath = null;
            })
            .addFillerImage()
            .then(function (result) {
                if (result && result.indexOf('ERROR:') === 0) {
                    throw new Error(result);
                } else {
                    fillerImagePath = result;
                }
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
            .fail(gracefullyFail);
    }

    // produces a generic spec function which
    // takes a picture with specified options
    // and then verifies it
    function generateSpec(options) {
        return function () {
            return driver
                .then(function () {
                    return getPicture(options);
                })
                .then(function () {
                    return checkPicture(true, options);
                });
        };
    }

    function checkSession(done, skipResolutionCheck) {
        if (!appiumSessionStarted) {
            fail('Failed to start a session ' + (lastFailureReason ? lastFailureReason : ''));
            done();
        }
        if (!skipResolutionCheck && isResolutionBad) {
            fail('The resolution of this target device is not within the appropriate range of width: blah-blah and height: bleh-bleh. The target\'s current resolution is: ' + isResolutionBad);
        }
    }

    function checkCamera(options, pending) {
        if (!cameraAvailable) {
            pending('Skipping because this test requires a functioning camera on the Android device/emulator, and this test suite\'s functional camera test failed on your target environment.');
        } else if (isAndroid7 && options.allowEdit) {
            // TODO: Check if it is fixed some day
            pending('Skipping because can\'t test with allowEdit=true on Android 7: getting unexpected "Camera cancelled" message.');
        } else if (isAndroid7 && (options.sourceType !== cameraConstants.PictureSourceType.CAMERA)) {
            pending('Skipping because can\'t click on the gallery tile on Android 7.');
        }
    }

    afterAll(function (done) {
        checkSession(done);
        driver
            .quit()
            .done(done);
    }, MINUTE);

    it('camera.ui.util configuring driver and starting a session', function (done) {
        // retry up to 3 times
        getDriver()
            .fail(function () {
                return getDriver()
                    .fail(function () {
                        return getDriver()
                            .fail(fail);
                    });
            })
            .then(function () {
                appiumSessionStarted = true;
            })
            .done(done);
    }, 30 * MINUTE);

    it('camera.ui.util determine screen dimensions', function (done) {
        checkSession(done, /*skipResolutionCheck?*/ true); // skip the resolution check here since we are about to find out in this spec!
        driver
            .context(CONTEXT_NATIVE_APP)
            .getWindowSize()
            .then(function (size) {
                screenWidth = Number(size.width);
                screenHeight = Number(size.height);
                isResolutionBad = false;
                /*
                TODO: what are acceptable resolution values?
                need to check what the emulators used in CI return.
                and also what local device definitions work and dont
                */
            })
            .done(done);
    }, MINUTE);

    it('camera.ui.util determine camera availability', function (done) {
        checkSession(done);
        var opts = {
            sourceType: cameraConstants.PictureSourceType.CAMERA,
            saveToPhotoAlbum: false
        };

        return driver
            .then(function () {
                return getPicture(opts);
            })
            .then(function () {
                cameraAvailable = true;
            }, function () {
                return recreateSession();
            })
            .done(done);
    }, 5 * MINUTE);

    describe('Specs.', function () {
        // getPicture() with saveToPhotoLibrary = true
        it('camera.ui.spec.1 Saving a picture to the photo library', function (done) {
            var opts = {
                quality: 50,
                allowEdit: false,
                sourceType: cameraConstants.PictureSourceType.CAMERA,
                saveToPhotoAlbum: true
            };
            checkSession(done);
            checkCamera(opts, pending);

            var spec = generateSpec(opts);
            tryRunSpec(spec)
                .then(function () {
                    isTestPictureSaved = true;
                })
                .done(done);
        }, 10 * MINUTE);

        // getPicture() with mediaType: VIDEO, sourceType: PHOTOLIBRARY
        it('camera.ui.spec.2 Selecting only videos', function (done) {
            checkSession(done);
            var spec = function () {
                var options = { sourceType: cameraConstants.PictureSourceType.PHOTOLIBRARY,
                                mediaType: cameraConstants.MediaType.VIDEO };
                return driver
                    .then(function () {
                        return getPicture(options, true);
                    })
                    .context(CONTEXT_NATIVE_APP)
                    .then(function () {
                        // try to find "Gallery" menu item
                        // if there's none, the gallery should be already opened
                        return driver
                            .waitForElementByAndroidUIAutomator('new UiSelector().text("Gallery")', 20000)
                            .then(function (element) {
                                return element.click();
                            }, function () {
                                return driver;
                            });
                    })
                    .then(function () {
                        // if the gallery is opened on the videos page,
                        // there should be a "Choose video" or "Select video" caption
                        var videoSelector = isAndroid7 ? 'new UiSelector().text("Select video")' : 'new UiSelector().text("Choose video")';
                        return driver
                            .elementByAndroidUIAutomator(videoSelector)
                            .fail(function () {
                                throw 'Couldn\'t find a "Choose/select video" element.';
                            });
                    })
                    .deviceKeyEvent(BACK_BUTTON)
                    .elementByAndroidUIAutomator('new UiSelector().text("Gallery")')
                    .deviceKeyEvent(BACK_BUTTON)
                    .finally(function () {
                        return driver
                            .elementById('action_bar_title')
                            .then(function () {
                                // success means we're still in native app
                                return driver
                                    .deviceKeyEvent(BACK_BUTTON)
                                    // give native app some time to close
                                    .sleep(2000)
                                    // try again! because every ~30th build
                                    // on Sauce Labs this backbutton doesn't work
                                    .elementById('action_bar_title')
                                    .then(function () {
                                        // success means we're still in native app
                                        return driver
                                            .deviceKeyEvent(BACK_BUTTON);
                                        }, function () {
                                            // error means we're already in webview
                                            return driver;
                                        });
                            }, function () {
                                // error means we're already in webview
                                return driver;
                            });
                    });
            };
            tryRunSpec(spec).done(done);
        }, 10 * MINUTE);

        // getPicture(), then dismiss
        // wait for the error callback to be called
        it('camera.ui.spec.3 Dismissing the camera', function (done) {
            var options = {
                quality: 50,
                allowEdit: true,
                sourceType: cameraConstants.PictureSourceType.CAMERA,
                destinationType: cameraConstants.DestinationType.FILE_URI
            };
            checkSession(done);
            checkCamera(options, pending);
            var spec = function () {
                return driver
                    .then(function () {
                        return getPicture(options, true);
                    })
                    .context(CONTEXT_NATIVE_APP)
                    .waitForElementByAndroidUIAutomator('new UiSelector().resourceIdMatches(".*cancel.*")', MINUTE / 2)
                    .click()
                    .then(function () {
                        return checkPicture(false);
                    });
            };

            tryRunSpec(spec).done(done);
        }, 10 * MINUTE);

        // getPicture(), then take picture but dismiss the edit
        // wait for the error callback to be called
        it('camera.ui.spec.4 Dismissing the edit', function (done) {
            var options = {
                quality: 50,
                allowEdit: true,
                sourceType: cameraConstants.PictureSourceType.CAMERA,
                destinationType: cameraConstants.DestinationType.FILE_URI
            };
            checkSession(done);
            checkCamera(options, pending);
            var spec = function () {
                return driver
                    .then(function () {
                        return getPicture(options, true);
                    })
                    .waitForElementByAndroidUIAutomator('new UiSelector().resourceIdMatches(".*shutter.*")', MINUTE / 2)
                    .click()
                    .waitForElementByAndroidUIAutomator('new UiSelector().resourceIdMatches(".*done.*")', MINUTE / 2)
                    .click()
                    .then(function () {
                        if (isAndroid7 && options.allowEdit) {
                            return driver
                                .waitForElementByAndroidUIAutomator('new UiSelector().text("Crop picture");', 20000)
                                .click()
                                .waitForElementByAndroidUIAutomator('new UiSelector().text("JUST ONCE");', 20000)
                                .click()
                                .deviceKeyEvent(BACK_BUTTON);
                        }
                        return driver
                            .waitForElementByAndroidUIAutomator('new UiSelector().resourceIdMatches(".*discard.*")', MINUTE / 2)
                            .click();
                    })
                    .then(function () {
                        return checkPicture(false);
                    });
            };

            tryRunSpec(spec).done(done);
        }, 10 * MINUTE);

        it('camera.ui.spec.5 Verifying target image size, sourceType=CAMERA', function (done) {
            var opts = {
                quality: 50,
                allowEdit: false,
                sourceType: cameraConstants.PictureSourceType.CAMERA,
                saveToPhotoAlbum: false,
                targetWidth: 210,
                targetHeight: 210
            };
            checkSession(done);
            checkCamera(opts, pending);
            var spec = generateSpec(opts);

            tryRunSpec(spec).done(done);
        }, 10 * MINUTE);

        it('camera.ui.spec.6 Verifying target image size, sourceType=PHOTOLIBRARY', function (done) {
            var opts = {
                quality: 50,
                allowEdit: false,
                sourceType: cameraConstants.PictureSourceType.PHOTOLIBRARY,
                saveToPhotoAlbum: false,
                targetWidth: 210,
                targetHeight: 210
            };
            checkSession(done);
            checkCamera(opts, pending);
            var spec = generateSpec(opts);

            tryRunSpec(spec).done(done);
        }, 10 * MINUTE);

        it('camera.ui.spec.7 Verifying target image size, sourceType=CAMERA, DestinationType=NATIVE_URI', function (done) {
            var opts = {
                quality: 50,
                allowEdit: true,
                sourceType: cameraConstants.PictureSourceType.CAMERA,
                destinationType: cameraConstants.DestinationType.NATIVE_URI,
                saveToPhotoAlbum: false,
                targetWidth: 210,
                targetHeight: 210
            };
            checkSession(done);
            checkCamera(opts, pending);
            var spec = generateSpec(opts);

            tryRunSpec(spec).done(done);
        }, 10 * MINUTE);

        it('camera.ui.spec.8 Verifying target image size, sourceType=PHOTOLIBRARY, DestinationType=NATIVE_URI', function (done) {
            var opts = {
                quality: 50,
                allowEdit: false,
                sourceType: cameraConstants.PictureSourceType.PHOTOLIBRARY,
                destinationType: cameraConstants.DestinationType.NATIVE_URI,
                saveToPhotoAlbum: false,
                targetWidth: 210,
                targetHeight: 210
            };
            checkSession(done);
            checkCamera(opts, pending);

            var spec = generateSpec(opts);
            tryRunSpec(spec).done(done);
        }, 10 * MINUTE);

        it('camera.ui.spec.9 Verifying target image size, sourceType=CAMERA, DestinationType=NATIVE_URI, quality=100', function (done) {
            var opts = {
                quality: 50,
                allowEdit: true,
                sourceType: cameraConstants.PictureSourceType.CAMERA,
                destinationType: cameraConstants.DestinationType.NATIVE_URI,
                saveToPhotoAlbum: false,
                targetWidth: 305,
                targetHeight: 305
            };
            checkSession(done);
            checkCamera(opts, pending);
            var spec = generateSpec(opts);

            tryRunSpec(spec).done(done);
        }, 10 * MINUTE);

        it('camera.ui.spec.10 Verifying target image size, sourceType=PHOTOLIBRARY, DestinationType=NATIVE_URI, quality=100', function (done) {
            var opts = {
                quality: 100,
                allowEdit: true,
                sourceType: cameraConstants.PictureSourceType.PHOTOLIBRARY,
                destinationType: cameraConstants.DestinationType.NATIVE_URI,
                saveToPhotoAlbum: false,
                targetWidth: 305,
                targetHeight: 305
            };
            checkSession(done);
            checkCamera(opts, pending);
            var spec = generateSpec(opts);

            tryRunSpec(spec).done(done);
        }, 10 * MINUTE);

        // combine various options for getPicture()
        generateOptions().forEach(function (spec) {
            it('camera.ui.spec.11.' + spec.id + ' Combining options. ' + spec.description, function (done) {
                checkSession(done);
                checkCamera(spec.options, pending);

                var s = generateSpec(spec.options);
                tryRunSpec(s).done(done);
            }, 10 * MINUTE);
        });

        it('camera.ui.util Delete filler picture from device library', function (done) {
            if (isAndroid7 || global.USE_SAUCE) {
                pending();
            }
            driver
                .context(webviewContext)
                .deleteFillerImage(fillerImagePath)
                .done(done);
        }, MINUTE);

        it('camera.ui.util Delete taken picture from device library', function (done) {
            if (isAndroid7 || global.USE_SAUCE) {
                pending();
            }
            checkSession(done);
            if (!isTestPictureSaved) {
                // couldn't save test picture earlier, so nothing to delete here
                done();
                return;
            }
            // delete exactly one latest picture
            // this should be the picture we've taken in the first spec
            driver
                .context(CONTEXT_NATIVE_APP)
                .deviceKeyEvent(BACK_BUTTON)
                .sleep(1000)
                .deviceKeyEvent(BACK_BUTTON)
                .sleep(1000)
                .deviceKeyEvent(BACK_BUTTON)
                .elementById('Apps')
                .click()
                .then(function () {
                    return driver
                        .elementByXPath('//android.widget.Button[@text="OK"]')
                        .click()
                        .fail(function () {
                            // no cling is all right
                            // it is not a brand new emulator, then
                        });
                })
                .elementByAndroidUIAutomator('new UiSelector().text("Gallery")')
                .click()
                .elementByAndroidUIAutomator('new UiSelector().textContains("Pictures")')
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

});

