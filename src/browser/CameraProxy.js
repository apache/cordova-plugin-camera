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

function takePicture(success, error, opts) {
    if (opts && opts[2] === 1) {
        capture(success, error);
    } else {
        var input = document.createElement('input');
        input.style.position = 'relative';
        input.style.zIndex = HIGHEST_POSSIBLE_Z_INDEX;
        input.type = 'file';
        input.name = 'files[]';

        input.onchange = function(inputEvent) {
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

function capture(success, errorCallback) {
    var localMediaStream;

    var video = document.createElement('video');
    var button = document.createElement('button');
    var parent = document.createElement('div');
    parent.style.position = 'relative';
    parent.style.zIndex = HIGHEST_POSSIBLE_Z_INDEX;
    parent.appendChild(video);
    parent.appendChild(button);

    video.width = 320;
    video.height = 240;
    button.innerHTML = 'Capture!';

    button.onclick = function() {
        // create a canvas and capture a frame from video stream
        var canvas = document.createElement('canvas');
        canvas.getContext('2d').drawImage(video, 0, 0, 320, 240);

        // convert image stored in canvas to base64 encoded image
        var imageData = canvas.toDataURL('img/png');
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

    var successCallback = function(stream) {
        localMediaStream = stream;
        video.src = window.URL.createObjectURL(localMediaStream);
        video.play();

        document.body.appendChild(parent);
    };

    if (navigator.getUserMedia) {
        navigator.getUserMedia({video: true, audio: true}, successCallback, errorCallback);
    } else {
        alert('Browser does not support camera :(');
    }
}

module.exports = {
    takePicture: takePicture,
    cleanup: function(){}
};

require("cordova/exec/proxy").add("Camera",module.exports);
