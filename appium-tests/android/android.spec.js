/*jslint node: true, plusplus: true */
/*global beforeEach, afterEach */
/*global describe, it, xit, expect, jasmine */
'use strict';

// these tests are meant to be executed by Cordova Medic Appium runner
// you can find it here: https://github.com/apache/cordova-medic/
// it is not necessary to do a full CI setup to run these tests
// just run "node cordova-medic/medic/medic.js appium --platform android --plugins cordova-plugin-camera"

var wdHelper = require('../helpers/wdHelper');
var wd = wdHelper.getWD();
var cameraConstants = require('../../www/CameraConstants');
var cameraHelper = require('../helpers/cameraHelper');

describe('Camera tests Android.', function () {
    var driver,
        startingMessage = 'Ready for action!',
        // the name of webview context, it will be changed to match needed context if there are named ones:
        webviewContext = 'WEBVIEW',
        // this indicates if device library has test picture:
        isTestPictureSaved = false,
        // this indecates that there was critical error and tests cannot continue:
        stopFlag = false,
        // we need to know the screen width and height to properly click on the first image in the gallery
        screenWidth = 360,
        screenHeight = 567;

    function win() {
        expect(true).toBe(true);
    }

    function fail(error) {
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
        console.log('An error without description occured');
        expect(true).toBe(false);
        throw 'An error without description occured';
    }

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

    function getPicture(options, skipUiInteractions) {
        if (!options) {
            options = {};
        }
        var command = "navigator.camera.getPicture(function (result) { document.getElementById('info').innerHTML = result.slice(0, 100); }, " +
                      "function (err) { document.getElementById('info').innerHTML = 'ERROR: ' + err; }," + JSON.stringify(options) + ");";
        return driver
            .context(webviewContext)
            .execute(command)
            .sleep(5000)
            .context('NATIVE_APP')
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
                    swipeRight.press({x: 10, y: Math.round(screenHeight / 2)})
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
                    .elementByXPath('//android.widget.ImageView[contains(@resource-id,\'done\')]')
                    .click();
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
            });
    }

    function enterTest() {
        if (stopFlag) {
            return driver
                .context(webviewContext)
                .then(function () {
                    throw 'stopFlag is on!';
                });
        }
        return driver
            // trying to determine where we are
            .context(webviewContext)
            .then(function (result) {
                console.log(result);
            })
            .fail(function (error) {
                expect(true).toFailWithMessage(error);
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
                                stopFlag = true;
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
                        if (msg.indexOf('Error response status: 6') >= 0) {
                            stopFlag = true;
                        }
                        return result;
                    }
                };
            }
        });
    });

    it('camera.ui.util configuring driver and starting a session', function (done) {
        driver = wdHelper.getDriver('Android', function () {
            return driver
                .sleep(10000)
                .finally(done);
        });
    }, 320000);

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
    }, 30000);

    it('camera.ui.util determine screen dimensions', function (done) {
        return enterTest()
            .execute('document.getElementById(\'info\').innerHTML = window.innerWidth;')
            .sleep(5000)
            .elementById('info')
            .getAttribute('innerHTML')
            .then(function (html) {
                if (html !== startingMessage) {
                    screenWidth = Number(html);
                }
            })
            .execute('document.getElementById(\'info\').innerHTML = \'' + startingMessage + '\';')
            .execute('document.getElementById(\'info\').innerHTML = window.innerHeight;')
            .sleep(5000)
            .elementById('info')
            .getAttribute('innerHTML')
            .then(function (html) {
                if (html !== startingMessage) {
                    screenHeight = Number(html);
                }
                done();
            });
    }, 60000);

    describe('Specs.', function () {
        beforeEach(function (done) {
            if (!stopFlag) {
                return driver
                    .context(webviewContext)
                    .then(function () {
                        return driver; // no-op
                    }, function (error) {
                        expect(true).toFailWithMessage(error);
                    })
                    .execute('document.getElementById("info").innerHTML = "' + startingMessage + '";')
                    .finally(done);
            }
            done();
        }, 600000);

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
        }, 300000);

        // getPicture() with mediaType: VIDEO, sourceType: PHOTOLIBRARY
        it('camera.ui.spec.2 Selecting only videos', function (done) {
            if (stopFlag) {
                expect(true).toFailWithMessage('Couldn\'t start tests execution.');
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
        }, 300000);

        // getPicture(), then dismiss
        // wait for the error callback to bee called
        it('camera.ui.spec.3 Dismissing the camera', function (done) {
            if (stopFlag) {
                expect(true).toFailWithMessage('Couldn\'t start tests execution.');
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
        }, 300000);

        // getPicture(), then take picture but dismiss the edit
        // wait for the error cllback to be called
        it('camera.ui.spec.4 Dismissing the edit', function (done) {
            if (stopFlag) {
                expect(true).toFailWithMessage('Couldn\'t start tests execution.');
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
        }, 300000);

        // combine various options for getPicture()
        generateSpecs().forEach(function (spec) {
            it('camera.ui.spec.5.' + spec.id + ' Combining options', function (done) {
                if (stopFlag) {
                    expect(true).toFailWithMessage('Couldn\'t start tests execution.');
                    done();
                    return;
                }
                runCombinedSpec(spec).then(done);
            }, 3 * 60 * 1000);
        });


        it('camera.ui.util Delete test image from device library', function (done) {
            if (stopFlag) {
                expect(true).toFailWithMessage('Couldn\'t start tests executeion.');
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
        }, 300000);

    });

    it('camera.ui.util Destroy the session', function (done) {
        return driver.quit(done);
    }, 10000);
});
