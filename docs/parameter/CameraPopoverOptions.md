---
license: Licensed to the Apache Software Foundation (ASF) under one
         or more contributor license agreements.  See the NOTICE file
         distributed with this work for additional information
         regarding copyright ownership.  The ASF licenses this file
         to you under the Apache License, Version 2.0 (the
         "License"); you may not use this file except in compliance
         with the License.  You may obtain a copy of the License at

           http://www.apache.org/licenses/LICENSE-2.0

         Unless required by applicable law or agreed to in writing,
         software distributed under the License is distributed on an
         "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
         KIND, either express or implied.  See the License for the
         specific language governing permissions and limitations
         under the License.
---

CameraPopoverOptions
====================

Parameters only used by iOS to specify the anchor element location and arrow direction of popover used on iPad when selecting images from the library or album.

    { x : 0, 
      y :  32,
      width : 320,
      height : 480,
      arrowDir : Camera.PopoverArrowDirection.ARROW_ANY
    };

CameraPopoverOptions
--------------------

- __x:__ x pixel coordinate of element on the screen to anchor popover onto. (`Number`)

- __y:__ y pixel coordinate of element on the screen to anchor popover onto. (`Number`)

- __width:__ width, in pixels, of the element on the screen to anchor popover onto. (`Number`)

- __height:__ height, in pixels, of the element on the screen to anchor popover onto. (`Number`)

- __arrowDir:__ Direction the arrow on the popover should point.  Defined in Camera.PopoverArrowDirection (`Number`)
        
            Camera.PopoverArrowDirection = {
                ARROW_UP : 1,        // matches iOS UIPopoverArrowDirection constants
                ARROW_DOWN : 2,
                ARROW_LEFT : 4,
                ARROW_RIGHT : 8,
                ARROW_ANY : 15
            };
  
Note that the size of the popover may change to adjust to the direction of the arrow and orientation of the screen.  Make sure to account for orientation changes when specifying the anchor element location. 

Quick Example
-------------

     var popover = new CameraPopoverOptions(300,300,100,100,Camera.PopoverArrowDirection.ARROW_ANY);
     var options = { quality: 50, destinationType: Camera.DestinationType.DATA_URL,sourceType: Camera.PictureSource.SAVEDPHOTOALBUM, popoverOptions : popover };
     
     navigator.camera.getPicture(onSuccess, onFail, options);
     
     function onSuccess(imageData) {
        var image = document.getElementById('myImage');
        image.src = "data:image/jpeg;base64," + imageData;
    }

    function onFail(message) {
        alert('Failed because: ' + message);
    }
     
