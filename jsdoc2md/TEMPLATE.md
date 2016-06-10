---
title: Camera
description: Take pictures with the device camera.
---
{{>cdv-license~}}

|Android|iOS| Windows 8.1 Store | Windows 8.1 Phone | Windows 10 Store | Travis CI |
|:-:|:-:|:-:|:-:|:-:|:-:|
|[![Build Status](http://cordova-ci.cloudapp.net:8080/buildStatus/icon?job=cordova-periodic-build/PLATFORM=android,PLUGIN=cordova-plugin-camera)](http://cordova-ci.cloudapp.net:8080/job/cordova-periodic-build/PLATFORM=android,PLUGIN=cordova-plugin-camera/)|[![Build Status](http://cordova-ci.cloudapp.net:8080/buildStatus/icon?job=cordova-periodic-build/PLATFORM=ios,PLUGIN=cordova-plugin-camera)](http://cordova-ci.cloudapp.net:8080/job/cordova-periodic-build/PLATFORM=ios,PLUGIN=cordova-plugin-camera/)|[![Build Status](http://cordova-ci.cloudapp.net:8080/buildStatus/icon?job=cordova-periodic-build/PLATFORM=windows-8.1-store,PLUGIN=cordova-plugin-camera)](http://cordova-ci.cloudapp.net:8080/job/cordova-periodic-build/PLATFORM=windows-8.1-store,PLUGIN=cordova-plugin-camera/)|[![Build Status](http://cordova-ci.cloudapp.net:8080/buildStatus/icon?job=cordova-periodic-build/PLATFORM=windows-8.1-phone,PLUGIN=cordova-plugin-camera)](http://cordova-ci.cloudapp.net:8080/job/cordova-periodic-build/PLATFORM=windows-8.1-phone,PLUGIN=cordova-plugin-camera/)|[![Build Status](http://cordova-ci.cloudapp.net:8080/buildStatus/icon?job=cordova-periodic-build/PLATFORM=windows-10-store,PLUGIN=cordova-plugin-camera)](http://cordova-ci.cloudapp.net:8080/job/cordova-periodic-build/PLATFORM=windows-10-store,PLUGIN=cordova-plugin-camera/)|[![Build Status](https://travis-ci.org/apache/cordova-plugin-camera.svg?branch=master)](https://travis-ci.org/apache/cordova-plugin-camera)

# cordova-plugin-camera

This plugin defines a global `navigator.camera` object, which provides an API for taking pictures and for choosing images from
the system's image library.

{{>cdv-header device-ready-warning-obj='navigator.camera' npmName='cordova-plugin-camera' cprName='org.apache.cordova.camera' pluginName='Plugin Camera' repoUrl='https://github.com/apache/cordova-plugin-camera' }}

---

# API Reference <a name="reference"></a>

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

Take a photo and retrieve it as a Base64-encoded image:

    /**
     * Warning: Using DATA_URL is not recommended! The DATA_URL destination
     * type is very memory intensive, even with a low quality setting. Using it
     * can result in out of memory errors and application crashes. Use FILE_URI
     * or NATIVE_URI instead.
     */
    navigator.camera.getPicture(onSuccess, onFail, { quality: 25,
        destinationType: Camera.DestinationType.DATA_URL
    });

    function onSuccess(imageData) {
        var image = document.getElementById('myImage');
        image.src = "data:image/jpeg;base64," + imageData;
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

## Sample: Take Pictures, Select Pictures from the Picture Library, and Get Thumbnails <a name="sample"></a>

The Camera plugin allows you to do things like open the device's Camera app and take a picture, or open the file picker and select one. The code snippets in this section demonstrate different tasks including:

* Open the Camera app and [take a Picture](#takePicture)
* Take a picture and [return thumbnails](#getThumbnails) (resized picture)
* Take a picture and [generate a FileEntry object](#convert)
* [Select a file](#selectFile) from the picture library
* Select a JPEG image and [return thumbnails](#getFileThumbnails) (resized image)
* Select an image and [generate a FileEntry object](#convert)

## Take a Picture <a name="takePicture"></a>

Before you can take a picture, you need to set some Camera plugin options to pass into the Camera plugin's `getPicture` function. Here is a common set of recommendations. In this example, you create the object that you will use for the Camera options, and set the `sourceType` dynamically to support both the Camera app and the file picker.

```js
function setOptions(srcType) {
    var options = {
        // Some common settings are 20, 50, and 100
        quality: 50,
        destinationType: Camera.DestinationType.FILE_URI,
        // In this app, dynamically set the picture source, Camera or photo gallery
        sourceType: srcType,
        encodingType: Camera.EncodingType.JPEG,
        mediaType: Camera.MediaType.PICTURE,
        allowEdit: true,
        correctOrientation: true  //Corrects Android orientation quirks
    }
    return options;
}
```

Typically, you want to use a FILE_URI instead of a DATA_URL to avoid most memory issues. JPEG is the recommended encoding type for Android.

You take a picture by passing in the options object to `getPicture`, which takes a CameraOptions object as the third argument. When you call `setOptions`, pass `Camera.PictureSourceType.CAMERA` as the picture source.

```js
function openCamera(selection) {

    var srcType = Camera.PictureSourceType.CAMERA;
    var options = setOptions(srcType);
    var func = createNewFileEntry;

    navigator.camera.getPicture(function cameraSuccess(imageUri) {

        displayImage(imageUri);
        // You may choose to copy the picture, save it somewhere, or upload.
        func(imageUri);

    }, function cameraError(error) {
        console.debug("Unable to obtain picture: " + error, "app");

    }, options);
}
```

Once you take the picture, you can display it or do something else. In this example, call the app's `displayImage` function from the preceding code.

```js
function displayImage(imgUri) {

    var elem = document.getElementById('imageFile');
    elem.src = imgUri;
}
```

To display the image on some platforms, you might need to include the main part of the URI in the Content-Security-Policy `<meta>` element in index.html. For example, on Windows 10, you can include `ms-appdata:` in your `<meta>` element. Here is an example.

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self' data: gap: ms-appdata: https://ssl.gstatic.com 'unsafe-eval'; style-src 'self' 'unsafe-inline'; media-src *">
```

## Take a Picture and Return Thumbnails (Resize the Picture) <a name="getThumbnails"></a>

To get smaller images, you can return a resized image by passing both `targetHeight` and `targetWidth` values with your CameraOptions object. In this example, you resize the returned image to fit in a 100px by 100px box (the aspect ratio is maintained, so 100px is either the height or width, whichever is greater in the source).

```js
function openCamera(selection) {

    var srcType = Camera.PictureSourceType.CAMERA;
    var options = setOptions(srcType);
    var func = createNewFileEntry;

    if (selection == "camera-thmb") {
        options.targetHeight = 100;
        options.targetWidth = 100;
    }

    navigator.camera.getPicture(function cameraSuccess(imageUri) {

        // Do something

    }, function cameraError(error) {
        console.debug("Unable to obtain picture: " + error, "app");

    }, options);
}
```

## Select a File from the Picture Library <a name="selectFile"></a>

When selecting a file using the file picker, you also need to set the CameraOptions object. In this example, set the `sourceType` to `Camera.PictureSourceType.SAVEDPHOTOALBUM`. To open the file picker, call `getPicture` just as you did in the previous example, passing in the success and error callbacks along with CameraOptions object.

```js
function openFilePicker(selection) {

    var srcType = Camera.PictureSourceType.SAVEDPHOTOALBUM;
    var options = setOptions(srcType);
    var func = createNewFileEntry;

    navigator.camera.getPicture(function cameraSuccess(imageUri) {

        // Do something

    }, function cameraError(error) {
        console.debug("Unable to obtain picture: " + error, "app");

    }, options);
}
```

## Select an Image and Return Thumbnails (resized images) <a name="getFileThumbnails"></a>

Resizing a file selected with the file picker works just like resizing using the Camera app; set the `targetHeight` and `targetWidth` options.

```js
function openFilePicker(selection) {

    var srcType = Camera.PictureSourceType.SAVEDPHOTOALBUM;
    var options = setOptions(srcType);
    var func = createNewFileEntry;

    if (selection == "picker-thmb") {
        // To downscale a selected image,
        // Camera.EncodingType (e.g., JPEG) must match the selected image type.
        options.targetHeight = 100;
        options.targetWidth = 100;
    }

    navigator.camera.getPicture(function cameraSuccess(imageUri) {

        // Do something with image

    }, function cameraError(error) {
        console.debug("Unable to obtain picture: " + error, "app");

    }, options);
}
```

## Take a picture and get a FileEntry Object <a name="convert"></a>

If you want to do something like copy the image to another location, or upload it somewhere using the FileTransfer plugin, you need to get a FileEntry object for the returned picture. To do that, call `window.resolveLocalFileSystemURL` on the file URI returned by the Camera app. If you need to use a FileEntry object, set the `destinationType` to `Camera.DestinationType.FILE_URI` in your CameraOptions object (this is also the default value).

>*Note* You need the [File plugin](https://www.npmjs.com/package/cordova-plugin-file) to call `window.resolveLocalFileSystemURL`.

Here is the call to `window.resolveLocalFileSystemURL`. The image URI is passed to this function from the success callback of `getPicture`. The success handler of `resolveLocalFileSystemURL` receives the FileEntry object.

```js
function getFileEntry(imgUri) {
    window.resolveLocalFileSystemURL(imgUri, function success(fileEntry) {

        // Do something with the FileEntry object, like write to it, upload it, etc.
        // writeFile(fileEntry, imgUri);
        console.log("got file: " + fileEntry.fullPath);
        // displayFileData(fileEntry.nativeURL, "Native URL");

    }, function () {
      // If don't get the FileEntry (which may happen when testing
      // on some emulators), copy to a new FileEntry.
        createNewFileEntry(imgUri);
    });
}
```

In the example shown in the preceding code, you call the app's `createNewFileEntry` function if you don't get a valid FileEntry object. The image URI returned from the Camera app should result in a valid FileEntry, but platform behavior on some emulators may be different for files returned from the file picker.

>*Note* To see an example of writing to a FileEntry, see the [File plugin README](https://www.npmjs.com/package/cordova-plugin-file).

The code shown here creates a file in your app's cache (in sandboxed storage) named `tempFile.jpeg`. With the new FileEntry object, you can copy the image to the file or do something else like upload it.

```js
function createNewFileEntry(imgUri) {
    window.resolveLocalFileSystemURL(cordova.file.cacheDirectory, function success(dirEntry) {

        // JPEG file
        dirEntry.getFile("tempFile.jpeg", { create: true, exclusive: false }, function (fileEntry) {

            // Do something with it, like write to it, upload it, etc.
            // writeFile(fileEntry, imgUri);
            console.log("got file: " + fileEntry.fullPath);
            // displayFileData(fileEntry.fullPath, "File copied to");

        }, onErrorCreateFile);

    }, onErrorResolveUrl);
}
```
