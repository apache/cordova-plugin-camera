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

/*
 * - Added support for the targetWidth and targetHeight options
 * - Added a Cancel button
 * - Used the existing popoverOptions to pass options:
 *
 *      popoverOptions: {
 *          className: 'my-classname',
 *          buttons: [
 *              {text: 'Take photo'},
 *              {text: 'Cancel'}
 *          ]
 *      }
 */

var HIGHEST_POSSIBLE_Z_INDEX = 2147483647;

function takePicture(success, error, opts) {
    if (opts && opts[2] === 1) {
        capture(success, error, opts[10], opts[3], opts[4]);
    } else {
        var input = document.createElement('input');
        input.style.position = 'relative';
        input.style.zIndex = HIGHEST_POSSIBLE_Z_INDEX;
        input.type = 'file';
        input.name = 'files[]';

        input.onchange = function(inputEvent) {
            var canvas = document.createElement('canvas');

            var reader = new FileReader();
            reader.onload = function(readerEvent) {
                input.parentNode.removeChild(input);

                var imageData = readerEvent.target.result;

                return success(imageData.substr(imageData.indexOf(',') + 1));
            };

            reader.readAsDataURL(inputEvent.target.files[0]);
        };

        document.body.appendChild(input);
    }
}

function capture(success, errorCallback, options, targetWidth, targetHeight) {
    var localMediaStream;

    options = options || {};
    targetWidth = targetWidth || 320;
    targetHeight = targetHeight || 240;

    var placeholder = document.createElement('div');

    placeholder.style.position = 'relative';
    placeholder.style.zIndex = HIGHEST_POSSIBLE_Z_INDEX;

    var video = document.createElement('video');
    video.width = targetWidth;
    video.height = targetHeight;

    var controls = document.createElement('div');
    var button1 = document.createElement('button');
    var button2 = document.createElement('button');

    if (Object.prototype.hasOwnProperty.call(options, 'className')) {
        placeholder.className = options.className;
    }

    controls.appendChild(button1);
    controls.appendChild(button2);

    var getButtonText = function(index, defaultValue) {
        return options && options.buttons && options.buttons[index] && options.buttons[index].text ? options.buttons[index].text : defaultValue;
    };

    button1.innerHTML = getButtonText(0, 'Take photo');
    button2.innerHTML = getButtonText(1, 'Cancel');

    placeholder.appendChild(video);
    placeholder.appendChild(controls);

    button2.onclick = function() {
        stopStream(localMediaStream);
        placeholder.parentNode.removeChild(placeholder);
        return errorCallback('');
    }

    button1.onclick = function() {
        // create a canvas and capture a frame from video stream
        var canvas = document.createElement('canvas');

        canvas.width = targetWidth;
        canvas.height = targetHeight;
        var newWidth, newHeight,
            aspect = video.videoHeight / video.videoWidth;
        if (aspect < 1) {
            newWidth = targetWidth;
            newHeight = targetWidth * aspect;
        } else {
            newHeight = targetHeight;
            newWidth = targetHeight * aspect;

        }
        canvas.width = newWidth;
        canvas.height = newHeight;
        canvas.getContext('2d').drawImage(video, 0, 0, video.videoWidth, video.videoHeight, 0, 0, newWidth, newHeight);

        // convert image stored in canvas to base64 encoded image
        var imageData = canvas.toDataURL('img/png');
        imageData = imageData.replace('data:image/png;base64,', '');

        // stop video stream, remove video and button.
        stopStream(localMediaStream);
        placeholder.parentNode.removeChild(placeholder);

        return success(imageData);
    };

    navigator.getUserMedia = navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia;
    var successCallback = function(stream) {
        localMediaStream = stream;
        video.src = window.URL.createObjectURL(localMediaStream);
        video.play();

        document.body.appendChild(placeholder);
    }

    if (navigator.getUserMedia) {
        navigator.getUserMedia({video: true, audio: true}, successCallback, errorCallback);
    } else {
        alert('Browser does not support camera :(');
    }
}

function stopStream(stream) {
    // Note that MediaStream.stop() is deprecated as of Chrome 47.
    if (stream.stop) {
        stream.stop();
    } else {
        stream.getTracks().forEach(function(track) {
            track.stop();
        });
    }
}

module.exports = {
    takePicture: takePicture,
    cleanup: function() {
    }
};

require("cordova/exec/proxy").add("Camera", module.exports);