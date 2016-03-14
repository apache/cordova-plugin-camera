{{>cdv-license~}}

[![Build Status](https://travis-ci.org/apache/cordova-plugin-camera.svg?branch=master)](https://travis-ci.org/apache/cordova-plugin-camera)

# cordova-plugin-camera

This plugin defines a global `navigator.camera` object, which provides an API for taking pictures and for choosing images from
the system's image library.

{{>cdv-header device-ready-warning-obj='navigator.camera' npmName='cordova-plugin-camera' cprName='org.apache.cordova.camera' pluginName='Plugin Camera' repoUrl='https://github.com/apache/cordova-plugin-camera' }}

---

# API Reference

{{#orphans~}}
{{>member-index}}
{{/orphans}}
* [CameraPopoverHandle](#module_CameraPopoverHandle)
* [CameraPopoverOptions](#module_CameraPopoverOptions)

---

{{#modules~}}
{{>header~}}
{{>body~}}
{{>members~}}

---

{{/modules}}

## `camera.getPicture` Errata

#### Example <a name="camera-getPicture-examples"></a>

Take a photo and retrieve it as a Base64-encoded image:

    navigator.camera.getPicture(onSuccess, onFail, { quality: 50,
        destinationType: Camera.DestinationType.DATA_URL
    });

    function onSuccess(imageData) {
        var image = document.getElementById('myImage');
        image.src = "data:image/jpeg;base64," + imageData;
    }

    function onFail(message) {
        alert('Failed because: ' + message);
    }

Take a photo and retrieve the image's file location:

    navigator.camera.getPicture(onSuccess, onFail, { quality: 50,
        destinationType: Camera.DestinationType.FILE_URI });

    function onSuccess(imageURI) {
        var image = document.getElementById('myImage');
        image.src = imageURI;
    }

    function onFail(message) {
        alert('Failed because: ' + message);
    }

#### Preferences (iOS)

-  __CameraUsesGeolocation__ (boolean, defaults to false). For capturing JPEGs, set to true to get geolocation data in the EXIF header. This will trigger a request for geolocation permissions if set to true.

        <preference name="CameraUsesGeolocation" value="false" />

#### Amazon Fire OS Quirks <a name="camera-getPicture-quirks"></a>

Amazon Fire OS uses intents to launch the camera activity on the device to capture
images, and on phones with low memory, the Cordova activity may be killed.  In this
scenario, the image may not appear when the Cordova activity is restored.

#### Android Quirks

Android uses intents to launch the camera activity on the device to capture
images, and on phones with low memory, the Cordova activity may be killed.  In this
scenario, the result from the plugin call will be delivered via the resume event.
See [the Android Lifecycle guide][android_lifecycle]
for more information. The `pendingResult.result` value will contain the value that
would be passed to the callbacks (either the URI/URL or an error message). Check
the `pendingResult.pluginStatus` to determine whether or not the call was
successful.

#### Browser Quirks

Can only return photos as Base64-encoded image.

#### Firefox OS Quirks

Camera plugin is currently implemented using [Web Activities][web_activities].

#### iOS Quirks

Including a JavaScript `alert()` in either of the callback functions
can cause problems.  Wrap the alert within a `setTimeout()` to allow
the iOS image picker or popover to fully close before the alert
displays:

    setTimeout(function() {
        // do your thing here!
    }, 0);

#### Windows Phone 7 Quirks

Invoking the native camera application while the device is connected
via Zune does not work, and triggers an error callback.

#### Tizen Quirks

Tizen only supports a `destinationType` of
`Camera.DestinationType.FILE_URI` and a `sourceType` of
`Camera.PictureSourceType.PHOTOLIBRARY`.


## `CameraOptions` Errata <a name="CameraOptions-quirks"></a>

#### Amazon Fire OS Quirks

- Any `cameraDirection` value results in a back-facing photo.

- Ignores the `allowEdit` parameter.

- `Camera.PictureSourceType.PHOTOLIBRARY` and `Camera.PictureSourceType.SAVEDPHOTOALBUM` both display the same photo album.

#### Android Quirks

- Any `cameraDirection` value results in a back-facing photo.

- **`allowEdit` is unpredictable on Android and it should not be used!** The Android implementation of this plugin tries to find and use an application on the user's device to do image cropping. The plugin has no control over what application the user selects to perform the image cropping and it is very possible that the user could choose an incompatible option and cause the plugin to fail. This sometimes works because most devices come with an application that handles cropping in a way that is compatible with this plugin (Google Plus Photos), but it is unwise to rely on that being the case. If image editing is essential to your application, consider seeking a third party library or plugin that provides its own image editing utility for a more robust solution.

- `Camera.PictureSourceType.PHOTOLIBRARY` and `Camera.PictureSourceType.SAVEDPHOTOALBUM` both display the same photo album.

- Ignores the `encodingType` parameter if the image is unedited (i.e. `quality` is 100, `correctOrientation` is false, and no `targetHeight` or `targetWidth` are specified). The `CAMERA` source will always return the JPEG file given by the native camera and the `PHOTOLIBRARY` and `SAVEDPHOTOALBUM` sources will return the selected file in its existing encoding.

#### BlackBerry 10 Quirks

- Ignores the `quality` parameter.

- Ignores the `allowEdit` parameter.

- `Camera.MediaType` is not supported.

- Ignores the `correctOrientation` parameter.

- Ignores the `cameraDirection` parameter.

#### Firefox OS Quirks

- Ignores the `quality` parameter.

- `Camera.DestinationType` is ignored and equals `1` (image file URI)

- Ignores the `allowEdit` parameter.

- Ignores the `PictureSourceType` parameter (user chooses it in a dialog window)

- Ignores the `encodingType`

- Ignores the `targetWidth` and `targetHeight`

- `Camera.MediaType` is not supported.

- Ignores the `correctOrientation` parameter.

- Ignores the `cameraDirection` parameter.

#### iOS Quirks

- When using `destinationType.FILE_URI`, photos are saved in the application's temporary directory. The contents of the application's temporary directory is deleted when the application ends.

- When using `destinationType.NATIVE_URI` and `sourceType.CAMERA`, photos are saved in the saved photo album regardless on the value of `saveToPhotoAlbum` parameter.

#### Tizen Quirks

- options not supported

- always returns a FILE URI

#### Windows Phone 7 and 8 Quirks

- Ignores the `allowEdit` parameter.

- Ignores the `correctOrientation` parameter.

- Ignores the `cameraDirection` parameter.

- Ignores the `saveToPhotoAlbum` parameter.  IMPORTANT: All images taken with the WP8/8 Cordova camera API are always copied to the phone's camera roll.  Depending on the user's settings, this could also mean the image is auto-uploaded to their OneDrive.  This could potentially mean the image is available to a wider audience than your app intended. If this is a blocker for your application, you will need to implement the CameraCaptureTask as [documented on MSDN][msdn_wp8_docs]. You may also comment or up-vote the related issue in the [issue tracker][wp8_bug].

- Ignores the `mediaType` property of `cameraOptions` as the Windows Phone SDK does not provide a way to choose videos from PHOTOLIBRARY.

[android_lifecycle]: http://cordova.apache.org/docs/en/dev/guide/platforms/android/lifecycle.html
[web_activities]: https://hacks.mozilla.org/2013/01/introducing-web-activities/
[wp8_bug]: https://issues.apache.org/jira/browse/CB-2083
[msdn_wp8_docs]: http://msdn.microsoft.com/en-us/library/windowsphone/develop/hh394006.aspx
