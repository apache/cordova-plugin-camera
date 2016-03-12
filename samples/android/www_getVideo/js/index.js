/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        parentElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },
    getVideo: function(){
        //get camera options dynamically
        var cameraOptions = {};
        $('.option input').each(function(){
            var inputType = $(this).attr('type');
            var inputName = $(this).attr('name');
            var inputValue = $(this).val();
            var cameraObjectProp = $(this).data('camera');

            //for radio type, get selected value.
            if(inputType == 'radio') inputValue = $('input[name="'+ inputName +'"]:checked').val();

            if(cameraObjectProp) cameraOptions[inputName] = Camera[cameraObjectProp][inputValue];
            else cameraOptions[inputName] = parseInt( inputValue );
        });

        //start recording!
        navigator.camera.getVideo(cameraSuccess, cameraError, cameraOptions);

        //video recording success
        function cameraSuccess(video){
            //we should always have the `fileURI` property
            $('#fileURI').text(video.fileURI);

            //optionally, show video thumbnail if returned
            if(video.hasOwnProperty('fileThumb')){
                var fileThumb = document.createElement("IMG");
                fileThumb.src = "data:image/jpeg;base64," + video.fileThumb;
                $('#fileThumb').html(fileThumb);
            }
            else $('#fileThumb').html('-');
        }

        //video recording error
        function cameraError(msg){
            $('.resultPropValue').text(msg);
        }
    }
};

app.initialize();