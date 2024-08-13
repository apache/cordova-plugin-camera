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

/* globals Camera, resolveLocalFileSystemURL, FileEntry, CameraPopoverOptions, LocalFileSystem */
/* eslint-env jasmine */

exports.defineAutoTests = function () {
    describe('Camera (navigator.camera)', function () {
        it('should exist', function () {
            expect(navigator.camera).toBeDefined();
        });

        it('should contain a getPicture function', function () {
            expect(navigator.camera.getPicture).toBeDefined();
            expect(typeof navigator.camera.getPicture === 'function').toBe(true);
        });
    });

    describe('Camera Constants (window.Camera + navigator.camera)', function () {
        it('camera.spec.1 window.Camera should exist', function () {
            expect(window.Camera).toBeDefined();
        });

        it('camera.spec.2 should contain three DestinationType constants', function () {
            expect(Camera.DestinationType.DATA_URL).toBe(0);
            expect(Camera.DestinationType.FILE_URI).toBe(1);
            expect(navigator.camera.DestinationType.DATA_URL).toBe(0);
            expect(navigator.camera.DestinationType.FILE_URI).toBe(1);
        });

        it('camera.spec.3 should contain two EncodingType constants', function () {
            expect(Camera.EncodingType.JPEG).toBe(0);
            expect(Camera.EncodingType.PNG).toBe(1);
            expect(navigator.camera.EncodingType.JPEG).toBe(0);
            expect(navigator.camera.EncodingType.PNG).toBe(1);
        });

        it('camera.spec.4 should contain three MediaType constants', function () {
            expect(Camera.MediaType.PICTURE).toBe(0);
            expect(Camera.MediaType.VIDEO).toBe(1);
            expect(Camera.MediaType.ALLMEDIA).toBe(2);
            expect(navigator.camera.MediaType.PICTURE).toBe(0);
            expect(navigator.camera.MediaType.VIDEO).toBe(1);
            expect(navigator.camera.MediaType.ALLMEDIA).toBe(2);
        });

        it('camera.spec.5 should contain three PictureSourceType constants', function () {
            expect(Camera.PictureSourceType.PHOTOLIBRARY).toBe(0);
            expect(Camera.PictureSourceType.CAMERA).toBe(1);
            expect(Camera.PictureSourceType.SAVEDPHOTOALBUM).toBe(2);
            expect(navigator.camera.PictureSourceType.PHOTOLIBRARY).toBe(0);
            expect(navigator.camera.PictureSourceType.CAMERA).toBe(1);
            expect(navigator.camera.PictureSourceType.SAVEDPHOTOALBUM).toBe(2);
        });
    });
};

/******************************************************************************/
/******************************************************************************/
/******************************************************************************/

exports.defineManualTests = function (contentEl, createActionButton) {
    let pictureUrl = null;
    let fileObj = null;
    let fileEntry = null;
    const pageStartTime = +new Date();

    // default camera options
    const camQualityDefault = ['50', 50];
    const camDestinationTypeDefault = ['FILE_URI', 1];
    const camPictureSourceTypeDefault = ['CAMERA', 1];
    const camAllowEditDefault = ['allowEdit', false];
    const camEncodingTypeDefault = ['JPEG', 0];
    const camMediaTypeDefault = ['mediaType', 0];
    const camCorrectOrientationDefault = ['correctOrientation', false];
    const camSaveToPhotoAlbumDefault = ['saveToPhotoAlbum', true];

    function log (value) {
        console.log(value);
        document.getElementById('camera_status').textContent += (new Date() - pageStartTime) / 1000 + ': ' + value + '\n';
    }

    function clearStatus () {
        document.getElementById('camera_status').innerHTML = '';
        document.getElementById('camera_image').src = 'about:blank';
        const canvas = document.getElementById('canvas');
        canvas.width = canvas.height = 1;
        pictureUrl = null;
        fileObj = null;
        fileEntry = null;
    }

    function setPicture (url, callback) {
        try {
            window.atob(url);
            // if we got here it is a base64 string (DATA_URL)
            url = 'data:image/jpeg;base64,' + url;
        } catch (e) {
            // not DATA_URL
        }
        log('URL: "' + url.slice(0, 90) + '"');

        pictureUrl = url;
        const img = document.getElementById('camera_image');
        const startTime = new Date();
        img.src = url;
        img.onload = function () {
            log('Img size: ' + img.naturalWidth + 'x' + img.naturalHeight);
            log('Image tag load time: ' + (new Date() - startTime));
            if (callback) {
                callback();
            }
        };
    }

    function onGetPictureError (e) {
        log('Error getting picture: ' + (e.code || e));
    }

    function getPictureWin (data) {
        setPicture(data);
        // TODO: Fix resolveLocalFileSystemURI to work with native-uri.
        if (pictureUrl.indexOf('file:') === 0 || pictureUrl.indexOf('content:') === 0) {
            resolveLocalFileSystemURL(data, function (e) {
                fileEntry = e;
                logCallback('resolveLocalFileSystemURL()', true)(e.toURL());
                readFile();
            }, logCallback('resolveLocalFileSystemURL()', false));
        } else if (pictureUrl.indexOf('data:image/jpeg;base64') === 0) {
            // do nothing
        } else {
            const path = pictureUrl.replace(/^file:\/\/(localhost)?/, '').replace(/%20/g, ' ');
            fileEntry = new FileEntry('image_name.png', path);
        }
    }

    function getPicture () {
        clearStatus();
        const options = extractOptions();
        log('Getting picture with options: ' + JSON.stringify(options));
        const popoverHandle = navigator.camera.getPicture(getPictureWin, onGetPictureError, options);

        // Reposition the popover if the orientation changes.
        window.onorientationchange = function () {
            const newPopoverOptions = new CameraPopoverOptions(0, 0, 100, 100, 0, 300, 400);
            popoverHandle.setPosition(newPopoverOptions);
        };
    }

    function logCallback (apiName, success) {
        return function () {
            log('Call to ' + apiName + (success ? ' success: ' : ' failed: ') + JSON.stringify([].slice.call(arguments)));
        };
    }

    /**
     * Select image from library
     * This calls FileEntry.getMetadata, FileEntry.setMetadata, FileEntry.getParent, FileEntry.file, and FileReader.readAsDataURL.
     */
    function readFile () {
        function onFileReadAsDataURL (evt) {
            const img = document.getElementById('camera_image');
            img.style.visibility = 'visible';
            img.style.display = 'block';
            img.src = evt.target.result;
            log('FileReader.readAsDataURL success');
        }

        function onFileReceived (file) {
            log('Got file: ' + JSON.stringify(file));
            fileObj = file;
            /* eslint-disable no-undef */
            const reader = new FileReader();
            /* eslint-enable no-undef */
            reader.onload = function () {
                log('FileReader.readAsDataURL() - length = ' + reader.result.length);
            };
            reader.onerror = logCallback('FileReader.readAsDataURL', false);
            reader.onloadend = onFileReadAsDataURL;
            reader.readAsDataURL(file);
        }

        // Test out onFileReceived when the file object was set via a native <input> elements.
        if (fileObj) {
            onFileReceived(fileObj);
        } else {
            fileEntry.file(onFileReceived, logCallback('FileEntry.file', false));
        }
    }

    function getFileInfo () {
        // Test FileEntry API here.
        fileEntry.getMetadata(logCallback('FileEntry.getMetadata', true), logCallback('FileEntry.getMetadata', false));
        fileEntry.setMetadata(logCallback('FileEntry.setMetadata', true), logCallback('FileEntry.setMetadata', false), { 'com.apple.MobileBackup': 1 });
        fileEntry.getParent(logCallback('FileEntry.getParent', true), logCallback('FileEntry.getParent', false));
        fileEntry.getParent(logCallback('FileEntry.getParent', true), logCallback('FileEntry.getParent', false));
    }

    /**
     * Copy image from library
     * This calls FileEntry.copyTo and FileEntry.moveTo.
     */
    function copyImage () {
        const onFileSystemReceived = function (fileSystem) {
            const destDirEntry = fileSystem.root;
            const origName = fileEntry.name;

            // Test FileEntry API here.
            fileEntry.copyTo(destDirEntry, 'copied_file.png', logCallback('FileEntry.copyTo', true), logCallback('FileEntry.copyTo', false));
            fileEntry.moveTo(destDirEntry, 'moved_file.png', logCallback('FileEntry.moveTo', true), logCallback('FileEntry.moveTo', false));

            // cleanup
            // rename moved file back to original name so other tests can reference image
            resolveLocalFileSystemURL(destDirEntry.nativeURL + 'moved_file.png', function (fileEntry) {
                fileEntry.moveTo(destDirEntry, origName, logCallback('FileEntry.moveTo', true), logCallback('FileEntry.moveTo', false));
                console.log('Cleanup: successfully renamed file back to original name');
            }, function () {
                console.log('Cleanup: failed to rename file back to original name');
            });

            // remove copied file
            resolveLocalFileSystemURL(destDirEntry.nativeURL + 'copied_file.png', function (fileEntry) {
                fileEntry.remove(logCallback('FileEntry.remove', true), logCallback('FileEntry.remove', false));
                console.log('Cleanup: successfully removed copied file');
            }, function () {
                console.log('Cleanup: failed to remove copied file');
            });
        };

        window.requestFileSystem(LocalFileSystem.TEMPORARY, 0, onFileSystemReceived, null);
    }

    /**
     * Write image to library
     * This calls FileEntry.createWriter, FileWriter.write, and FileWriter.truncate.
     */
    function writeImage () {
        const onFileWriterReceived = function (fileWriter) {
            fileWriter.onwrite = logCallback('FileWriter.write', true);
            fileWriter.onerror = logCallback('FileWriter.write', false);
            fileWriter.write('some text!');
        };

        const onFileTruncateWriterReceived = function (fileWriter) {
            fileWriter.onwrite = logCallback('FileWriter.truncate', true);
            fileWriter.onerror = logCallback('FileWriter.truncate', false);
            fileWriter.truncate(10);
        };

        fileEntry.createWriter(onFileWriterReceived, logCallback('FileEntry.createWriter', false));
        fileEntry.createWriter(onFileTruncateWriterReceived, null);
    }

    function displayImageUsingCanvas () {
        const canvas = document.getElementById('canvas');
        const img = document.getElementById('camera_image');
        let w = img.width;
        let h = img.height;
        h = 100 / w * h;
        w = 100;
        canvas.width = w;
        canvas.height = h;
        const context = canvas.getContext('2d');
        context.drawImage(img, 0, 0, w, h);
    }

    /**
     * Remove image from library
     * This calls FileEntry.remove.
     */
    function removeImage () {
        fileEntry.remove(logCallback('FileEntry.remove', true), logCallback('FileEntry.remove', false));
    }

    function testInputTag (inputEl) {
        clearStatus();
        // iOS 6 likes to dead-lock in the onchange context if you
        // do any alerts or try to remote-debug.
        window.setTimeout(function () {
            testNativeFile2(inputEl);
        }, 0);
    }

    function testNativeFile2 (inputEl) {
        /* eslint-disable no-undef */
        if (!inputEl.value) {
            alert('No file selected.');
            return;
        }
        fileObj = inputEl.files[0];
        if (!fileObj) {
            alert('Got value but no file.');
            return;
        }
        /* eslint-enable no-undef */
        const URLApi = window.URL || window.webkitURL;
        if (URLApi) {
            const blobURL = URLApi.createObjectURL(fileObj);
            if (blobURL) {
                setPicture(blobURL, function () {
                    URLApi.revokeObjectURL(blobURL);
                });
            } else {
                log('URL.createObjectURL returned null');
            }
        } else {
            log('URL.createObjectURL() not supported.');
        }
    }

    function extractOptions () {
        const els = document.querySelectorAll('#image-options select');
        const ret = {};
        /* eslint-disable no-cond-assign */
        for (let i = 0, el; el = els[i]; ++i) {
            let value = el.value;
            if (value === '') continue;
            value = +value;

            if (el.isBool) {
                ret[el.getAttribute('name')] = !!value;
            } else {
                ret[el.getAttribute('name')] = value;
            }
        }
        /* eslint-enable no-cond-assign */
        return ret;
    }

    function createOptionsEl (name, values, selectionDefault) {
        const openDiv = '<div style="display: inline-block">' + name + ': ';
        const select = '<select name=' + name + ' id="' + name + '">';

        let defaultOption = '';
        if (selectionDefault === undefined) {
            defaultOption = '<option value="">default</option>';
        }

        let options = '';
        if (typeof values === 'boolean') {
            values = { true: 1, false: 0 };
        }
        for (const k in values) {
            let isSelected = '';
            if (selectionDefault) {
                if (selectionDefault[0] === k) {
                    isSelected = 'selected';
                }
            }
            options += '<option value="' + values[k] + '" ' + isSelected + '>' + k + '</option>';
        }

        const closeDiv = '</select></div>';

        return openDiv + select + defaultOption + options + closeDiv;
    }

    /******************************************************************************/

    const info_div = '<h1>Camera</h1>' +
            '<div id="info">' +
            '<b>Status:</b> <div id="camera_status"></div>' +
            'img: <img width="100" id="camera_image">' +
            'canvas: <canvas id="canvas" width="1" height="1"></canvas>' +
            '</div>';
    const options_div = '<h2>Cordova Camera API Options</h2>' +
            '<div id="image-options">' +
            createOptionsEl('sourceType', Camera.PictureSourceType, camPictureSourceTypeDefault) +
            createOptionsEl('destinationType', Camera.DestinationType, camDestinationTypeDefault) +
            createOptionsEl('encodingType', Camera.EncodingType, camEncodingTypeDefault) +
            createOptionsEl('mediaType', Camera.MediaType, camMediaTypeDefault) +
            createOptionsEl('quality', { 0: 0, 50: 50, 80: 80, 100: 100 }, camQualityDefault) +
            createOptionsEl('targetWidth', { 50: 50, 200: 200, 800: 800, 2048: 2048 }) +
            createOptionsEl('targetHeight', { 50: 50, 200: 200, 800: 800, 2048: 2048 }) +
            createOptionsEl('allowEdit', true, camAllowEditDefault) +
            createOptionsEl('correctOrientation', true, camCorrectOrientationDefault) +
            createOptionsEl('saveToPhotoAlbum', true, camSaveToPhotoAlbumDefault) +
            createOptionsEl('cameraDirection', Camera.Direction) +
            '</div>';
    const getpicture_div = '<div id="getpicture"></div>';
    const test_procedure = '<h4>Recommended Test Procedure</h4>' +
            'Options not specified should be the default value' +
            '<br>Status box should update with image and info whenever an image is taken or selected from library' +
            '</p><div style="background:#B0C4DE;border:1px solid #FFA07A;margin:15px 6px 0px;min-width:295px;max-width:97%;padding:4px 0px 2px 10px;min-height:160px;max-height:200px;overflow:auto">' +
            '<ol> <li>All default options. Should be able to edit once picture is taken and will be saved to library.</li>' +
            '</p><li>sourceType=PHOTOLIBRARY<br>Should be able to see picture that was just taken in previous test and edit when selected</li>' +
            '</p><li>sourceType=Camera<br>allowEdit=false<br>saveToPhotoAlbum=false<br>Should not be able to edit when taken and will not save to library</li>' +
            '</p><li>encodingType=PNG<br>allowEdit=true<br>saveToPhotoAlbum=true<br>cameraDirection=FRONT<br>Should bring up front camera. Verify in status box info URL that image is encoded as PNG.</li>' +
            '</p><li>sourceType=SAVEDPHOTOALBUM<br>mediaType=VIDEO<br>Should only be able to select a video</li>' +
            '</p><li>sourceType=SAVEDPHOTOALBUM<br>mediaType=PICTURE<br>allowEdit=false<br>Should only be able to select a picture and not edit</li>' +
            '</p><li>sourceType=PHOTOLIBRARY<br>mediaType=ALLMEDIA<br>allowEdit=true<br>Should be able to select pics and videos and edit picture if selected</li>' +
            '</p><li>sourceType=CAMERA<br>targetWidth & targetHeight=50<br>allowEdit=false<br>Do Get File Metadata test below and take note of size<br>Repeat test but with width and height=800. Size should be significantly larger.</li>' +
            '</p><li>quality=0<br>targetWidth & targetHeight=default<br>allowEdit=false<br>Do Get File Metadata test below and take note of size<br>Repeat test but with quality=80. Size should be significantly larger.</li>' +
            '</ol></div>';
    const inputs_div = '<h2>Native File Inputs</h2>' +
            'For the following tests, status box should update with file selected' +
            '</p><div>input type=file <input type="file" class="testInputTag"></div>' +
            '<div>capture=camera <input type="file" accept="image/*;capture=camera" class="testInputTag"></div>' +
            '<div>capture=camcorder <input type="file" accept="video/*;capture=camcorder" class="testInputTag"></div>' +
            '<div>capture=microphone <input type="file" accept="audio/*;capture=microphone" class="testInputTag"></div>';
    const actions_div = '<h2>Actions</h2>' +
            'For the following tests, ensure that an image is set in status box' +
            '</p><div id="metadata"></div>' +
            'Expected result: Get metadata about file selected.<br>Status box will show, along with the metadata, "Call to FileEntry.getMetadata success, Call to FileEntry.setMetadata success, Call to FileEntry.getParent success"' +
            '</p><div id="reader"></div>' +
            'Expected result: Read contents of file.<br>Status box will show "Got file: {some metadata}, FileReader.readAsDataURL() - length = someNumber"' +
            '</p><div id="copy"></div>' +
            'Expected result: Copy image to new location and move file to different location.<br>Status box will show "Call to FileEntry.copyTo success:{some metadata}, Call to FileEntry.moveTo success:{some metadata}"' +
            '</p><div id="write"></div>' +
            'Expected result: Write image to library.<br>Status box will show "Call to FileWriter.write success:{some metadata}, Call to FileWriter.truncate success:{some metadata}"' +
            '</p><div id="upload"></div>' +
            'Expected result: Upload image to server.<br>Status box may print out progress. Once finished will show "upload complete"' +
            '</p><div id="draw_canvas"></div>' +
            'Expected result: Display image using canvas.<br>Image will be displayed in status box under "canvas:"' +
            '</p><div id="remove"></div>' +
            'Expected result: Remove image from library.<br>Status box will show "FileEntry.remove success:["OK"]';

    contentEl.innerHTML = info_div + options_div + getpicture_div + test_procedure + inputs_div + actions_div;

    const elements = document.getElementsByClassName('testInputTag');
    const listener = function (e) {
        testInputTag(e.target);
    };
    for (let i = 0; i < elements.length; ++i) {
        const item = elements[i];
        item.addEventListener('change', listener, false);
    }

    createActionButton('Get picture', function () {
        getPicture();
    }, 'getpicture');

    createActionButton('Clear Status', function () {
        clearStatus();
    }, 'getpicture');

    createActionButton('Get File Metadata', function () {
        getFileInfo();
    }, 'metadata');

    createActionButton('Read with FileReader', function () {
        readFile();
    }, 'reader');

    createActionButton('Copy Image', function () {
        copyImage();
    }, 'copy');

    createActionButton('Write Image', function () {
        writeImage();
    }, 'write');

    createActionButton('Draw Using Canvas', function () {
        displayImageUsingCanvas();
    }, 'draw_canvas');

    createActionButton('Remove Image', function () {
        removeImage();
    }, 'remove');
};
