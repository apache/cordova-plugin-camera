/*jshint node: true */
/* global Q, resolveLocalFileSystemURL, Camera, cordova */
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

var cameraConstants = require('../../www/CameraConstants');

function findKeyByValue(set, value) {
   for (var k in set) {
      if (set.hasOwnProperty(k)) {
         if (set[k] == value) {
            return k;
         }
      }
   }
   return undefined;
}

function getDescription(spec) {
    var desc = '';

    desc += 'sourceType: ' + findKeyByValue(cameraConstants.PictureSourceType, spec.options.sourceType);
    desc += ', destinationType: ' + findKeyByValue(cameraConstants.DestinationType, spec.options.destinationType);
    desc += ', encodingType: ' + findKeyByValue(cameraConstants.EncodingType, spec.options.encodingType);
    desc += ', allowEdit: ' + spec.options.allowEdit.toString();
    desc += ', correctOrientation: ' + spec.options.correctOrientation.toString();

    return desc;
}

module.exports.generateSpecs = function (sourceTypes, destinationTypes, encodingTypes, allowEditOptions, correctOrientationOptions) {
    var destinationType,
        sourceType,
        encodingType,
        allowEdit,
        correctOrientation,
        specs = [],
        id = 1;
    for (destinationType in destinationTypes) {
        if (destinationTypes.hasOwnProperty(destinationType)) {
            for (sourceType in sourceTypes) {
                if (sourceTypes.hasOwnProperty(sourceType)) {
                    for (encodingType in encodingTypes) {
                        if (encodingTypes.hasOwnProperty(encodingType)) {
                            for (allowEdit in allowEditOptions) {
                                if (allowEditOptions.hasOwnProperty(allowEdit)) {
                                    for (correctOrientation in correctOrientationOptions) {
                                        // if taking picture from photolibrary, don't vary 'correctOrientation' option
                                        if ((sourceTypes[sourceType] === cameraConstants.PictureSourceType.PHOTOLIBRARY ||
                                            sourceTypes[sourceType] === cameraConstants.PictureSourceType.SAVEDPHOTOALBUM) &&
                                            correctOrientation === true) { continue; }
                                        var spec = {
                                            'id': id++,
                                            'options': {
                                                'destinationType': destinationTypes[destinationType],
                                                'sourceType': sourceTypes[sourceType],
                                                'encodingType': encodingTypes[encodingType],
                                                'allowEdit': allowEditOptions[allowEdit],
                                                'saveToPhotoAlbum': false,
                                                'correctOrientation': correctOrientationOptions[correctOrientation]
                                            }
                                        };
                                        spec.description = getDescription(spec);
                                        specs.push(spec);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    return specs;
};

// calls getPicture() and saves the result in promise
// note that this function is executed in the context of tested app
// and not in the context of tests
module.exports.getPicture = function (opts, pid) {
    if (navigator._appiumPromises[pid - 1]) {
        navigator._appiumPromises[pid - 1] = null;
    }
    navigator._appiumPromises[pid] = Q.defer();
    navigator.camera.getPicture(function (result) {
        navigator._appiumPromises[pid].resolve(result);
    }, function (err) {
        navigator._appiumPromises[pid].reject(err);
    }, opts);
};

// verifies taken picture when the promise is resolved,
// calls a callback with 'OK' if everything is good,
// calls a callback with 'ERROR: <error message>' if something is wrong
// note that this function is executed in the context of tested app
// and not in the context of tests
module.exports.checkPicture = function (pid, options, cb) {
    var isIos = cordova.platformId === "ios";
    var isAndroid = cordova.platformId === "android";
    // skip image type check if it's unmodified on Android:
    // https://github.com/apache/cordova-plugin-camera/#android-quirks-1
    var skipFileTypeCheckAndroid = isAndroid && options.quality === 100 &&
        !options.targetWidth && !options.targetHeight &&
        !options.correctOrientation;

    // Skip image type check if destination is NATIVE_URI and source - device's photoalbum
    // https://github.com/apache/cordova-plugin-camera/#ios-quirks-1
    var skipFileTypeCheckiOS = isIos && options.destinationType === Camera.DestinationType.NATIVE_URI &&
        (options.sourceType === Camera.PictureSourceType.PHOTOLIBRARY ||
         options.sourceType === Camera.PictureSourceType.SAVEDPHOTOALBUM);

    var skipFileTypeCheck = skipFileTypeCheckAndroid || skipFileTypeCheckiOS;

    var desiredType = 'JPEG';
    var mimeType = 'image/jpeg';
    if (options.encodingType === Camera.EncodingType.PNG) {
        desiredType = 'PNG';
        mimeType = 'image/png';
    }

    function errorCallback(msg) {
        if (msg.hasOwnProperty('message')) {
            msg = msg.message;
        }
        cb('ERROR: ' + msg);
    }

    // verifies the image we get from plugin
    function verifyResult(result) {
        if (result.length === 0) {
            errorCallback('The result is empty.');
            return;
        } else if (isIos && options.destinationType === Camera.DestinationType.NATIVE_URI && result.indexOf('assets-library:') !== 0) {
            errorCallback('Expected "' + result.substring(0, 150) + '"to start with "assets-library:"');
            return;
        } else if (isIos && options.destinationType === Camera.DestinationType.FILE_URI && result.indexOf('file:') !== 0) {
            errorCallback('Expected "' + result.substring(0, 150) + '"to start with "file:"');
            return;
        }

        try {
            window.atob(result);
            // if we got here it is a base64 string (DATA_URL)
            result = "data:" + mimeType + ";base64," + result;
        } catch (e) {
            // not DATA_URL
            if (options.destinationType === Camera.DestinationType.DATA_URL) {
                errorCallback('Expected ' + result.substring(0, 150) + 'not to be DATA_URL');
                return;
            }
        }
        try {
            if (result.indexOf('file:') === 0 ||
                result.indexOf('content:') === 0 ||
                result.indexOf('assets-library:') === 0) {

                if (!window.resolveLocalFileSystemURL) {
                    errorCallback('Cannot read file. Please install cordova-plugin-file to fix this.');
                    return;
                }
                resolveLocalFileSystemURL(result, function (entry) {
                    if (skipFileTypeCheck) {
                        displayFile(entry);
                    } else {
                        verifyFile(entry);
                    }
                });
            } else {
                displayImage(result);
            }
        } catch (e) {
            errorCallback(e);
        }
    }

    // verifies that the file type matches the requested type
    function verifyFile(entry) {
        try {
            var reader = new FileReader();
            reader.onloadend = function(e) {
                var arr = (new Uint8Array(e.target.result)).subarray(0, 4);
                var header = '';
                for(var i = 0; i < arr.length; i++) {
                    header += arr[i].toString(16);
                }
                var actualType = 'unknown';

                switch (header) {
                    case "89504e47":
                        actualType = 'PNG';
                        break;
                    case 'ffd8ffe0':
                    case 'ffd8ffe1':
                    case 'ffd8ffe2':
                        actualType = 'JPEG';
                        break;
                }

                if (actualType === desiredType) {
                    displayFile(entry);
                } else {
                    errorCallback('File type mismatch. Expected ' + desiredType + ', got ' + actualType);
                }
            };
            reader.onerror = function (e) {
                errorCallback(e);
            };
            entry.file(function (file) {
                reader.readAsArrayBuffer(file);
            }, function (e) {
                errorCallback(e);
            });
        } catch (e) {
            errorCallback(e);
        }
    }

    // reads the file, then displays the image
    function displayFile(entry) {
        function onFileReceived(file) {
            var reader = new FileReader();
            reader.onerror = function (e) {
                errorCallback(e);
            };
            reader.onloadend = function (evt) {
                displayImage(evt.target.result);
            };
            reader.readAsDataURL(file);
        }

        entry.file(onFileReceived, function (e) {
            errorCallback(e);
        });
    }

    function displayImage(image) {
        try {
            var imgEl = document.getElementById('camera_test_image');
            if (!imgEl) {
                imgEl = document.createElement('img');
                imgEl.id = 'camera_test_image';
                document.body.appendChild(imgEl);
            }
            var timedOut = false;
            var loadTimeout = setTimeout(function () {
                timedOut = true;
                imgEl.src = '';
                errorCallback('The image did not load: ' + image.substring(0, 150));
            }, 10000);
            var done = function (status) {
                if (!timedOut) {
                    clearTimeout(loadTimeout);
                    imgEl.src = '';
                    cb(status);
                }
            };
            imgEl.onload = function () {
                try {
                    // aspect ratio is preserved so only one dimension should match
                    if ((typeof options.targetWidth === 'number' && imgEl.naturalWidth !== options.targetWidth) &&
                        (typeof options.targetHeight === 'number' && imgEl.naturalHeight !== options.targetHeight))
                    {
                        done('ERROR: Wrong image size: ' + imgEl.naturalWidth + 'x' + imgEl.naturalHeight +
                            '. Requested size: ' + options.targetWidth + 'x' + options.targetHeight);
                    } else {
                        done('OK');
                    }
                } catch (e) {
                    errorCallback(e);
                }
            };
            imgEl.src = image;
        } catch (e) {
            errorCallback(e);
        }
    }

    navigator._appiumPromises[pid].promise
        .then(function (result) {
            verifyResult(result);
        })
        .fail(function (e) {
            errorCallback(e);
        });
};
