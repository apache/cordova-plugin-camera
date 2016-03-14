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
var isDevice = global.DEVICE;
var cameraConstants = require('../../www/CameraConstants');
var cameraHelper = require('../helpers/cameraHelper');
var screenshotHelper = require('../helpers/screenshotHelper');

var MINUTE = 60 * 1000;
var DEFAULT_WEBVIEW_CONTEXT = 'WEBVIEW_1';

describe('Camera tests iOS.', function () {

    var driver;
    var webviewContext = DEFAULT_WEBVIEW_CONTEXT;
    var startingMessage = 'Ready for action!';

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

    function getPicture(options, cancelCamera, skipUiInteractions) {
        if (!options) {
            options = {};
        }
        var command = "navigator.camera.getPicture(function (result) { document.getElementById('info').innerHTML = 'Success: ' + result.slice(0, 100); }, " +
                      "function (err) { document.getElementById('info').innerHTML = 'ERROR: ' + err; }," + JSON.stringify(options) + ");";
        return driver
            .sleep(2000)
            .context(webviewContext)
            .execute(command)
            .sleep(5000)
            .context('NATIVE_APP')
            .then(function () {
                if (skipUiInteractions) {
                    return;
                }
                if (options.hasOwnProperty('sourceType') && options.sourceType === cameraConstants.PictureSourceType.PHOTOLIBRARY) {
                    return driver
                        .elementByName('Camera Roll')
                        .click()
                        .elementByXPath('//UIACollectionCell')
                        .click()
                        .then(function () {
                            if (options.hasOwnProperty('allowEdit') && options.allowEdit === true) {
                                return driver
                                    .elementByName('Use')
                                    .click();
                            }
                            return driver;
                        });
                }
                if (options.hasOwnProperty('sourceType') && options.sourceType === cameraConstants.PictureSourceType.SAVEDPHOTOALBUM) {
                    return driver
                        .elementByXPath('//UIACollectionCell')
                        .click()
                        .then(function () {
                            if (options.hasOwnProperty('allowEdit') && options.allowEdit === true) {
                                return driver
                                    .elementByName('Use')
                                    .click();
                            }
                            return driver;
                        });
                }
                if (cancelCamera) {
                    return driver
                        .elementByName('Cancel')
                        .click();
                }
                return driver
                    .elementByName('PhotoCapture')
                    .click()
                    .elementByName('Use Photo')
                    .click();
            })
            .sleep(3000);
    }

    function enterTest() {
        return driver
            .contexts(function (err, contexts) {
                if (err) {
                    fail(err);
                } else {
                    // if WEBVIEW context is available, use it
                    // if not, use NATIVE_APP
                    webviewContext = contexts[contexts.length - 1];
                }
            })
            .then(function () {
                return driver
                    .context(webviewContext);
            })
            .fail(fail)
            .elementById('info')
            .fail(function () {
                // unknown starting page: no 'info' div
                // adding it manually
                return driver
                    .execute('var info = document.createElement("div"); ' +
                             'info.id = "info"' +
                             'document.body.appendChild(info);')
                    .fail(fail);
            })
            .execute('document.getElementById("info").innerHTML = "' + startingMessage + '";')
            .fail(fail);
    }

    function checkPicture(shouldLoad) {
        return driver
            .contexts(function (err, contexts) {
                // if WEBVIEW context is available, use it
                // if not, use NATIVE_APP
                webviewContext = contexts[contexts.length - 1];
            })
            .context(webviewContext)
            .elementById('info')
            .getAttribute('innerHTML')
            .then(function (html) {
                if (html.indexOf(startingMessage) >= 0) {
                    expect(true).toFailWithMessage('No callback was fired');
                } else if (shouldLoad) {
                    expect(html.length).toBeGreaterThan(0);
                    if (html.indexOf('ERROR') >= 0) {
                        expect(true).toFailWithMessage(html);
                    }
                } else {
                    if (html.indexOf('ERROR') === -1) {
                        expect(true).toFailWithMessage('Unexpected success callback with result: ' + html);
                    }
                    expect(html.indexOf('ERROR')).toBe(0);
                }
            })
            .context('NATIVE_APP');
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
                        return result;
                    }
                };
            }
        });
    });

    it('camera.ui.util Configuring driver and starting a session', function (done) {
        driver = wdHelper.getDriver('iOS', done);
    }, 3 * MINUTE);

    describe('Specs.', function () {
        // getPicture() with mediaType: VIDEO, sourceType: PHOTOLIBRARY
        it('camera.ui.spec.1 Selecting only videos', function (done) {
            var options = { sourceType: cameraConstants.PictureSourceType.PHOTOLIBRARY,
                            mediaType: cameraConstants.MediaType.VIDEO };
            enterTest()
                .then(function () { return getPicture(options, false, true); }) // skip ui unteractions
                .sleep(5000)
                .elementByName('Videos')
                .then(win, fail)
                .elementByName('Cancel')
                .click()
                .finally(done);
        }, 3 * MINUTE);

        // getPicture(), then dismiss
        // wait for the error callback to bee called
        it('camera.ui.spec.2 Dismissing the camera', function (done) {
            // camera is not available on iOS simulator
            if (!isDevice) {
                pending();
            }
            var options = { sourceType: cameraConstants.PictureSourceType.CAMERA };
            enterTest()
                .then(function () {
                    return getPicture(options, true);
                })
                .then(function () {
                    return checkPicture(false);
                })
                .elementByXPath('//UIAStaticText[contains(@label,"no image selected")]')
                .then(function () {
                    return checkPicture(false);
                }, fail)
                .finally(done);
        }, 3 * MINUTE);

        // combine various options for getPicture()
        generateSpecs().forEach(function (spec) {
            it('camera.ui.spec.3.' + spec.id + ' Combining options', function (done) {
                // camera is not available on iOS simulator
                if (!isDevice) {
                    pending();
                }
                runCombinedSpec(spec).then(done);
            }, 3 * MINUTE);
        });

    });

    it('camera.ui.util.4 Destroy the session', function (done) {
        driver.quit(done);
    }, MINUTE);
});
