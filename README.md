---
标题: 相机
描述: 用设备摄像头拍照。
---
<!---
# license: Licensed to the Apache Software Foundation (ASF) under one
#         or more contributor license agreements.  See the NOTICE file
#         distributed with this work for additional information
#         regarding copyright ownership.  The ASF licenses this file
#         to you under the Apache License, Version 2.0 (the
#         "License"); you may not use this file except in compliance
#         with the License.  You may obtain a copy of the License at
#
#           http://www.apache.org/licenses/LICENSE-2.0
#
#         Unless required by applicable law or agreed to in writing,
#         software distributed under the License is distributed on an
#         "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
#         KIND, either express or implied.  See the License for the
#         specific language governing permissions and limitations
#         under the License.
-->

|Android|iOS| Windows 8.1 Store | Windows 8.1 Phone | Windows 10 Store | Travis CI |
|:-:|:-:|:-:|:-:|:-:|:-:|
|[![Build Status](http://cordova-ci.cloudapp.net:8080/buildStatus/icon?job=cordova-periodic-build/PLATFORM=android,PLUGIN=cordova-plugin-camera)](http://cordova-ci.cloudapp.net:8080/job/cordova-periodic-build/PLATFORM=android,PLUGIN=cordova-plugin-camera/)|[![Build Status](http://cordova-ci.cloudapp.net:8080/buildStatus/icon?job=cordova-periodic-build/PLATFORM=ios,PLUGIN=cordova-plugin-camera)](http://cordova-ci.cloudapp.net:8080/job/cordova-periodic-build/PLATFORM=ios,PLUGIN=cordova-plugin-camera/)|[![Build Status](http://cordova-ci.cloudapp.net:8080/buildStatus/icon?job=cordova-periodic-build/PLATFORM=windows-8.1-store,PLUGIN=cordova-plugin-camera)](http://cordova-ci.cloudapp.net:8080/job/cordova-periodic-build/PLATFORM=windows-8.1-store,PLUGIN=cordova-plugin-camera/)|[![Build Status](http://cordova-ci.cloudapp.net:8080/buildStatus/icon?job=cordova-periodic-build/PLATFORM=windows-8.1-phone,PLUGIN=cordova-plugin-camera)](http://cordova-ci.cloudapp.net:8080/job/cordova-periodic-build/PLATFORM=windows-8.1-phone,PLUGIN=cordova-plugin-camera/)|[![Build Status](http://cordova-ci.cloudapp.net:8080/buildStatus/icon?job=cordova-periodic-build/PLATFORM=windows-10-store,PLUGIN=cordova-plugin-camera)](http://cordova-ci.cloudapp.net:8080/job/cordova-periodic-build/PLATFORM=windows-10-store,PLUGIN=cordova-plugin-camera/)|[![Build Status](https://travis-ci.org/apache/cordova-plugin-camera.svg?branch=master)](https://travis-ci.org/apache/cordova-plugin-camera)

# cordova-plugin-camera

该插件定义了一个全局navigator.camera对象，它提供了一个用于拍摄照片和从系统的图像库中选择图像的API.

虽然该对象附加到全局变量 `navigator` 但要等到 `deviceready` 事件调用后才可用。

    document.addEventListener("deviceready", onDeviceReady, false);
    function onDeviceReady() {
        console.log(navigator.camera);
    }


## 安装

这需要版本 cordova 5.0+

    cordova plugin add cordova-plugin-camera
cordova的旧版本仍然可以通过 __deprecated__ id 安装

    cordova plugin add org.apache.cordova.camera
也可以通过repo url直接安装（不稳定）

    cordova plugin add https://github.com/apache/cordova-plugin-camera.git


## 如何贡献

贡献者欢迎！我们需要您的贡献来保持项目的进展。您可以[报告错误](https://issues.apache.org/jira/issues/?jql=project%20%3D%20CB%20AND%20status%20in%20(Open%2C%20%22In%20Progress%22%2C%20Reopened)%20AND%20resolution%20%3D%20Unresolved%20AND%20component%20%3D%20%22Plugin%20Camera%22%20ORDER%20BY%20priority%20DESC%2C%20summary%20ASC%2C%20updatedDate%20DESC), 改进文档或 [贡献代码](https://github.com/apache/cordova-plugin-camera/pulls).

我们建议有一个具体的[贡献者工作流程](http://wiki.apache.org/cordova/ContributorWorkflow)开始阅读那里 更多信息可在[我们的wiki](http://wiki.apache.org/cordova).

:警告: **发现一个问题？** 文件是[JIRA问题跟踪](https://issues.apache.org/jira/issues/?jql=project%20%3D%20CB%20AND%20status%20in%20(Open%2C%20%22In%20Progress%22%2C%20Reopened)%20AND%20resolution%20%3D%20Unresolved%20AND%20component%20%3D%20%22Plugin%20Camera%22%20ORDER%20BY%20priority%20DESC%2C%20summary%20ASC%2C%20updatedDate%20DESC).

**有解决方案?** 发送[请求](https://github.com/apache/cordova-plugin-camera/pulls).

为了您的更改被接受, 您需要签署并提交Apache [ICLA](http://www.apache.org/licenses/#clas) （个人贡献者许可协议）。然后，您的姓名将显示在由[非提交者](https://people.apache.org/committer-index.html#unlistedclas)签名的CLA列表中 或 [Cordova 提交者](http://people.apache.org/committers-by-project.html#cordova).

**不要忘了测试和记录您的代码。**


## 此文档由工具生成

:警告: 在插件库中运行`npm install`，如果您计划发送PR，启用自动生成文档。 
[jsdoc-to-markdown](https://www.npmjs.com/package/jsdoc-to-markdown) 用于生成文档。 
文档由插件JS代码生成的模板和API文档组成，应在每次提交之前重新生成（通过[husky](https://github.com/typicode/husky)自动完成），运行`npm run gen-docs`脚本 作为一个`precommit`钩子 - 详见`package.json`）。


### iOS Quirks

从iOS 10起，必须在info.plist中添加一个`NSCameraUsageDescription`和`NSPhotoLibraryUsageDescription`.

- `NSCameraUsageDescription` 描述了应用程序访问用户相机的原因。
- `NSPhotoLibraryUsageDescription` 描述应用程序访问用户的照片库的原因。

当系统提示用户允许访问时，该字符串将显示为对话框的一部分

要添加此条目，您可以在插件安装上传递以下变量。

- `CAMERA_USAGE_DESCRIPTION` for `NSCameraUsageDescription`
- `PHOTOLIBRARY_USAGE_DESCRIPTION` for `NSPhotoLibraryUsageDescription`

例子:

    cordova plugin add cordova-plugin-camera --variable CAMERA_USAGE_DESCRIPTION="your usage message" --variable PHOTOLIBRARY_USAGE_DESCRIPTION="your usage message"

如果您不传递变量，插件将添加一个空字符串作为值.

---

# API参考 <a name="reference"></a>


* [camera](#module_camera)
    * [.getPicture(successCallback, errorCallback, options)](#module_camera.getPicture)
    * [.cleanup()](#module_camera.cleanup)
    * [.onError](#module_camera.onError) : <code>function</code>
    * [.onSuccess](#module_camera.onSuccess) : <code>function</code>
    * [.CameraOptions](#module_camera.CameraOptions) : <code>Object</code>


* [Camera](#module_Camera)
    * [.DestinationType](#module_Camera.DestinationType) : <code>enum</code>
    * [.EncodingType](#module_Camera.EncodingType) : <code>enum</code>
    * [.MediaType](#module_Camera.MediaType) : <code>enum</code>
    * [.PictureSourceType](#module_Camera.PictureSourceType) : <code>enum</code>
    * [.PopoverArrowDirection](#module_Camera.PopoverArrowDirection) : <code>enum</code>
    * [.Direction](#module_Camera.Direction) : <code>enum</code>

* [CameraPopoverHandle](#module_CameraPopoverHandle)
* [CameraPopoverOptions](#module_CameraPopoverOptions)

---

<a name="module_camera"></a>

## 相机
<a name="module_camera.getPicture"></a>

### camera.getPicture(successCallback, errorCallback, options)
使用相机拍摄照片，或从设备检索照片
图像库。图像作为一个传递到成功回调
Base64编码的`String`，或作为图像文件的URI。

这 `camera.getPicture` 功能打开设备的默认摄像头
允许用户默认拍摄照片的应用程序 - 发生这种情况,
当`Camera.sourceType`等于[`Camera.PictureSourceType.CAMERA`](#module_Camera.PictureSourceType)。
用户拍摄照片后，相机应用程序关闭，并恢复应用程序。

如果 `Camera.sourceType` 是 `Camera.PictureSourceType.PHOTOLIBRARY` 或
`Camera.PictureSourceType.SAVEDPHOTOALBUM`, 然后显示一个对话框
允许用户选择现有的图像.

返回值被发送到[`cameraSuccess`](#module_camera.onSuccess)回调函数，在
以下格式之一，具体取决于指定的格式
`cameraOptions`：

- A `String` 含有Base64编码的照片图像.
- A `String` 表示本地存储上的映像文件位置（默认）.

可以用编码的图像或URI做任何你想要的
例子:

- 在`<img>`标签中渲染图像，如下例所示
- 在本地保存数据 (`LocalStorage`, [Lawnchair](http://brianleroux.github.com/lawnchair/), etc.)
- 将数据发送到远程服务器

__注意__: Photo resolution on newer devices is quite good. Photos
较新设备上的照片分辨率相当不错。 相片
从设备的图库中选择的不会缩小到较低的
即使指定了 `quality` 参数，也是质量。 避免常见
内存问题，将`Camera.destinationType` 设置为 `FILE_URI`
比`DATA_URL`。

__支持的平台__

- Android
- BlackBerry
- Browser
- Firefox
- FireOS
- iOS
- Windows
- WP8
- Ubuntu

更多例子在[这里](#camera-getPicture-examples). quirks[这里](#camera-getPicture-quirks).

**样本**: 静态方法 <code>[相机](#module_camera)</code>  

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| successCallback | <code>[成功回调](#module_camera.onSuccess)</code> |  |
| errorCallback | <code>[错误回调](#module_camera.onError)</code> |  |
| options | <code>[选项](#module_camera.CameraOptions)</code> | CameraOptions |

**例子**  
```js
navigator.camera.getPicture(cameraSuccess, cameraError, cameraOptions);
```
<a name="module_camera.cleanup"></a>

### camera.cleanup()
删除保存在临时存储中的中间映像文件
之后调用 [`camera.getPicture`](#module_camera.getPicture). 仅适用于
`Camera.sourceType` 等于 `Camera.PictureSourceType.CAMERA` 和
`Camera.destinationType` 等于 `Camera.DestinationType.FILE_URI`.

__支持的平台__

- iOS

**样本**: 静态方法 <code>[相机](#module_camera)</code>  
**例子**  
```js
navigator.camera.cleanup(onSuccess, onFail);

function onSuccess() {
    console.log("Camera cleanup success.")
}

function onFail(message) {
    alert('Failed because: ' + message);
}
```
<a name="module_camera.onError"></a>

### camera.onError : <code>function</code>
回调函数提供错误消息。

**样本**: 静态方法 <code>[相机](#module_camera)</code>  

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| message | <code>string</code> | 这消息由设备的本机代码提供。 |

<a name="module_camera.onSuccess"></a>

### camera.onSuccess : <code>function</code>
回调函数提供图像数据。

**样本**: 静态方法 <code>[相机](#module_camera)</code>  

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| imageData | <code>string</code> | Base64编码图像数据，或图像文件URI，具体取决于 [`cameraOptions`](#module_camera.CameraOptions)。  |

**例子**  
```js
// 显示图像
//
function cameraCallback(imageData) {
   var image = document.getElementById('myImage');
   image.src = "data:image/jpeg;base64," + imageData;
}
```
<a name="module_camera.CameraOptions"></a>

### camera.CameraOptions : <code>Object</code>
自定义相机设置的可选参数。.
* [Quirks](#CameraOptions-quirks)

**样本**: 静态属性 <code>[camera](#module_camera)</code>  
**属性**

| 名称 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| quality | <code>number</code> | <code>50</code> | 保存的图像的质量，以0-100的范围表示，其中100是通常的全分辨率，而不会损失文件压缩。 （请注意，有关相机分辨率的信息不可用。） |
| destinationType | <code>[DestinationType](#module_Camera.DestinationType)</code> | <code>FILE_URI</code> | 选择返回值的格式。|
| sourceType | <code>[PictureSourceType](#module_Camera.PictureSourceType)</code> | <code>CAMERA</code> | 设置图片的来源. |
| allowEdit | <code>Boolean</code> | <code>true</code> | 允许在选择前简单地编辑图像。 |
| encodingType | <code>[EncodingType](#module_Camera.EncodingType)</code> | <code>JPEG</code> | 选择返回的图像文件的编码。 |
| targetWidth | <code>number</code> |  | 以像素为单位的尺寸缩放图像。必须与`targetHeight`一起使用。长宽比保持不变。|
| targetHeight | <code>number</code> |  | 以像素为单位的高度来缩放图像。必须与`targetWidth`一起使用。长宽比保持不变。 |
| mediaType | <code>[MediaType](#module_Camera.MediaType)</code> | <code>PICTURE</code> | 设置要选择的媒体类型。只有当`PictureSourceType`是`PHOTOLIBRARY`或`SAVEDPHOTOALBUM`时才有效。 |
| correctOrientation | <code>Boolean</code> |  | 在拍摄期间旋转图像以校正设备的方向。 |
| saveToPhotoAlbum | <code>Boolean</code> |  | 拍摄后将图像保存到设备上的相册。 |
| popoverOptions | <code>[CameraPopoverOptions](#module_CameraPopoverOptions)</code> |  | 仅在iOS中指定Popover位置的iOS专用选项。 |
| cameraDirection | <code>[Direction](#module_Camera.Direction)</code> | <code>BACK</code> | 选择要使用的相机（正面或背面）。 |

---

<a name="module_Camera"></a>

## 相机
<a name="module_Camera.DestinationType"></a>

### Camera.DestinationType : <code>enum</code>
定义 `Camera.getPicture`调用的输出格式。
_注意:_ 在iOS上传递`DestinationType.NATIVE_URI`, `PictureSourceType.PHOTOLIBRARY` 或 `PictureSourceType.SAVEDPHOTOALBUM`将会禁用任何图像修改（调整大小，质量变化，裁剪等）具体请实例。

**样本**: 静态枚举属性 <code>[Camera](#module_Camera)</code>  
**属性**

| 名称 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| DATA_URL | <code>number</code> | <code>0</code> | 返回base64编码的字符串。 DATA_URL可能非常内存密集，导致应用程序崩溃或内存不足错误。如果可能，请使用FILE_URI或NATIVE_URI |
| FILE_URI | <code>number</code> | <code>1</code> | 返回文件uri (content://media/external/images/media/2 for Android) |
| NATIVE_URI | <code>number</code> | <code>2</code> | 返回本地 uri (eg. asset-library://... for iOS) |

<a name="module_Camera.EncodingType"></a>

### Camera.EncodingType : <code>enum</code>
**样本**: 静态枚举属性 <code>[Camera](#module_Camera)</code>  
**属性**

| 名称 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| JPEG | <code>number</code> | <code>0</code> | 返回JPEG编码的图像 |
| PNG | <code>number</code> | <code>1</code> | 返回PNG编码图像 |

<a name="module_Camera.MediaType"></a>

### Camera.MediaType : <code>enum</code>
**样本**: 静态枚举属性 <code>[Camera](#module_Camera)</code>  
**属性**

| 名称 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| PICTURE | <code>number</code> | <code>0</code> | 仅允许选择静态图片。默认。将返回通过DestinationType指定的格式 |
| VIDEO | <code>number</code> | <code>1</code> | 允许选择视频，只有RETURNS URL |
| ALLMEDIA | <code>number</code> | <code>2</code> | 允许从所有媒体类型中进行选择 |

<a name="module_Camera.PictureSourceType"></a>

### Camera.PictureSourceType : <code>enum</code>
定义`Camera.getPicture`调用的输出格式。
_注意:_ 在iOS传递 `PictureSourceType.PHOTOLIBRARY` 或 `PictureSourceType.SAVEDPHOTOALBUM`
随着 `DestinationType.NATIVE_URI` 将禁用任何图像修改（调整大小，质量 ， 改变，裁剪等）由于具体实现

**样本**: 静态枚举属性 <code>[Camera](#module_Camera)</code>  
**属性**

| 名称 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| PHOTOLIBRARY | <code>number</code> | <code>0</code> | 从设备的照片库中选择图像（与SAVEDPHOTOALBUM for Android相同） |
| CAMERA | <code>number</code> | <code>1</code> | 从相机拍照 |
| SAVEDPHOTOALBUM | <code>number</code> | <code>2</code> | 仅从设备的相机胶卷专辑中选择图像（与Android的PHOTOLIBRARY相同） |

<a name="module_Camera.PopoverArrowDirection"></a>

### Camera.PopoverArrowDirection : <code>enum</code>
匹配iOS UIPopoverArrowDirection常量来指定popover上的箭头位置。

**样本**: 静态枚举属性 <code>[Camera](#module_Camera)</code>  
**属性**

| 名称 | 类型 | 默认值 |
| --- | --- | --- |
| ARROW_UP | <code>number</code> | <code>1</code> | 
| ARROW_DOWN | <code>number</code> | <code>2</code> | 
| ARROW_LEFT | <code>number</code> | <code>4</code> | 
| ARROW_RIGHT | <code>number</code> | <code>8</code> | 
| ARROW_ANY | <code>number</code> | <code>15</code> | 

<a name="module_Camera.Direction"></a>

### Camera.Direction : <code>enum</code>
**样本**: 静态枚举属性 <code>[Camera](#module_Camera)</code>  
**属性**

| 名称 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| BACK | <code>number</code> | <code>0</code> | 使用背面摄像头 |
| FRONT | <code>number</code> | <code>1</code> | 使用前置摄像头 |

---

<a name="module_CameraPopoverOptions"></a>

## CameraPopoverOptions
指定锚点元素位置和箭头的仅限iOS的参数
从iPad的库中选择图像时，popover的方向
或专辑。
请注意，popover的大小可能会改变以适应
箭头方向和屏幕方向。 确保
在指定锚点元素时考虑方向更改
位置。


| 名称 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| [x] | <code>Number</code> | <code>0</code> | 屏幕元素的x像素坐标，以锚定该弹出窗口。 |
| [y] | <code>Number</code> | <code>32</code> | 屏幕元素的y像素坐标来锚定popover。 |
| [width] | <code>Number</code> | <code>320</code> | 要在其上锚定弹出窗口的屏幕元素的宽度（以像素为单位）。 |
| [height] | <code>Number</code> | <code>480</code> | 屏幕元素的高度（以像素为单位），以锚定该弹出窗口。 |
| [arrowDir] | <code>[PopoverArrowDirection](#module_Camera.PopoverArrowDirection)</code> | <code>ARROW_ANY</code> | 方向箭头应该在popover点。 |

---

<a name="module_CameraPopoverHandle"></a>

## CameraPopoverHandle
图像拾取器popover的句柄。

__支持的平台__

- iOS

**例子**  
```js
navigator.camera.getPicture(onSuccess, onFail,
{
    destinationType: Camera.DestinationType.FILE_URI,
    sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
    popoverOptions: new CameraPopoverOptions(300, 300, 100, 100, Camera.PopoverArrowDirection.ARROW_ANY)
});

// 如果方向改变，重新定位移动设备。
window.onorientationchange = function() {
    var cameraPopoverHandle = new CameraPopoverHandle();
    var cameraPopoverOptions = new CameraPopoverOptions(0, 0, 100, 100, Camera.PopoverArrowDirection.ARROW_ANY);
    cameraPopoverHandle.setPosition(cameraPopoverOptions);
}
```
---


## `camera.getPicture` Errata

#### 例子 <a name="camera-getPicture-examples"></a>

拍摄照片并检索图像的文件位置：

    navigator.camera.getPicture(onSuccess, onFail, { quality: 50,
        destinationType: Camera.DestinationType.FILE_URI });

    function onSuccess(imageURI) {
        var image = document.getElementById('myImage');
        image.src = imageURI;
    }

    function onFail(message) {
        alert('Failed because: ' + message);
    }

拍照并将其作为Base64编码图像检索：

    /**
      * 警告：不建议使用DATA_URL！ DATA_URL目的地
      * 类型非常内存密集，即使是低质量的设置。 使用它
      * 可能导致内存不足错误和应用程序崩溃。 使用FILE_URI
      * 或NATIVE_URI代替。
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

-  __CameraUsesGeolocation__ (boolean, defaults to false). 为了捕获JPEG，设置为true以获取EXIF头中的地理位置数据。如果设置为true，这将触发地理位置许可的请求
        <preference name="CameraUsesGeolocation" value="false" />

#### Amazon Fire OS Quirks <a name="camera-getPicture-quirks"></a>

Amazon Fire OS使用意图在设备上启动摄像机活动进行捕获
图像和手机内存不足，Cordova活动可能会被杀死。 在这个
当Cordova活动恢复时，图像可能不会出现.

#### Android Quirks

Android使用意图启动要捕获的设备上的摄像机活动
图像和手机内存不足，Cordova活动可能会被杀死。 在这个
场景中，插件调用的结果将通过简历事件传递。
请参阅[Android生命周期指南] [android_lifecycle]
了解更多信息。 `pendingResult.result`值将包含该值
将被传递给回调（URI / URL或错误消息）。 检查
`pendingResult.pluginStatus`来确定是否有呼叫
成功

#### Browser Quirks

只能返回照片作为Base64编码的图像。

#### Firefox OS Quirks

相机插件目前使用[Web Activities] [web_activities]实现。

#### iOS Quirks

在任何回调函数中包含一个JavaScript`alert（）` 可能会导致问题。将一个`setTimeout（）`中的警报包起来来允许iOS图像选择器或popover在警报之前完全关闭 显示：

    setTimeout(function() {
        // do your thing here!
    }, 0);

#### Windows Phone 7 Quirks

在设备连接时调用本机摄像头应用程序 490 通过Zune不起作用，并触发错误回调。

#### Windows quirks

在Windows Phone 8.1上，使用`SAVEDPHOTOALBUM`或`PHOTOLIBRARY`作为源类型使应用程序挂起，直到文件选择器返回所选图像，
然后使用应用程序的`config.xml`中定义的起始页面恢复。如果`camera.getPicture`从不同页面调用，这将导致重新加载
起始页从头开始，成功和错误回调将永远不会被调用。

为了避免这种情况，我们建议您使用SPA模式或仅从应用程序的起始页面调用`camera.getPicture`。

有关Windows Phone 8.1选择器API的更多信息，请参阅：[如何在调用文件选择器后继续使用Windows Phone应用程序](https://msdn.microsoft.com/en-us/library/windows/apps/dn720490.aspx)

#### Tizen Quirks

Tizen 只支持 `destinationType` 的
`Camera.DestinationType.FILE_URI` 和`sourceType` 的
`Camera.PictureSourceType.PHOTOLIBRARY`.


## `CameraOptions` 勘误 <a name="CameraOptions-quirks"></a>

#### Amazon Fire OS Quirks

- 任何`cameraDirection`值都会导致背面照片。

- 忽略`allowEdit`参数。

- `Camera.PictureSourceType.PHOTOLIBRARY` 和 `Camera.PictureSourceType.SAVEDPHOTOALBUM` 都显示相同的相册。

#### Android Quirks

- 任何`cameraDirection`值都会导致背面照片

- **`allowEdit`在Android上是不可预知的，不应该使用！**这个插件的Android实现试图在用户的设备上查找和使用一个应用程序进行图像裁剪。 该插件无法控制用户选择执行图像裁剪的应用程序，用户可能会选择不兼容的选项，导致插件失败。 这有时起作用，因为大多数设备都配有一个应用程序，以与该插件（Google Plus照片）兼容的方式处理裁剪，但依赖于这种情况是不明智的。 如果图像编辑对您的应用程序至关重要，请考虑寻找第三方库或插件，以提供自己的图像编辑实用程序，以实现更强大的解决方案。

- `Camera.PictureSourceType.PHOTOLIBRARY` 和 `Camera.PictureSourceType.SAVEDPHOTOALBUM` 都显示相同的相册。

- 如果图像未被编辑，则忽略`encodingType`参数（即`quality`为100，`correctOrientation`为false，没有指定`targetHeight`或`targetWidth`）。 `CAMERA`源将始终返回由本机摄像机给出的JPEG文件，`PHOTOLIBRARY`和`SAVEDPHOTOALBUM`源将以现有的编码方式返回所选文件。

#### BlackBerry 10 Quirks

- 忽略`quality`参数。

- 忽略`allowEdit`参数。

- `Camera.MediaType` 不受支持。

- 忽略`correctOrientation`参数。

- 忽略`cameraDirection`参数。

#### Firefox OS Quirks

- 忽略`quality`参数。

- `Camera.DestinationType`被忽略，等于`1`（图像文件URI）

- 忽略`allowEdit`参数。

- 忽略 `PictureSourceType` 参数（用户在对话窗口中选择它）

- 忽略 `encodingType`

- 忽略 `targetWidth` 和 `targetHeight`

- `Camera.MediaType` 不受支持。

- 忽略`correctOrientation`参数。

- 忽略`cameraDirection`参数。

#### iOS Quirks

- 当使用`destinationType.FILE_URI`时，照片将保存在应用程序的临时目录中。当应用程序结束时，应用程序的临时目录的内容将被删除。

- 当使用`destinationType.NATIVE_URI`和`sourceType.CAMERA`时，照片保存在保存的相册中，而不管`saveToPhotoAlbum`参数的值如何。

- 当使用`destinationType.NATIVE_URI`和`sourceType.PHOTOLIBRARY`或`sourceType.SAVEDPHOTOALBUM`时，所有的编辑选项都被忽略，链接返回到原始图片

#### Tizen Quirks

- 选项不支持

- 总是返回FILE URI

#### Windows Phone 7 和 8 Quirks

- 忽略`allowEdit`参数。

- 忽略`correctOrientation`参数。

- 忽略`cameraDirection`参数。

- 忽略`saveToPhotoAlbum`参数。 重要信息：使用WP8 / 8 Cordova相机API拍摄的所有图像始终被复制到手机的相机胶卷上。 根据用户的设置，这也可能意味着图像被自动上传到他们的OneDrive。 这可能意味着更广泛的受众群体的图像比您的应用程序可用。 如果这是您的应用程序的阻止程序，您将需要实现CameraCaptureTask [文档在MSDN] [msdn_wp8_docs]。 您也可以在[问题追踪器] [wp8_bug]中评论或更新相关问题。

- Ignores the `mediaType` property of `cameraOptions` 因为Windows Phone SDK不提供从PHOTOLIBRARY中选择视频的方法。

[android_lifecycle]: http://cordova.apache.org/docs/en/dev/guide/platforms/android/lifecycle.html
[web_activities]: https://hacks.mozilla.org/2013/01/introducing-web-activities/
[wp8_bug]: https://issues.apache.org/jira/browse/CB-2083
[msdn_wp8_docs]: http://msdn.microsoft.com/en-us/library/windowsphone/develop/hh394006.aspx

## 示例：拍照，从图片库中选择照片，并获取缩略图 <a name="sample"></a>

相机插件允许您执行打开设备的相机应用程序并拍摄照片，或打开文件选择器并选择一个。本节中的代码段演示了不同的任务，包括：

* 打开相机(#takePicture)应用程序并[拍摄](#takePicture)图片
* 拍摄照片和[返回缩略图](#getThumbnails)（调整大小的图片）
* 拍摄照片和[生成FileEntry对象](#convert)
* 从图片库中选择文件(#selectFile)
* 选择一个JPEG图像，并[返回缩略图](#getFileThumbnails)（调整后的图像)
* 选择一个图像和[生成一个FileEntry对象](#convert)

## 拍照 <a name="takePicture"></a>

在拍照之前，您需要设置一些Camera插件选项，以传入Camera插件的`getPicture`功能。 这是一套常见的建议。 在此示例中，您将创建将用于Camera选项的对象，并动态设置`sourceType`，以支持Camera应用程序和文件选择器。

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

通常，您要使用FILE_URI而不是DATA_URL来避免大多数内存问题。 JPEG是Android的推荐编码类型。

通过将选项对象传递给 `getPicture`，将CameraOptions对象作为第三个参数来拍摄照片。当你调用`setOptions`时，把`Camera.PictureSourceType.CAMERA`作为图片源。

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

拍摄照片后，您可以显示或执行其他操作。在这个例子中，从前面的代码调用app的`displayImage`函数。

```js
function displayImage(imgUri) {

    var elem = document.getElementById('imageFile');
    elem.src = imgUri;
}
```

要在某些平台上显示图像，您可能需要将URI的主要部分包含在index.html中的Content-Security-Policy`<meta>`元素中。 例如，在Windows 10上，您可以在`<meta>`元素中包含`ms-appdata:`。 这是一个例子。

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self' data: gap: ms-appdata: https://ssl.gstatic.com 'unsafe-eval'; style-src 'self' 'unsafe-inline'; media-src *">
```

## 拍照并返回缩略图（调整图片大小） <a name="getThumbnails"></a>

为了获得更小的图像，您可以通过将`targetHeight`对象和 `targetWidth` 值传递给CameraOptions对象来返回一个调整大小的图像。 在此示例中，您可以调整返回的图像大小以适应100px x 100px的框（宽高比保持不变，因此100px是高度或宽度，取决于源中较大者）。

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

## 从图片库中选择一个文件 <a name="selectFile"></a>

使用文件选择器选择文件时，还需要设置CameraOptions对象。 在本例中，将`sourceType`设置为Camera.PictureSourceType.SAVEDPHOTOALBUM。 要打开文件选择器，就像前面的例子一样调用`getPicture`，传递成功和错误回调以及CameraOptions对象。

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

## 选择一个图像并返回缩略图（调整大小的图像） <a name="getFileThumbnails"></a>

调整文件选择器所选文件的大小就像使用Camera应用程序调整大小一样;设置`targetHeight`和`targetWidth`选项。

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

## 拍摄照片并获取FileEntry对象 <a name="convert"></a>

如果您想要将图像复制到另一个位置，或者使用FileTransfer插件将其上传到某处，则需要为返回的图片获取一个FileEntry对象。 为此，请在Camera应用程序返回的文件URI上调用 `window.resolveLocalFileSystemURL` 。 如果需要使用FileEntry对象，请在CameraOptions对象中将`destinationType`设置为Camera.DestinationType.FILE_URI（这也是默认值）。

>*注意* 你需要 [File plugin](https://www.npmjs.com/package/cordova-plugin-file) 插件来调用 `window.resolveLocalFileSystemURL`.

这是调用`window.resolveLocalFileSystemURL`。图像URI从`getPicture`的成功回调传递给这个函数。 `resolveLocalFileSystemURL`的成功处理程序接收FileEntry对象。

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

在上述代码中显示的示例中，如果没有获取有效的FileEntry对象，则调用应用程序的`createNewFileEntry`函数。 从Camera应用程序返回的图像URI应该导致有效的FileEntry，但是对于从文件选择器返回的文件，某些仿真器上的平台行为可能不同。

>*注意* 要查看写入FileEntry的示例，请参阅 [File plugin README](https://www.npmjs.com/package/cordova-plugin-file).

此处显示的代码在应用程序的缓存（沙盒存储）中创建一个名为`tempFile.jpeg`的文件。使用新的FileEntry对象，您可以将图像复制到文件或执行其他操作，例如上传它

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
