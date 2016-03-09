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

var wdHelper = require('../helpers/wdHelper');
var wd = wdHelper.getWD();
var cameraConstants = require('../../www/CameraConstants');
var cameraHelper = require('../helpers/cameraHelper');
var screenshotHelper = require('../helpers/screenshotHelper');

var STARTING_MESSAGE = 'Ready for action!';
var RETRY_COUNT = 3; // how many times to retry taking a picture before failing
var MINUTE = 60 * 1000;
var DEFAULT_SCREEN_WIDTH = 360;
var DEFAULT_SCREEN_HEIGHT = 567;
var DEFAULT_WEBVIEW_CONTEXT = 'WEBVIEW';

describe('Camera tests Android.', function () {
    var driver;
    // the name of webview context, it will be changed to match needed context if there are named ones:
    var webviewContext = DEFAULT_WEBVIEW_CONTEXT;
    // this indicates that the device library has the test picture:
    var isTestPictureSaved = false;
    // this indicates that there was a critical error and we should try to recover:
    var errorFlag = false;
    // this indicates that we couldn't restore Appium session and should fail fast:
    var stopFlag = false;
    // we need to know the screen width and height to properly click on an image in the gallery:
    var screenWidth = DEFAULT_SCREEN_WIDTH;
    var screenHeight = DEFAULT_SCREEN_HEIGHT;

    function win() {
        expect(true).toBe(true);
    }

    function fail(error) {
        screenshotHelper.saveScreenshot(driver);
        if (error && error.message) {
            console.log('An error occured: ' + error.message);
            expect(true).toFailWithMessage(error.message);
            throw error.message;
        }
        if (error) {
            console.log('Failed expectation: ' + error);
            expect(true).toFailWithMessage(error);
            throw error;
        }
        // no message provided :(
        expect(true).toBe(false);
        throw 'An error without description occured';
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

    function getPicture(options, skipUiInteractions, retry) {
        if (!options) {
            options = {};
        }
        if (typeof retry === 'undefined') {
            retry = 1;
        }

        var command = "navigator.camera.getPicture(function (result) { document.getElementById('info').innerHTML = result.slice(0, 100); }, " +
                      "function (err) { document.getElementById('info').innerHTML = 'ERROR: ' + err; }," + JSON.stringify(options) + ");";
        return driver
            .context(webviewContext)
            .execute(command)
            .sleep(7000)
            .context('NATIVE_APP')
            .sleep(5000)
            .then(function () {
                if (skipUiInteractions) {
                    return;
                }
                if (options.hasOwnProperty('sourceType') &&
                        (options.sourceType === cameraConstants.PictureSourceType.PHOTOLIBRARY ||
                        options.sourceType === cameraConstants.PictureSourceType.SAVEDPHOTOALBUM)) {
                    var touchTile = new wd.TouchAction(),
                        swipeRight = new wd.TouchAction();
                    touchTile.press({x: Math.round(screenWidth / 4), y: Math.round(screenHeight / 5)}).release();
                    swipeRight.press({x: 10, y: Math.round(screenHeight * 0.8)})
                        .wait(300)
                        .moveTo({x: Math.round(screenWidth / 2), y: Math.round(screenHeight / 2)})
                        .release();
                    return driver
                        .performTouchAction(swipeRight)
                        .sleep(3000)
                        .elementByXPath('//*[@text="Gallery"]')
                        .then(function (element) {
                            return element.click().sleep(5000);
                        }, function () {
                            // if the gallery is already opened, we'd just go on:
                            return driver;
                        })
                        .performTouchAction(touchTile);
                }
                return driver
                    .elementByXPath('//android.widget.ImageView[contains(@resource-id,\'shutter\')]')
                    .click()
                    .sleep(3000)
                    .elementByXPath('//android.widget.ImageView[contains(@resource-id,\'done\')]')
                    .click()
                    .sleep(10000);
            })
            .then(function () {
                if (skipUiInteractions) {
                    return;
                }
                if (options.hasOwnProperty('allowEdit') && options.allowEdit === true) {
                    return driver
                        .elementByXPath('//*[contains(@resource-id,\'save\')]')
                        .click();
                }
            })
            .then(function () {
                if (!skipUiInteractions) {
                    return driver.sleep(10000);
                }
            })
            .fail(function (error) {
                if (retry < RETRY_COUNT) {
                    console.log('Failed to get a picture. Let\'s try it again... ');
                    return getPicture(options, skipUiInteractions, ++retry);
                } else {
                    console.log('Tried ' + RETRY_COUNT + ' times but couldn\'t get the picture. Failing...');
                    fail(error);
                }
            });
    }

    function enterTest() {
        return driver
            // trying to determine where we are
            .context(webviewContext)
            .fail(function (error) {
                fail(error);
            })
            .elementById('info')
            .then(function () {
                return driver; //we're already on the test screen
            }, function () {
                return driver
                    .elementById('middle')
                    .then(function () {
                        return driver
                            // we're on autotests page, we should go to start page
                            .execute('window.location = "../index.html"')
                            .sleep(5000)
                            .fail(function () {
                                errorFlag = true;
                                throw 'Couldn\'t find start page.';
                            });
                    }, function () {
                        return; // no-op
                    })
                    // unknown starting page: no 'info' div
                    // adding it manually
                    .execute('var info = document.createElement("div"); ' +
                             'info.id = "info"; ' +
                             'document.body.appendChild(info);');
            })
            .sleep(5000);
    }

    function checkPicture(shouldLoad) {
        return driver
            .context(webviewContext)
            .elementById('info')
            .getAttribute('innerHTML')
            .then(function (html) {
                if (html.indexOf(STARTING_MESSAGE) >= 0) {
                    expect(true).toFailWithMessage('No callback was fired');
                } else if (shouldLoad) {
                    expect(html.length).toBeGreaterThan(0);
                    if (html.indexOf('ERROR') >= 0) {
                        fail(html);
                    }
                } else {
                    if (html.indexOf('ERROR') === -1) {
                        fail('Unexpected success callback with result: ' + html);
                    }
                    expect(html.indexOf('ERROR')).toBe(0);
                }
            });
    }

    function runCombinedSpec(spec) {
        return enterTest()
            .then(function () {
                return getPicture(spec.options);
            })
            .then(function () {
                return checkPicture(true);
            })
            .then(win, fail);
    }

    function deleteImage() {
        var holdTile = new wd.TouchAction();
        holdTile.press({x: Math.round(screenWidth / 3), y: Math.round(screenHeight / 5)}).wait(1000).release();
        return driver
            .performTouchAction(holdTile)
            .elementByXPath('//android.widget.TextView[@text="Delete"]')
            .then(function (element) {
                return element
                    .click()
                    .elementByXPath('//android.widget.Button[@text="OK"]')
                    .click();
            }, function () {
                // couldn't find Delete menu item. Possibly there is no image.
                return;
            });
    }

    function getDriver() {
        driver = wdHelper.getDriver('Android');
        return driver;
    }

    function checkStopFlag() {
        if (stopFlag) {
            fail('Something went wrong: the stopFlag is on. Please see the log for more details.');
        }
        return stopFlag;
    }

    beforeEach(function () {
        jasmine.addMatchers({
            toFailWithMessage : function () {
                return {
                    compare: function (actual, msg) {
                        console.log('Failing with message: ' + msg);
                        var result = {
                            pass: false,
                            message: msg
                        };
                        // status 6 means that we've lost the session
                        // status 7 means that Appium couldn't find an element
                        // both these statuses mean that the test has failed but
                        // we should try to recreate the session for the following tests
                        if (msg.indexOf('Error response status: 6') >= 0 ||
                            msg.indexOf('Error response status: 7') >= 0) {
                            errorFlag = true;
                        }
                        return result;
                    }
                };
            }
        });
    });

    it('camera.ui.util configuring driver and starting a session', function (done) {
        stopFlag = true; // just in case of timeout
        getDriver().then(function () {
            stopFlag = false;
        }, function (error) {
            fail(error);
        })
        .finally(done);
    }, 5 * MINUTE);

    it('camera.ui.util determine webview context name', function (done) {
        var i = 0;
        return driver
            .contexts(function (err, contexts) {
                if (err) {
                    console.log(err);
                }
                for (i = 0; i < contexts.length; i++) {
                    if (contexts[i].indexOf('mobilespec') >= 0) {
                        webviewContext = contexts[i];
                    }
                }
                done();
            });
    }, MINUTE);

    it('camera.ui.util determine screen dimensions', function (done) {
        return enterTest()
            .execute('document.getElementById(\'info\').innerHTML = window.innerWidth;')
            .sleep(5000)
            .elementById('info')
            .getAttribute('innerHTML')
            .then(function (html) {
                if (html !== STARTING_MESSAGE) {
                    screenWidth = Number(html);
                }
            })
            .execute('document.getElementById(\'info\').innerHTML = \'' + STARTING_MESSAGE + '\';')
            .execute('document.getElementById(\'info\').innerHTML = window.innerHeight;')
            .sleep(5000)
            .elementById('info')
            .getAttribute('innerHTML')
            .then(function (html) {
                if (html !== STARTING_MESSAGE) {
                    screenHeight = Number(html);
                }
                done();
            });
    }, MINUTE);

    describe('Specs.', function () {
        beforeEach(function (done) {
            // prepare the app for the test
            if (!stopFlag) {
                return driver
                    .context(webviewContext)
                    .then(function () {
                        return driver; // no-op
                    }, function (error) {
                        expect(true).toFailWithMessage(error);
                    })
                    .execute('document.getElementById("info").innerHTML = "' + STARTING_MESSAGE + '";')
                    .finally(done);
            }
            done();
        }, 3 * MINUTE);

        afterEach(function (done) {
            if (!errorFlag || stopFlag) {
                // either there's no error or we've failed irrecoverably
                // nothing to worry about!
                done();
                return;
            }
            // recreate the session if there was a critical error in a previous spec
            stopFlag = true; // we're going to set this to false if we're able to restore the session
            return driver
                .quit()
                .then(function () {
                    return getDriver()
                        .then(function () {
                            errorFlag = false;
                            stopFlag = false;
                        }, function (error) {
                            fail(error);
                            stopFlag = true;
                        });
                }, function (error) {
                    fail(error);
                    stopFlag = true;
                })
                .finally(done);
        }, 3 * MINUTE);

        // getPicture() with saveToPhotoLibrary = true
        it('camera.ui.spec.1 Saving the picture to photo library', function (done) {
            var options = {
                quality: 50,
                allowEdit: false,
                sourceType: cameraConstants.PictureSourceType.CAMERA,
                saveToPhotoAlbum: true
            };
            enterTest()
                .context(webviewContext)
                .then(function () {
                    return getPicture(options);
                })
                .then(function () {
                    isTestPictureSaved = true;
                    return checkPicture(true);
                })
                .then(win, fail)
                .finally(done);
        }, 3 * MINUTE);

        // getPicture() with mediaType: VIDEO, sourceType: PHOTOLIBRARY
        it('camera.ui.spec.2 Selecting only videos', function (done) {
            if (checkStopFlag()) {
                done();
                return;
            }
            var options = { sourceType: cameraConstants.PictureSourceType.PHOTOLIBRARY,
                            mediaType: cameraConstants.MediaType.VIDEO };
            enterTest()
                .then(function () {
                    return getPicture(options, true);
                })
                .sleep(5000)
                .context(webviewContext)
                .elementById('info')
                .getAttribute('innerHTML')
                .then(function (html) {
                    if (html.indexOf('ERROR') >= 0) {
                        throw html;
                    }
                })
                .context('NATIVE_APP')
                .sleep(5000)
                .then(function () {
                    // try to find "Gallery" menu item
                    // if there's none, the gallery should be already opened
                    return driver
                        .elementByXPath('//*[@text="Gallery"]')
                        .then(function (element) {
                            return element.click().sleep(2000);
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
                .then(win, fail)
                .deviceKeyEvent(4)
                .sleep(2000)
                .deviceKeyEvent(4)
                .sleep(2000)
                .elementById('action_bar_title')
                .then(function () {
                    // success means we're still in native app
                    return driver
                        .deviceKeyEvent(4)
                        .sleep(2000);
                }, function () {
                    // error means we're already in webview
                    return driver;
                })
                .finally(done);
        }, 3 * MINUTE);

        // getPicture(), then dismiss
        // wait for the error callback to bee called
        it('camera.ui.spec.3 Dismissing the camera', function (done) {
            if (checkStopFlag()) {
                done();
                return;
            }
            var options = { quality: 50,
                            allowEdit: true,
                            sourceType: cameraConstants.PictureSourceType.CAMERA,
                            destinationType: cameraConstants.DestinationType.FILE_URI };
            enterTest()
                .context(webviewContext)
                .then(function () {
                    return getPicture(options, true);
                })
                .sleep(5000)
                .context("NATIVE_APP")
                .elementByXPath('//android.widget.ImageView[contains(@resource-id,\'cancel\')]')
                .click()
                .context(webviewContext)
                .then(function () {
                    return driver
                        .elementByXPath('//*[contains(text(),"Camera cancelled")]')
                        .then(function () {
                            return checkPicture(false);
                        }, function () {
                            throw 'Couldn\'t find "Camera cancelled" message.';
                        });
                })
                .then(win, fail)
                .finally(done);
        }, 3 * MINUTE);

        // getPicture(), then take picture but dismiss the edit
        // wait for the error cllback to be called
        it('camera.ui.spec.4 Dismissing the edit', function (done) {
            if (checkStopFlag()) {
                done();
                return;
            }
            var options = { quality: 50,
                            allowEdit: true,
                            sourceType: cameraConstants.PictureSourceType.CAMERA,
                            destinationType: cameraConstants.DestinationType.FILE_URI };
            enterTest()
                .context(webviewContext)
                .then(function () {
                    return getPicture(options, true);
                })
                .sleep(5000)
                .context('NATIVE_APP')
                .elementByXPath('//android.widget.ImageView[contains(@resource-id,\'shutter\')]')
                .click()
                .elementByXPath('//android.widget.ImageView[contains(@resource-id,\'done\')]')
                .click()
                .elementByXPath('//*[contains(@resource-id,\'discard\')]')
                .click()
                .sleep(5000)
                .context(webviewContext)
                .then(function () {
                    return driver
                        .elementByXPath('//*[contains(text(),"Camera cancelled")]')
                        .then(function () {
                            return checkPicture(false);
                        }, function () {
                            throw 'Couldn\'t find "Camera cancelled" message.';
                        });
                })
                .then(win, fail)
                .finally(done);
        }, 3 * MINUTE);

        // combine various options for getPicture()
        generateSpecs().forEach(function (spec) {
            it('camera.ui.spec.5.' + spec.id + ' Combining options', function (done) {
                if (checkStopFlag()) {
                    done();
                    return;
                }
                runCombinedSpec(spec).then(done);
            }, 3 * MINUTE);
        });


        it('camera.ui.util Delete test image from device library', function (done) {
            if (checkStopFlag()) {
                done();
                return;
            }
            if (isTestPictureSaved) {
                // delete exactly one last picture
                // this should be the picture we've taken in the first spec
                return driver
                    .context('NATIVE_APP')
                    .deviceKeyEvent(3)
                    .sleep(5000)
                    .elementByName('Apps')
                    .click()
                    .elementByXPath('//android.widget.TextView[@text="Gallery"]')
                    .click()
                    .elementByXPath('//android.widget.TextView[contains(@text,"Pictures")]')
                    .then(function (element) {
                        return element
                            .click()
                            .sleep(3000)
                            .then(deleteImage)
                            .then(function () { done(); }, function () { done(); });
                    }, function () {
                        done();
                    });
            }
            // couldn't save test picture earlier, so nothing to delete here
            done();
        }, 3 * MINUTE);

    });

    it('camera.ui.util Destroy the session', function (done) {
        return driver.quit(done);
    }, 10000);
});
