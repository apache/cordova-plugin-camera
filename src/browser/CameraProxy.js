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

let localMediaStream;

function takePicture (successCallback, errorCallback, opts) {
    if (opts && opts[2] === 1) {
        capture(successCallback, errorCallback, opts);
    } else {
        const customSourceInput = opts[15];

        let sourceInput = customSourceInput ? document.getElementById(customSourceInput) : createSourceInput();

        handleSourceInput(successCallback, sourceInput);

        if (!customSourceInput) {
            document.body.appendChild(sourceInput);
        }
    }
}

function capture (successCallback, errorCallback, opts) {
    let targetWidth = opts[3];
    let targetHeight = opts[4];
    const customCameraContainer = opts[12];
    const customCaptureButton = opts[13];
    const customCancelButton = opts[14];

    let parent = customCameraContainer ? document.getElementById(customCameraContainer) : createCameraContainer();
    let video = createVideoStreamContainer(parent, targetWidth, targetHeight);
    let captureButton = customCaptureButton ? document.getElementById(customCaptureButton) : createButton(parent, 'Capture');
    let cancelButton = customCancelButton ? document.getElementById(customCancelButton) : createButton(parent, 'Cancel');

    // start video stream
    startLocalMediaStream(errorCallback, video);

    // if custom camera container is not set by the user,
    // append parent to the document.body
    if (!customCameraContainer) {
        document.body.appendChild(video.parentNode);
    }

    // handle button click events
    handleCaptureButton(successCallback, errorCallback, captureButton, video, customCameraContainer);
    handleCancelButton(cancelButton, video, customCameraContainer);
}

function createCameraContainer () {
    let parent = document.createElement('div');
    parent.style.position = 'relative';
    parent.style.zIndex = '2147483647'; // set highest possible z index
    parent.className = 'cordova-camera-capture';

    return parent;
}

function createVideoStreamContainer (parent, targetWidth, targetHeight) {
    targetWidth = targetWidth === -1 ? 320 : targetWidth;
    targetHeight = targetHeight === -1 ? 240 : targetHeight;

    let video = document.createElement('video');
    video.width = targetWidth;
    video.height = targetHeight;

    parent.appendChild(video);

    return video;
}

function createButton (parent, innerText) {
    let button = document.createElement('button');
    button.innerHTML = innerText;

    parent.appendChild(button);

    return button;
}

function handleCaptureButton (successCallback, errorCallback, captureButton, video, customCameraContainer) {
    captureButton.onclick = function () {
        // create a canvas and capture a frame from video stream
        let canvas = document.createElement('canvas');
        canvas.width = video.width;
        canvas.height = video.height;
        canvas.getContext('2d').drawImage(video, 0, 0, video.width, video.height);

        // convert image stored in canvas to base64 encoded image
        let imageData = canvas.toDataURL('image/png');
        imageData = imageData.replace('data:image/png;base64,', '');

        // stop video stream
        stopLocalMediaStream(video, customCameraContainer);

        return successCallback(imageData);
    };
}

function handleCancelButton (cancelButton, video, customCameraContainer) {
    cancelButton.onclick = function () {
        // stop video stream
        stopLocalMediaStream(video, customCameraContainer);
    };
}

function startLocalMediaStream (errorCallback, video) {

    const successCallback = function (stream) {
        localMediaStream = stream;
        video.src = window.URL.createObjectURL(localMediaStream);
        video.play();
    };

    navigator.getUserMedia = navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia;

    if (navigator.getUserMedia) {
        navigator.getUserMedia({video: true, audio: true}, successCallback, errorCallback);
    } else {
        alert('Your browser does not support camera.');
    }
}

function stopLocalMediaStream (video, customCameraContainer) {
    // stop video stream, remove video and captureButton.
    // note: MediaStream.stop() is deprecated as of Chrome 47.
    if (localMediaStream.stop) {
        localMediaStream.stop();
    } else {
        localMediaStream.getTracks().forEach(function (track) {
            track.stop();
        });
    }

    // remove newly created elements
    removeAppendedCameraElements(video, customCameraContainer);
}

function removeAppendedCameraElements (video, customCameraContainer) {
    const parent = video.parentNode;
    if (!customCameraContainer) {
        parent.parentNode.removeChild(parent);
    } else {
        parent.removeChild(video);
    }
}

function createSourceInput () {
    let input = document.createElement('input');
    input.style.position = 'relative';
    input.style.zIndex = '2147483647'; // set highest possible z index
    input.className = 'cordova-camera-select';
    input.type = 'file';
    input.name = 'files[]';

    return input;
}

function handleSourceInput (successCallback, sourceInput) {
    sourceInput.onchange = function (inputEvent) {
        let reader = new FileReader(); /* eslint no-undef : 0 */
        reader.onload = function (readerEvent) {
            sourceInput.parentNode.removeChild(sourceInput);

            const imageData = readerEvent.target.result;

            return successCallback(imageData.substr(imageData.indexOf(',') + 1));
        };
        reader.readAsDataURL(inputEvent.target.files[0]);
    };
}

module.exports = {
    takePicture: takePicture,
    cleanup: function () {}
};

require('cordova/exec/proxy').add('Camera', module.exports);
