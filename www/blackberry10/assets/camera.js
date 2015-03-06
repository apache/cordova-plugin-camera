/*
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

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('back').onclick = function () {
        window.qnx.callExtensionMethod('org.apache.cordova.camera', 'cancel');
    };
    window.navigator.webkitGetUserMedia(
        { video: true },
        function (stream) {
            var video = document.getElementById('v'),
                canvas = document.getElementById('c'),
                camera = document.getElementById('camera');
            video.autoplay = true;
            video.width = window.innerWidth;
            video.height = window.innerHeight - 100;
            video.src = window.webkitURL.createObjectURL(stream);
            camera.onclick = function () {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                canvas.getContext('2d').drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                window.qnx.callExtensionMethod('org.apache.cordova.camera', canvas.toDataURL('img/png'));
            };
        },
        function () {
            window.qnx.callExtensionMethod('org.apache.cordova.camera', 'error', 'getUserMedia failed');
        }
    );
});
