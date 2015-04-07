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

/*jshint unused:true, undef:true, browser:true */
/*global Windows:true, URL:true, module:true, require:true */


var Camera = require('./Camera');

module.exports = {

    // args will contain :
    //  ...  it is an array, so be careful
    // 0 quality:50,
    // 1 destinationType:Camera.DestinationType.FILE_URI,
    // 2 sourceType:Camera.PictureSourceType.CAMERA,
    // 3 targetWidth:-1,
    // 4 targetHeight:-1,
    // 5 encodingType:Camera.EncodingType.JPEG,
    // 6 mediaType:Camera.MediaType.PICTURE,
    // 7 allowEdit:false,
    // 8 correctOrientation:false,
    // 9 saveToPhotoAlbum:false,
    // 10 popoverOptions:null
    // 11 cameraDirection:0

    takePicture: function (successCallback, errorCallback, args) {
        var sourceType = args[2];

        if (sourceType != Camera.PictureSourceType.CAMERA) {
            takePictureFromFile(successCallback, errorCallback, args);
        } else {
            takePictureFromCamera(successCallback, errorCallback, args);
        }
    }
};


// Resize method
function resizeImage(successCallback, errorCallback, file, targetWidth, targetHeight, encodingType) {
    var tempPhotoFileName = "";
    if (encodingType == Camera.EncodingType.PNG) {
        tempPhotoFileName = "camera_cordova_temp_return.png";
    } else {
        tempPhotoFileName = "camera_cordova_temp_return.jpg";
    }

    var storageFolder = Windows.Storage.ApplicationData.current.localFolder;
    file.copyAsync(storageFolder, file.name, Windows.Storage.NameCollisionOption.replaceExisting)
        .then(function (storageFile) { return Windows.Storage.FileIO.readBufferAsync(storageFile); })
        .then(function(buffer) {
            var strBase64 = Windows.Security.Cryptography.CryptographicBuffer.encodeToBase64String(buffer);
            var imageData = "data:" + file.contentType + ";base64," + strBase64;
            var image = new Image();
            image.src = imageData;
            image.onload = function() {
                var imageWidth = targetWidth,
                    imageHeight = targetHeight;
                var canvas = document.createElement('canvas');
                var storageFileName;

                canvas.width = imageWidth;
                canvas.height = imageHeight;

                canvas.getContext("2d").drawImage(this, 0, 0, imageWidth, imageHeight);

                var fileContent = canvas.toDataURL(file.contentType).split(',')[1];

                var storageFolder = Windows.Storage.ApplicationData.current.localFolder;

                storageFolder.createFileAsync(tempPhotoFileName, Windows.Storage.CreationCollisionOption.generateUniqueName)
                    .then(function (storagefile) {
                        var content = Windows.Security.Cryptography.CryptographicBuffer.decodeFromBase64String(fileContent);
                        storageFileName = storagefile.name;
                        return Windows.Storage.FileIO.writeBufferAsync(storagefile, content);
                    })
                    .done(function () {
                        successCallback("ms-appdata:///local/" + storageFileName);
                    }, errorCallback);
            };
        })
        .done(null, function(err) {
            errorCallback(err);
        }
    );
}

// Because of asynchronous method, so let the successCallback be called in it.
function resizeImageBase64(successCallback, errorCallback, file, targetWidth, targetHeight) {
    Windows.Storage.FileIO.readBufferAsync(file).done( function(buffer) {
        var strBase64 = Windows.Security.Cryptography.CryptographicBuffer.encodeToBase64String(buffer);
        var imageData = "data:" + file.contentType + ";base64," + strBase64;

        var image = new Image();
        image.src = imageData;

        image.onload = function() {
            var imageWidth = targetWidth,
                imageHeight = targetHeight;
            var canvas = document.createElement('canvas');

            canvas.width = imageWidth;
            canvas.height = imageHeight;

            var ctx = canvas.getContext("2d");
            ctx.drawImage(this, 0, 0, imageWidth, imageHeight);

            // The resized file ready for upload
            var finalFile = canvas.toDataURL(file.contentType);

            // Remove the prefix such as "data:" + contentType + ";base64," , in order to meet the Cordova API.
            var arr = finalFile.split(",");
            var newStr = finalFile.substr(arr[0].length + 1);
            successCallback(newStr);
        };
    }, function(err) { errorCallback(err); });
}

function takePictureFromFile(successCallback, errorCallback, mediaType, destinationType, targetWidth, targetHeight, encodingType) {
    // TODO: Add WP8.1 support
    // WP8.1 doesn't allow to use of pickSingleFileAsync method
    // see http://msdn.microsoft.com/en-us/library/windows/apps/br207852.aspx for details
    // replacement of pickSingleFileAsync - pickSingleFileAndContinue method
    // will take application to suspended state and this require additional logic to wake application up
    if (navigator.appVersion.indexOf('Windows Phone 8.1') >= 0 ) {
        errorCallback('Not supported');
        return;
    }

    var fileOpenPicker = new Windows.Storage.Pickers.FileOpenPicker();
    fileOpenPicker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.picturesLibrary;
    if (mediaType == Camera.MediaType.PICTURE) {
        fileOpenPicker.fileTypeFilter.replaceAll([".png", ".jpg", ".jpeg"]);
    }
    else if (mediaType == Camera.MediaType.VIDEO) {
        fileOpenPicker.fileTypeFilter.replaceAll([".avi", ".flv", ".asx", ".asf", ".mov", ".mp4", ".mpg", ".rm", ".srt", ".swf", ".wmv", ".vob"]);
    }
    else {
        fileOpenPicker.fileTypeFilter.replaceAll(["*"]);
    }

    fileOpenPicker.pickSingleFileAsync().done(function (file) {
        if (!file) {
            errorCallback("User didn't choose a file.");
            return;
        }
        if (destinationType == Camera.DestinationType.FILE_URI || destinationType == Camera.DestinationType.NATIVE_URI) {
            if (targetHeight > 0 && targetWidth > 0) {
                resizeImage(successCallback, errorCallback, file, targetWidth, targetHeight, encodingType);
            }
            else {
                var storageFolder = Windows.Storage.ApplicationData.current.localFolder;
                file.copyAsync(storageFolder, file.name, Windows.Storage.NameCollisionOption.replaceExisting).done(function (storageFile) {
                    successCallback(URL.createObjectURL(storageFile));
                }, function () {
                    errorCallback("Can't access localStorage folder.");
                });

            }
        }
        else {
            if (targetHeight > 0 && targetWidth > 0) {
                resizeImageBase64(successCallback, errorCallback, file, targetWidth, targetHeight);
            } else {
                Windows.Storage.FileIO.readBufferAsync(file).done(function (buffer) {
                    var strBase64 = Windows.Security.Cryptography.CryptographicBuffer.encodeToBase64String(buffer);
                    successCallback(strBase64);
                }, errorCallback);
            }
        }
    }, function () {
        errorCallback("User didn't choose a file.");
    });
}

function takePictureFromCamera(successCallback, errorCallback, args) {
    // Check if necessary API available
    if (!Windows.Media.Capture.CameraCaptureUI) {
        takePictureFromCameraWP(successCallback, errorCallback, args);
    } else {
        takePictureFromCameraWindows(successCallback, errorCallback, args);
    }
}

function takePictureFromCameraWP(successCallback, errorCallback, args) {
    // We are running on WP8.1 which lacks CameraCaptureUI class
    // so we need to use MediaCapture class instead and implement custom UI for camera
    var destinationType = args[1],
        targetWidth = args[3],
        targetHeight = args[4],
        encodingType = args[5],
        saveToPhotoAlbum = args[9],
        cameraDirection = args[11],
        capturePreview = null,
        captureCancelButton = null,
        capture = null,
        captureSettings = null,
        CaptureNS = Windows.Media.Capture;

    var createCameraUI = function () {
        // Create fullscreen preview
        capturePreview = document.createElement("video");

        // z-order style element for capturePreview and captureCancelButton elts
        // is necessary to avoid overriding by another page elements, -1 sometimes is not enough
        capturePreview.style.cssText = "position: fixed; left: 0; top: 0; width: 100%; height: 100%; z-order: 999";

        // Create cancel button
        captureCancelButton = document.createElement("button");
        captureCancelButton.innerText = "Cancel";
        captureCancelButton.style.cssText = "position: fixed; right: 0; bottom: 0; display: block; margin: 20px; z-order: 1000";

        capture = new CaptureNS.MediaCapture();

        captureSettings = new CaptureNS.MediaCaptureInitializationSettings();
        captureSettings.streamingCaptureMode = CaptureNS.StreamingCaptureMode.video;
    };

    var startCameraPreview = function () {
        // Search for available camera devices
        // This is necessary to detect which camera (front or back) we should use
        var expectedPanel = cameraDirection === 1 ? Windows.Devices.Enumeration.Panel.front : Windows.Devices.Enumeration.Panel.back;
        Windows.Devices.Enumeration.DeviceInformation.findAllAsync(Windows.Devices.Enumeration.DeviceClass.videoCapture)
        .done(function (devices) {
            if (devices.length <= 0) {
                destroyCameraPreview();
                errorCallback('Camera not found');
                return;
            }

            devices.forEach(function(currDev) {
                if (currDev.enclosureLocation.panel && currDev.enclosureLocation.panel == expectedPanel) {
                    captureSettings.videoDeviceId = currDev.id;
                }
            });

            capture.initializeAsync(captureSettings).done(function () {
                // This is necessary since WP8.1 MediaCapture outputs video stream rotated 90 degrees CCW
                // TODO: This can be not consistent across devices, need additional testing on various devices
                capture.setPreviewRotation(Windows.Media.Capture.VideoRotation.clockwise90Degrees);
                // msdn.microsoft.com/en-us/library/windows/apps/hh452807.aspx
                capturePreview.msZoom = true;
                capturePreview.src = URL.createObjectURL(capture);
                capturePreview.play();

                // Insert preview frame and controls into page
                document.body.appendChild(capturePreview);
                document.body.appendChild(captureCancelButton);

                // Bind events to controls
                capturePreview.addEventListener('click', captureAction);
                captureCancelButton.addEventListener('click', function () {
                    destroyCameraPreview();
                    errorCallback('Cancelled');
                }, false);
            }, function (err) {
                destroyCameraPreview();
                errorCallback('Camera intitialization error ' + err);
            });
        }, errorCallback);
    };

    var destroyCameraPreview = function () {
        capturePreview.pause();
        capturePreview.src = null;
        [capturePreview, captureCancelButton].forEach(function(elem) {
            if (elem /* && elem in document.body.childNodes */) {
                document.body.removeChild(elem);
            }
        });
        if (capture) {
            capture.stopRecordAsync();
            capture = null;
        }
    };

    var captureAction = function () {

        var encodingProperties,
            fileName,
            generateUniqueCollisionOption = Windows.Storage.CreationCollisionOption.generateUniqueName,
            tempFolder = Windows.Storage.ApplicationData.current.temporaryFolder,
            capturedFile;

        if (encodingType == Camera.EncodingType.PNG) {
            fileName = 'photo.png';
            encodingProperties = Windows.Media.MediaProperties.ImageEncodingProperties.createPng();
        } else {
            fileName = 'photo.jpg';
            encodingProperties = Windows.Media.MediaProperties.ImageEncodingProperties.createJpeg();
        }

        tempFolder.createFileAsync(fileName, generateUniqueCollisionOption)
            .then(function(tempCapturedFile) {
                capturedFile = tempCapturedFile;
                return capture.capturePhotoToStorageFileAsync(encodingProperties, capturedFile);
            })
            .done(function() {
                destroyCameraPreview();

                // success callback for capture operation
                var success = function(capturedfile) {
                    if (destinationType == Camera.DestinationType.FILE_URI || destinationType == Camera.DestinationType.NATIVE_URI) {
                        if (targetHeight > 0 && targetWidth > 0) {
                            resizeImage(successCallback, errorCallback, capturedFile, targetWidth, targetHeight, encodingType);
                        } else {
                            capturedfile.copyAsync(Windows.Storage.ApplicationData.current.localFolder, capturedfile.name, generateUniqueCollisionOption).done(function(copiedfile) {
                                successCallback("ms-appdata:///local/" + copiedfile.name);
                            }, errorCallback);
                        }
                    } else {
                        if (targetHeight > 0 && targetWidth > 0) {
                            resizeImageBase64(successCallback, errorCallback, capturedfile, targetWidth, targetHeight);
                        } else {
                            Windows.Storage.FileIO.readBufferAsync(capturedfile).done(function(buffer) {
                                var strBase64 = Windows.Security.Cryptography.CryptographicBuffer.encodeToBase64String(buffer);
                                capturedfile.deleteAsync().done(function() {
                                    successCallback(strBase64);
                                }, function(err) {
                                    errorCallback(err);
                                });
                            }, errorCallback);
                        }
                    }
                };

                if (!saveToPhotoAlbum) {
                    success(capturedFile);
                    return;
                }

                /*
                    Need to add and remove an event listener to catch activation state
                    Using FileSavePicker will suspend the app and it's required to catch the pickSaveFileContinuation
                    https://msdn.microsoft.com/en-us/library/windows/apps/xaml/dn631755.aspx
                */
                var cameraActivationHandler = function(eventArgs) {
                    if (eventArgs.kind === Windows.ApplicationModel.Activation.ActivationKind.pickSaveFileContinuation) {
                        var file = eventArgs.file;
                        if (file) {
                            // Prevent updates to the remote version of the file until we're done
                            Windows.Storage.CachedFileManager.deferUpdates(file);
                            capturedFile.moveAndReplaceAsync(file)
                                .then(function() {
                                    // Let Windows know that we're finished changing the file so
                                    // the other app can update the remote version of the file.
                                    return Windows.Storage.CachedFileManager.completeUpdatesAsync(file);
                                })
                                .done(function(updateStatus) {
                                        if (updateStatus === Windows.Storage.Provider.FileUpdateStatus.complete) {
                                            success(capturedFile);
                                        } else {
                                            errorCallback();
                                        }
                                }, errorCallback);
                        } else {
                            errorCallback();
                        }
                        Windows.UI.WebUI.WebUIApplication.removeEventListener("activated", cameraActivationHandler);
                    }
                };

                var savePicker = new Windows.Storage.Pickers.FileSavePicker();
                savePicker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.documentsLibrary;
                if (encodingType === Camera.EncodingType.PNG) {
                    savePicker.fileTypeChoices.insert("PNG", [".png"]);
                } else {
                    savePicker.fileTypeChoices.insert("JPEG", [".jpg"]);
                }
                savePicker.suggestedFileName = fileName;
                Windows.UI.WebUI.WebUIApplication.addEventListener("activated", cameraActivationHandler);
                savePicker.pickSaveFileAndContinue();
            }, function(err) {
                    destroyCameraPreview();
                    errorCallback(err);
            });
    };

    try {
        createCameraUI();
        startCameraPreview();
    } catch (ex) {
        errorCallback(ex);
    }
}

function takePictureFromCameraWindows(successCallback, errorCallback, args) {
    var destinationType = args[1],
        targetWidth = args[3],
        targetHeight = args[4],
        encodingType = args[5],
        allowCrop = !!args[7],
        saveToPhotoAlbum = args[9],
        cameraCaptureUI = new Windows.Media.Capture.CameraCaptureUI();
    cameraCaptureUI.photoSettings.allowCropping = allowCrop;

    if (encodingType == Camera.EncodingType.PNG) {
        cameraCaptureUI.photoSettings.format = Windows.Media.Capture.CameraCaptureUIPhotoFormat.png;
    } else {
        cameraCaptureUI.photoSettings.format = Windows.Media.Capture.CameraCaptureUIPhotoFormat.jpeg;
    }

    // decide which max pixels should be supported by targetWidth or targetHeight.
    if (targetWidth >= 1280 || targetHeight >= 960) {
        cameraCaptureUI.photoSettings.maxResolution = Windows.Media.Capture.CameraCaptureUIMaxPhotoResolution.large3M;
    } else if (targetWidth >= 1024 || targetHeight >= 768) {
        cameraCaptureUI.photoSettings.maxResolution = Windows.Media.Capture.CameraCaptureUIMaxPhotoResolution.mediumXga;
    } else if (targetWidth >= 800 || targetHeight >= 600) {
        cameraCaptureUI.photoSettings.maxResolution = Windows.Media.Capture.CameraCaptureUIMaxPhotoResolution.mediumXga;
    } else if (targetWidth >= 640 || targetHeight >= 480) {
        cameraCaptureUI.photoSettings.maxResolution = Windows.Media.Capture.CameraCaptureUIMaxPhotoResolution.smallVga;
    } else if (targetWidth >= 320 || targetHeight >= 240) {
        cameraCaptureUI.photoSettings.maxResolution = Windows.Media.Capture.CameraCaptureUIMaxPhotoResolution.verySmallQvga;
    } else {
        cameraCaptureUI.photoSettings.maxResolution = Windows.Media.Capture.CameraCaptureUIMaxPhotoResolution.highestAvailable;
    }

    cameraCaptureUI.captureFileAsync(Windows.Media.Capture.CameraCaptureUIMode.photo).done(function(picture) {
        if (!picture) {
            errorCallback("User didn't capture a photo.");
            return;
        }

        // save to photo album successCallback
        var success = function() {
            if (destinationType == Camera.DestinationType.FILE_URI) {
                if (targetHeight > 0 && targetWidth > 0) {
                    resizeImage(successCallback, errorCallback, picture, targetWidth, targetHeight, encodingType);
                } else {
                    var storageFolder = Windows.Storage.ApplicationData.current.localFolder;
                    picture.copyAsync(storageFolder, picture.name, Windows.Storage.NameCollisionOption.replaceExisting).done(function(storageFile) {
                        successCallback("ms-appdata:///local/" + storageFile.name);
                    }, errorCallback);
                }
            } else {
                if (targetHeight > 0 && targetWidth > 0) {
                    resizeImageBase64(successCallback, errorCallback, picture, targetWidth, targetHeight);
                } else {
                    Windows.Storage.FileIO.readBufferAsync(picture).done(function(buffer) {
                        var strBase64 = Windows.Security.Cryptography.CryptographicBuffer.encodeToBase64String(buffer);
                        successCallback(strBase64);
                    }, errorCallback);
                }
            }
        };

        // save to photo album errorCallback
        var fail = function() {
            //errorCallback("FileError, code:" + fileError.code);
            errorCallback("Save fail.");
        };

        if (!saveToPhotoAlbum) {
            success();
            return;
        }

        var savePicker = new Windows.Storage.Pickers.FileSavePicker();

        savePicker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.documentsLibrary;
        if (encodingType === Camera.EncodingType.PNG) {
            savePicker.fileTypeChoices.insert("PNG", [".png"]);
            savePicker.suggestedFileName = "photo.png";
        } else {
            savePicker.fileTypeChoices.insert("JPEG", [".jpg"]);
            savePicker.suggestedFileName = "photo.jpg";
        }

        savePicker.pickSaveFileAsync()
            .done(function(file) {
                if (file) {
                    // Prevent updates to the remote version of the file until we're done
                    Windows.Storage.CachedFileManager.deferUpdates(file);
                    picture.moveAndReplaceAsync(file)
                        .then(function() {
                            // Let Windows know that we're finished changing the file so
                            // the other app can update the remote version of the file.
                            return Windows.Storage.CachedFileManager.completeUpdatesAsync(file);
                        })
                        .done(function(updateStatus) {
                            if (updateStatus === Windows.Storage.Provider.FileUpdateStatus.complete) {
                                success();
                            } else {
                                fail();
                            }
                        }, fail);
                } else {
                    fail();
                }
            }, fail);
    }, function() {
        errorCallback("Fail to capture a photo.");
    });
}

require("cordova/exec/proxy").add("Camera",module.exports);
