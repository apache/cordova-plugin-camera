<!---
    Licensed to the Apache Software Foundation (ASF) under one
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
-->

# cordova-plugin-camera

이 플러그인 시스템의 이미지 라이브러리에서 이미지를 선택 및 사진 촬영을 위한 API를 제공 하는 글로벌 `navigator.camera` 개체를 정의 합니다.

개체 `navigator` 글로벌 범위 첨부 아니에요 때까지 사용할 수 있는 `deviceready` 이벤트 후.

    document.addEventListener("deviceready", onDeviceReady, false);
    function onDeviceReady() {
        console.log(navigator.camera);
    }
    

## 설치

    cordova plugin add cordova-plugin-camera
    

## navigator.camera.getPicture

카메라를 사용 하 여 사진을 걸립니다 또는 소자의 이미지 갤러리에서 사진을 검색 합니다. 이미지는 성공 콜백에 전달 base64 인코딩된 `문자열` 또는 URI로 이미지 파일에 대 한. 방법 자체는 파일 선택 popover 위치를 사용할 수 있는 `CameraPopoverHandle` 개체를 반환 합니다.

    navigator.camera.getPicture( cameraSuccess, cameraError, cameraOptions );
    

### 설명

`Camera.getPicture` 함수 스냅 사진을 사용자가 소자의 기본 카메라 응용 프로그램을 엽니다. 이 문제는 `Camera.sourceType` `Camera.PictureSourceType.CAMERA` 경우 기본적으로 발생 합니다. 일단 사용자 스냅 사진, 카메라 응용 프로그램 종료 하 고 응용 프로그램 복원 됩니다.

`Camera.sourceType`은 `Camera.PictureSourceType.PHOTOLIBRARY` 또는 `Camera.PictureSourceType.SAVEDPHOTOALBUM`, 대화 상자가 사용자가 기존 이미지를 선택할 수 있도록 표시 됩니다. `camera.getPicture` 함수는 장치 방향 변경 될 때 이미지 선택 대화 상자, 예를 들어, 위치를 변경 하려면 사용할 수 있는 `CameraPopoverHandle` 개체를 반환 합니다.

반환 값은 `cameraSuccess` 콜백 함수 지정된 `cameraOptions`에 따라 다음 형식 중 하나에 전송 됩니다.

*   A `String` base64 인코딩된 사진 이미지를 포함 합니다.

*   A `String` 로컬 저장소 (기본값)의 이미지 파일 위치를 나타내는.

할 수 있는 당신이 원하는대로 인코딩된 이미지 또는 URI, 예를 들면:

*   렌더링 이미지는 `<img>` 아래 예제와 같이 태그

*   로컬로 데이터를 저장 ( `LocalStorage` , [Lawnchair][1], 등.)

*   원격 서버에 데이터 게시

 [1]: http://brianleroux.github.com/lawnchair/

**참고**: 더 새로운 장치에 사진 해상도 아주 좋은. 소자의 갤러리에서 선택 된 사진 `품질` 매개 변수를 지정 하는 경우에 낮은 품질에 관하여 하지는. 일반적인 메모리 문제를 피하기 위해 `DATA_URL` 보다 `FILE_URI` `Camera.destinationType` 설정.

### 지원 되는 플랫폼

*   아마존 화재 운영 체제
*   안 드 로이드
*   블랙베리 10
*   브라우저
*   Firefox 운영 체제
*   iOS
*   Tizen
*   Windows Phone 7과 8
*   윈도우 8

### 환경 설정 (iOS)

*   **CameraUsesGeolocation** (boolean, 기본값: false)입니다. 캡처 Jpeg, EXIF 헤더에 지리적 데이터를 true로 설정 합니다. 이 경우 위치 정보 사용 권한에 대 한 요청을 일으킬 것 이다 true로 설정 합니다.
    
        <preference name="CameraUsesGeolocation" value="false" />
        

### 아마존 화재 OS 단점

아마존 화재 OS 의도 사용 하 여 이미지 캡처 장치에서 카메라 활동을 시작 하 고 낮은 메모리와 휴대 전화에 코르 도우 바 활동 살해 수 있습니다. 코르도바 활동 복원 되 면이 시나리오에서는 이미지가 나타나지 않을 수 있습니다.

### 안 드 로이드 단점

안 드 로이드 의도 사용 하 여 이미지 캡처 장치에서 카메라 활동을 시작 하 고 낮은 메모리와 휴대 전화에 코르 도우 바 활동 살해 수 있습니다. 코르도바 활동 복원 되 면이 시나리오에서는 이미지가 나타나지 않을 수 있습니다.

### 브라우저 만지면

수 base64 인코딩 이미지로 사진을 반환 합니다.

### 파이어 폭스 OS 단점

카메라 플러그인은 현재 [웹 활동][2]를 사용 하 여 구현.

 [2]: https://hacks.mozilla.org/2013/01/introducing-web-activities/

### iOS 단점

자바 `alert()`를 포함 하 여 콜백 함수 중 하나에 문제가 발생할 수 있습니다. 포장 허용 iOS 이미지 피커 또는 popover를 완벽 하 게 경고를 표시 하기 전에 닫습니다 `setTimeout()` 내에서 경고:

    setTimeout(function() {
        // do your thing here!
    }, 0);
    

### Windows Phone 7 단점

장치 Zune 통해 연결 된 동안 네이티브 카메라 응용 프로그램을 호출 하면 작동 하지 않습니다 하 고 오류 콜백 트리거합니다.

### Tizen 특수

`Camera.DestinationType.FILE_URI`의 `destinationType`와 `Camera.PictureSourceType.PHOTOLIBRARY`의 `sourceType` Tizen 지원.

### 예를 들어

촬영 및 base64 인코딩 이미지로 검색:

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
    

촬영 하 고 이미지의 파일 위치를 검색:

    navigator.camera.getPicture(onSuccess, onFail, { quality: 50,
        destinationType: Camera.DestinationType.FILE_URI });
    
    function onSuccess(imageURI) {
        var image = document.getElementById('myImage');
        image.src = imageURI;
    }
    
    function onFail(message) {
        alert('Failed because: ' + message);
    }
    

## CameraOptions

카메라 설정을 사용자 지정 하는 선택적 매개 변수.

    { quality : 75,
      destinationType : Camera.DestinationType.DATA_URL,
      sourceType : Camera.PictureSourceType.CAMERA,
      allowEdit : true,
      encodingType: Camera.EncodingType.JPEG,
      targetWidth: 100,
      targetHeight: 100,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: false };
    

### 옵션

*   **품질**: 범위 0-100, 100은 파일 압축에서 손실 없이 일반적으로 전체 해상도 저장된 된 이미지의 품질. 기본값은 50입니다. *(수)* (Note 카메라의 해상도 대 한 정보는 사용할 수 없습니다.)

*   **destinationType**: 반환 값의 형식을 선택 합니다. 기본값은 FILE_URI입니다. 에 정의 된 `navigator.camera.DestinationType` *(수)*
    
        Camera.DestinationType = {
            DATA_URL : 0,      // Return image as base64-encoded string
            FILE_URI : 1,      // Return image file URI
            NATIVE_URI : 2     // Return image native URI (e.g., assets-library:// on iOS or content:// on Android)
        };
        

*   **sourceType**: 그림의 소스를 설정 합니다. 기본값은 카메라입니다. 에 정의 된 `navigator.camera.PictureSourceType` *(수)*
    
        Camera.PictureSourceType = {
            PHOTOLIBRARY : 0,
            CAMERA : 1,
            SAVEDPHOTOALBUM : 2
        };
        

*   **allowEdit**: 선택 하기 전에 이미지의 간단한 편집을 허용 합니다. *(부울)*

*   **encodingType**: 반환 된 이미지 파일의 인코딩을 선택 합니다. 기본값은 JPEG입니다. 에 정의 된 `navigator.camera.EncodingType` *(수)*
    
        Camera.EncodingType = {
            JPEG : 0,               // Return JPEG encoded image
            PNG : 1                 // Return PNG encoded image
        };
        

*   **targetWidth**: 스케일 이미지를 픽셀 너비. **TargetHeight**와 함께 사용 해야 합니다. 가로 세로 비율이 일정 하 게 유지 합니다. *(수)*

*   **targetHeight**: 스케일 이미지를 픽셀 단위로 높이. **TargetWidth**와 함께 사용 해야 합니다. 가로 세로 비율이 일정 하 게 유지 합니다. *(수)*

*   **mediaType**:에서 선택 미디어 유형을 설정 합니다. 때에 작동 `PictureSourceType` 는 `PHOTOLIBRARY` 또는 `SAVEDPHOTOALBUM` . 에 정의 된 `nagivator.camera.MediaType` *(수)*
    
        Camera.MediaType = {
            PICTURE: 0,    // allow selection of still pictures only. 기본입니다. Will return format specified via DestinationType
            VIDEO: 1,      // allow selection of video only, WILL ALWAYS RETURN FILE_URI
            ALLMEDIA : 2   // allow selection from all media types
        };
        

*   **correctOrientation**: 캡처 도중 장치의 방향에 대 한 해결 하기 위해 이미지를 회전 합니다. *(부울)*

*   **saveToPhotoAlbum**: 캡처 후 장치에서 사진 앨범에 이미지를 저장 합니다. *(부울)*

*   **popoverOptions**: iPad에 popover 위치를 지정 하는 iOS 전용 옵션. 에 정의 된`CameraPopoverOptions`.

*   **cameraDirection**: (앞 이나 뒤로-연결)를 사용 하 여 카메라를 선택 하십시오. 기본값은 다시. 에 정의 된 `navigator.camera.Direction` *(수)*
    
        Camera.Direction = {
            BACK : 0,      // Use the back-facing camera
            FRONT : 1      // Use the front-facing camera
        };
        

### 아마존 화재 OS 단점

*   어떤 `cameraDirection` 다시 연결 사진에 결과 값.

*   무시는 `allowEdit` 매개 변수.

*   `Camera.PictureSourceType.PHOTOLIBRARY`그리고 `Camera.PictureSourceType.SAVEDPHOTOALBUM` 둘 다 동일한 사진 앨범을 표시 합니다.

### 안 드 로이드 단점

*   어떤 `cameraDirection` 다시 연결 사진에 결과 값.

*   무시는 `allowEdit` 매개 변수.

*   `Camera.PictureSourceType.PHOTOLIBRARY`그리고 `Camera.PictureSourceType.SAVEDPHOTOALBUM` 둘 다 동일한 사진 앨범을 표시 합니다.

### 블랙베리 10 단점

*   무시는 `quality` 매개 변수.

*   무시는 `allowEdit` 매개 변수.

*   `Camera.MediaType`지원 되지 않습니다.

*   무시는 `correctOrientation` 매개 변수.

*   무시는 `cameraDirection` 매개 변수.

### 파이어 폭스 OS 단점

*   무시는 `quality` 매개 변수.

*   `Camera.DestinationType`무시 되 고 `1` (이미지 파일 URI)

*   무시는 `allowEdit` 매개 변수.

*   무시는 `PictureSourceType` 매개 변수 (사용자가 선택 그것 대화 창에서)

*   무시 하는`encodingType`

*   무시는 `targetWidth` 와`targetHeight`

*   `Camera.MediaType`지원 되지 않습니다.

*   무시는 `correctOrientation` 매개 변수.

*   무시는 `cameraDirection` 매개 변수.

### iOS 단점

*   설정 `quality` 일부 장치 메모리 오류를 피하기 위해 50 아래.

*   사용 하는 경우 `destinationType.FILE_URI` , 사진 응용 프로그램의 임시 디렉터리에 저장 됩니다. 응용 프로그램이 종료 될 때 응용 프로그램의 임시 디렉터리의 내용은 삭제 됩니다.

### Tizen 특수

*   지원 되지 않는 옵션

*   항상 파일 URI를 반환 합니다.

### Windows Phone 7, 8 특수

*   무시는 `allowEdit` 매개 변수.

*   무시는 `correctOrientation` 매개 변수.

*   무시는 `cameraDirection` 매개 변수.

*   무시는 `saveToPhotoAlbum` 매개 변수. 중요: 모든 이미지 API wp7/8 코르도바 카메라로 촬영 항상 복사 됩니다 휴대 전화의 카메라 롤에. 사용자의 설정에 따라이 또한 그들의 OneDrive에 자동 업로드 이미지는 의미. 이 잠재적으로 이미지는 당신의 애플 리 케이 션을 위한 보다 넓은 청중에 게 사용할 수 있는 의미. 이 경우 응용 프로그램에 대 한 차단, 당신은 msdn에 설명 대로 단말기를 구현 해야 합니다: <http://msdn.microsoft.com/en-us/library/windowsphone/develop/hh394006.aspx> 수 있습니다 또한 의견 또는 [이슈 트래커][3] 에서 업-투표 관련된 문제

*   무시는 `mediaType` 속성을 `cameraOptions` 으로 Windows Phone SDK PHOTOLIBRARY에서 비디오를 선택 하는 방법을 제공 하지 않습니다.

 [3]: https://issues.apache.org/jira/browse/CB-2083

## CameraError

오류 메시지를 제공 하는 onError 콜백 함수.

    function(message) {
        // Show a helpful message
    }
    

### 매개 변수

*   **메시지**: 메시지는 장치의 네이티브 코드에 의해 제공 됩니다. *(문자열)*

## cameraSuccess

이미지 데이터를 제공 하는 onSuccess 콜백 함수.

    function(imageData) {
        // Do something with the image
    }
    

### 매개 변수

*   **imageData**: Base64 인코딩은 이미지 데이터, *또는* 이미지 파일에 따라 URI의 `cameraOptions` 적용. *(문자열)*

### 예를 들어

    // Show image
    //
    function cameraCallback(imageData) {
        var image = document.getElementById('myImage');
        image.src = "data:image/jpeg;base64," + imageData;
    }
    

## CameraPopoverHandle

`navigator.camera.getPicture`에 의해 만들어진 popover 대화에 대 한 핸들.

### 메서드

*   **setPosition**:는 popover의 위치를 설정 합니다.

### 지원 되는 플랫폼

*   iOS

### setPosition

popover의 위치를 설정 합니다.

**매개 변수**:

*   `cameraPopoverOptions`:는 `CameraPopoverOptions` 새 위치를 지정 하는

### 예를 들어

     var cameraPopoverHandle = navigator.camera.getPicture(onSuccess, onFail,
         { destinationType: Camera.DestinationType.FILE_URI,
           sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
           popoverOptions: new CameraPopoverOptions(300, 300, 100, 100, Camera.PopoverArrowDirection.ARROW_ANY)
         });
    
     // Reposition the popover if the orientation changes.
     window.onorientationchange = function() {
         var cameraPopoverOptions = new CameraPopoverOptions(0, 0, 100, 100, Camera.PopoverArrowDirection.ARROW_ANY);
         cameraPopoverHandle.setPosition(cameraPopoverOptions);
     }
    

## CameraPopoverOptions

iOS 전용 매개 변수 iPad의 보관 함 또는 앨범에서 이미지를 선택 하면 앵커 요소 위치와 화살표의 방향으로 popover 지정 하는.

    { x : 0,
      y :  32,
      width : 320,
      height : 480,
      arrowDir : Camera.PopoverArrowDirection.ARROW_ANY
    };
    

### CameraPopoverOptions

*   **x**: x는 popover 앵커는 화면 요소의 픽셀 좌표. *(수)*

*   **y**: y 픽셀 좌표는 popover 앵커는 화면 요소입니다. *(수)*

*   **폭**: 폭 (픽셀)는 popover 앵커는 화면 요소. *(수)*

*   **높이**: 높이 (픽셀)는 popover 앵커는 화면 요소. *(수)*

*   **arrowDir**: 방향 화살표는 popover 가리켜야 합니다. 에 정의 된 `Camera.PopoverArrowDirection` *(수)*
    
            Camera.PopoverArrowDirection = {
                ARROW_UP : 1,        // matches iOS UIPopoverArrowDirection constants
                ARROW_DOWN : 2,
                ARROW_LEFT : 4,
                ARROW_RIGHT : 8,
                ARROW_ANY : 15
            };
        

참고는 popover의 크기 조정 화살표 방향 및 화면 방향 변경 될 수 있습니다. 앵커 요소 위치를 지정 하는 경우 방향 변경에 대 한 계정에 있는지 확인 합니다.

## navigator.camera.cleanup

제거 임시 저장소에서 카메라로 찍은 사진을 중간.

    navigator.camera.cleanup( cameraSuccess, cameraError );
    

### 설명

`camera.getPicture`를 호출한 후 임시 저장소에 보관 됩니다 중간 이미지 파일을 제거 합니다. `Camera.sourceType` 값은 `Camera.PictureSourceType.CAMERA` 및 `Camera.destinationType`와 `Camera.DestinationType.FILE_URI` 때만 적용 됩니다..

### 지원 되는 플랫폼

*   iOS

### 예를 들어

    navigator.camera.cleanup(onSuccess, onFail);
    
    function onSuccess() {
        console.log("Camera cleanup success.")
    }
    
    function onFail(message) {
        alert('Failed because: ' + message);
    }
