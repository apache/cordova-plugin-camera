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

var HIGHEST_POSSIBLE_Z_INDEX = 2147483647;

function takePicture (success, error, opts) {
    if (opts && opts[2] === 1) {
        capture(success, error, opts);
    } else {
        var input = document.createElement('input');
        input.style.position = 'relative';
        input.style.zIndex = HIGHEST_POSSIBLE_Z_INDEX;
        input.className = 'cordova-camera-select';
        input.type = 'file';
        input.name = 'files[]';
        input.style.display = 'none';

        input.onchange = function (inputEvent) {
            var reader = new FileReader(); /* eslint no-undef : 0 */
            reader.onload = function (readerEvent) {
                input.parentNode.removeChild(input);

                var imageData = readerEvent.target.result;

                return success(imageData.substr(imageData.indexOf(',') + 1));
            };

            reader.readAsDataURL(inputEvent.target.files[0]);
        };

        document.body.appendChild(input);
        input.click();
    }
}

function capture (success, errorCallback, opts) {
    var localMediaStream;
    var targetWidth = opts[3];
    var targetHeight = opts[4];

    targetWidth = targetWidth === -1 ? 320 : targetWidth;
    targetHeight = targetHeight === -1 ? 240 : targetHeight;

    // Only assign styles if options does not have any set.
    if (typeof opts[10] !== 'object' || !opts[10]) {
        opts[10] = {};
    }

    if (typeof opts[10].audio === 'undefined') {
        opts[10].audio = false;
    }

    var video = document.createElement('video');
    var parent = document.createElement('div');

    parent.className = opts[10].className ? opts[10].className : 'cordova-camera-capture';
    // No custom class, setting default to white background with a video preview and capture.
    if (!opts[10].className) {
        parent.className = 'cordova-camera-capture';
        parent.style.position = 'absolute';
        parent.style.zIndex = HIGHEST_POSSIBLE_Z_INDEX;
        parent.style.height = '100%';
        parent.style.width = '100%';
        parent.style.top = 0;
        parent.style.left = 0;
        parent.style.background = 'white';
    }

    var videoparent = document.createElement('div');
    videoparent.className = 'cordova-camera-capture-content';
    if (opts[10].className) {
        videoparent.className = opts[10].className + '-content';
    }
    videoparent.appendChild(video);
    parent.appendChild(videoparent);

    video.width = targetWidth;
    video.height = targetHeight;

    var buttons = document.createElement('div');
    if (opts[10].className) {
        buttons.className = opts[10].className + '-buttons';
    }

    // If no button is supplied create one.
    var capturebutton = opts[10].capturebutton ? opts[10].capturebutton : document.createElement('button');
    if (!opts[10].capturebutton) {
        capturebutton.type = 'button';
        capturebutton.innerHTML = 'Capture!';
    }

    var cancelbutton = opts[10].cancelbutton ? opts[10].cancelbutton : document.createElement('button');
    if (!opts[10].cancelbutton) {
        cancelbutton.type = 'button';
        cancelbutton.innerHTML = 'Cancel';
    }

    var captureholder = document.createElement('div');
    if (opts[10].className) {
        captureholder.className = opts[10].className + '-button';
    } else {
        captureholder.style.display = 'inline-block';
        captureholder.style.width = '49%';
        captureholder.style.padding = '4px';
        captureholder.style.textAlign = 'center';
    }
    captureholder.appendChild(capturebutton);
    buttons.appendChild(captureholder);

    var cancelholder = document.createElement('div');

    if (opts[10].className) {
        cancelholder.className = opts[10].className + '-button';
    } else {
        cancelholder.style.display = 'inline-block';
        cancelholder.style.width = '49%';
        cancelholder.style.padding = '4px';
        cancelholder.style.textAlign = 'center';
    }
    cancelholder.appendChild(cancelbutton);
    buttons.appendChild(cancelholder);

    parent.appendChild(buttons);

    // If hover is overlaying other elements prevent clicks from propagating.
    parent.onclick = function (e) {
        e.stopPropagation();
    };

    /**
     * Resize hover.
     */
    var resize = function () {
        var buttonsheight = buttons.getBoundingClientRect().height;
        var screenheight = window.innerHeight;
        var maxheight = screenheight - buttonsheight - 22;

        if (maxheight < 100) {
            maxheight = 100;
        }

        video.style.width = '100%';
        video.style.height = 'auto';

        video.style.maxHeight = maxheight + 'px';
        video.className = 'video1';
    };

    /**
     * Stop video, remove event handlers and element nodes.
     */
    var cleanup = function () {
        // Stop video stream, remove video and button.
        // Note that MediaStream.stop() is deprecated as of Chrome 47.
        if (localMediaStream.stop) {
            localMediaStream.stop();
        } else {
            localMediaStream.getTracks().forEach(function (track) {
                track.stop();
            });
        }

        parent.innerHTML = '';
        parent.parentNode.removeChild(parent);
        window.removeEventListener('orientationchange', resize);
        window.removeEventListener('resize', resize);
    };

    cancelbutton.onclick = cleanup;

    capturebutton.onclick = function () {
        // create a canvas and capture a frame from video stream
        var canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        canvas.getContext('2d').drawImage(video, 0, 0, targetWidth, targetHeight);

        // convert image stored in canvas to base64 encoded image
        var imageData = canvas.toDataURL('image/png');
        imageData = imageData.replace('data:image/png;base64,', '');

        // stop video stream, remove video and button.
        // Note that MediaStream.stop() is deprecated as of Chrome 47.
        if (localMediaStream.stop) {
            localMediaStream.stop();
        } else {
            localMediaStream.getTracks().forEach(function (track) {
                track.stop();
            });
        }
        parent.parentNode.removeChild(parent);

        return success(imageData);
    };

    navigator.getUserMedia = navigator.getUserMedia ||
                             navigator.webkitGetUserMedia ||
                             navigator.mozGetUserMedia ||
                             navigator.msGetUserMedia;

    var successCallback = function (stream) {
        localMediaStream = stream;
        if ('srcObject' in video) {
            video.srcObject = localMediaStream;
        } else {
            video.src = window.URL.createObjectURL(localMediaStream);
        }
        video.play();
        document.body.appendChild(parent);

        resize();
        window.addEventListener('orientationchange', resize);
        window.addEventListener('resize', resize);
    };

    if (navigator.getUserMedia) {
        navigator.getUserMedia({video: true, audio: opts[10].audio}, successCallback, errorCallback);
    } else {
        alert('Browser does not support camera :(');
    }
}

module.exports = {
    takePicture: takePicture,
    cleanup: function () {}
};

require('cordova/exec/proxy').add('Camera', module.exports);
