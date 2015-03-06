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

# org.apache.cordova.camera

Этот плагин предоставляет API для съемки и для выбора изображения из библиотеки изображений системы.

    cordova plugin add org.apache.cordova.camera
    

## navigator.camera.getPicture

Снимает фотографию с помощью камеры, или получает фотографию из галереи изображений устройства. Изображение передается на функцию обратного вызова успешного завершения как `String` в base64-кодировке, или как URI указывающего на файл изображения. Метод возвращает объект `CameraPopoverHandle`, который может использоваться для перемещения инструмента выбора файла.

    navigator.camera.getPicture( cameraSuccess, cameraError, cameraOptions );
    

### Описание

Функция `camera.getPicture` открывает приложение камеры устройства, которое позволяет снимать фотографии. Это происходит по умолчанию, когда `Camera.sourceType` равно `Camera.PictureSourceType.CAMERA` . Как только пользователь делает снимок,приложение камеры закрывается и приложение восстанавливается.

Если `Camera.sourceType` является `Camera.PictureSourceType.PHOTOLIBRARY` или `Camera.PictureSourceType.SAVEDPHOTOALBUM` , то показывается диалоговое окно, которое позволяет пользователям выбрать существующее изображение. Функция `camera.getPicture` возвращает объект `CameraPopoverHandle` объект, который может использоваться для перемещения диалога выбора изображения, например, при изменении ориентации устройства.

Возвращаемое значение отправляется в функцию обратного вызова `cameraSuccess` в одном из следующих форматов, в зависимости от параметра `cameraOptions` :

*   A объект `String` содержащий фото изображение в base64-кодировке.

*   Объект `String` представляющий расположение файла изображения на локальном хранилище (по умолчанию).

Вы можете сделать все, что угодно вы хотите с закодированным изображением или URI, например:

*   Отобразить изображение с помощью тега `<img>`, как показано в примере ниже

*   Сохранять данные локально (`LocalStorage`, [Lawnchair][1], и т.д.)

*   Отправлять данные на удаленный сервер

 [1]: http://brianleroux.github.com/lawnchair/

**Примечание**: разрешение фото на более новых устройствах является достаточно хорошим. Фотографии из галереи устройства не масштабируются к более низкому качеству, даже если указан параметр `quality`. Чтобы избежать общих проблем с памятью, установите `Camera.destinationType` в `FILE_URI` вместо `DATA_URL`.

### Поддерживаемые платформы

*   Amazon Fire OS
*   Android
*   BlackBerry 10
*   Обозреватель
*   Firefox OS
*   iOS
*   Tizen
*   Windows Phone 7 и 8
*   Windows 8

### Предпочтения (iOS)

*   **CameraUsesGeolocation** (логическое значение, по умолчанию false). Для захвата изображения JPEG, значение true, чтобы получить данные геопозиционирования в заголовке EXIF. Это вызовет запрос на разрешения геолокации, если задано значение true.
    
        <preference name="CameraUsesGeolocation" value="false" />
        

### Особенности Amazon Fire OS

Amazon Fire OS используют намерения для запуска активности камеры на устройстве для съемки фотографий, и на устройствах с низким объемам памяти, активность Cordova может быть завершена. В этом случае изображение может не появиться при восстановлении активности Cordova.

### Особенности Android

Android используют намерения для запуска активности камеры на устройстве для съемки фотографий, и на устройствах с низким объемам памяти, активность Cordova может быть завершена. В этом случае изображение может не появиться при восстановлении активности Cordova.

### Браузер причуды

Может возвращать только фотографии как изображения в кодировке base64.

### Особенности Firefox OS

Плагин Camera на данный момент реализован с использованием [Web Activities][2].

 [2]: https://hacks.mozilla.org/2013/01/introducing-web-activities/

### Особенности iOS

Включение функции JavaScript `alert()` в любой из функций обратного вызова функции может вызвать проблемы. Оберните вызов alert в `setTimeout()` для позволения окну выбора изображений iOS полностью закрыться перед отображение оповещения:

    setTimeout(function() {/ / ваши вещи!}, 0);
    

### Особенности Windows Phone 7

Вызов встроенного приложения камеры, в то время как устройство подключено к Zune не работает, и инициирует обратный вызов для ошибки.

### Особенности Tizen

Tizen поддерживает только значение `destinationType` равное `Camera.DestinationType.FILE_URI` и значение `sourceType` равное `Camera.PictureSourceType.PHOTOLIBRARY`.

### Пример

Сделайте фотографию и получите его как изображение в base64-кодировке:

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
    

Сделайте фотографию и получить расположение файла с изображением:

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

Необязательные параметры для настройки параметров камеры.

    { quality : 75,
      destinationType : Camera.DestinationType.DATA_URL,
      sourceType : Camera.PictureSourceType.CAMERA,
      allowEdit : true,
      encodingType: Camera.EncodingType.JPEG,
      targetWidth: 100,
      targetHeight: 100,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: false };
    

### Параметры

*   **quality**: качество сохраняемого изображения, выражается в виде числа в диапазоне от 0 до 100, где 100 является обычно полным изображением без потери качества при сжатии. Значение по умолчанию — 50. *(Число)* (Обратите внимание, что информация о разрешении камеры недоступна.)

*   **параметр destinationType**: выберите формат возвращаемого значения. Значение по умолчанию — FILE_URI. Определяется в `navigator.camera.DestinationType` *(число)*
    
        Camera.DestinationType = {
        DATA_URL: 0, / / возвращение изображения в base64-кодировке строки 
        FILE_URI: 1, / / возврат файла изображения URI 
        NATIVE_URI: 2 / / возвращение образа собственного URI (например, Библиотека активов: / / на iOS или содержание: / / на андроиде)
        };
        

*   **тип источника**: установить источник рисунка. По умолчанию используется камера. Определяется в `navigator.camera.PictureSourceType` *(число)*
    
        Camera.PictureSourceType = {
        PHOTOLIBRARY: 0, 
        CAMERA: 1, 
        SAVEDPHOTOALBUM: 2
        };
        

*   **allowEdit**: позволит редактирование изображения средствами телефона перед окончательным выбором изображения. *(Логический)*

*   **Тип_шифрования**: выберите возвращенный файл в кодировку. Значение по умолчанию — JPEG. Определяется в `navigator.camera.EncodingType` *(число)*
    
        Camera.EncodingType = {
        JPEG: 0, // возвращает изображение в формате JPEG
        PNG: 1 // возвращает рисунок в формате PNG
        };
        

*   **targetWidth**: ширина изображения в пикселах к которой необходимо осуществить масштабирование. Это значение должно использоваться совместно с **targetHeight**. Пропорции изображения останутся неизменными. *(Число)*

*   **targetHeight**: высота изображения в пикселах к которой необходимо осуществить масштабирование. Это значение должно использоваться совместно с **targetWidth**. Пропорции изображения останутся неизменными. *(Число)*

*   **тип носителя**: Установите источник получения изображения, из которого надо выбрать изображение. Работает только если `PictureSourceType` равно `PHOTOLIBRARY` или `SAVEDPHOTOALBUM` . Определяется в `nagivator.camera.MediaType` *(число)*
    
        Camera.MediaType = {
        PICTURE: 0, / / разрешить выбор только сохраненных изображений. DEFAULT. Will return format specified via DestinationType
            VIDEO: 1,      // allow selection of video only, WILL ALWAYS RETURN FILE_URI
            ALLMEDIA : 2   // allow selection from all media types
        };
        

*   **correctOrientation**: вращает изображение, чтобы внести исправления к ориентации устройства во время захвата. *(Логический)*

*   **saveToPhotoAlbum**: сохранить изображение в фотоальбом на устройстве после захвата. *(Логическое)*

*   **popoverOptions**: только для iOS параметры, которые определяют местоположение инструмента в iPad. Определены в`CameraPopoverOptions`.

*   **cameraDirection**: выбрать камеру для использования (передней или задней стороне). Значение по умолчанию — обратно. Определяется в `navigator.camera.Direction` *(число)*
    
        Camera.Direction = {
            BACK : 0,      // Use the back-facing camera
            FRONT : 1      // Use the front-facing camera
        };
        

### Особенности Amazon Fire OS

*   Любое значение `cameraDirection` возвращает фотографию сделанную задней камерой.

*   Игнорирует параметр `allowEdit`.

*   Оба параметра `Camera.PictureSourceType.PHOTOLIBRARY` и `Camera.PictureSourceType.SAVEDPHOTOALBUM` отображают один и тот же фотоальбом.

### Особенности Android

*   Любое значение `cameraDirection` возвращает фотографию сделанную задней камерой.

*   Игнорирует параметр `allowEdit`.

*   Оба параметра `Camera.PictureSourceType.PHOTOLIBRARY` и `Camera.PictureSourceType.SAVEDPHOTOALBUM` отображают один и тот же фотоальбом.

### Особенности BlackBerry 10

*   Игнорирует `quality` параметр.

*   Игнорирует параметр `allowEdit`.

*   `Camera.MediaType` не поддерживается.

*   Игнорирует параметр `correctOrientation`.

*   Игнорирует параметр `cameraDirection`.

### Особенности Firefox OS

*   Игнорирует `quality` параметр.

*   Значение `Camera.DestinationType` игнорируется и равно `1` (URI для файла изображения)

*   Игнорирует параметр `allowEdit`.

*   Игнорирует параметр `PictureSourceType` (пользователь выбирает его в диалоговом окне)

*   Игнорирует параметр `encodingType`

*   Игнорирует `targetWidth` и `targetHeight`

*   `Camera.MediaType` не поддерживается.

*   Игнорирует параметр `correctOrientation`.

*   Игнорирует параметр `cameraDirection`.

### Особенности iOS

*   Установите `quality` ниже 50, для того чтобы избежать ошибок памяти на некоторых устройствах.

*   При использовании `destinationType.FILE_URI` , фотографии сохраняются во временном каталоге приложения. Содержимое приложения временного каталога удаляется при завершении приложения.

### Особенности Tizen

*   options, не поддерживается

*   всегда возвращает URI файла

### Особенности Windows Phone 7 и 8

*   Игнорирует параметр `allowEdit`.

*   Игнорирует параметр `correctOrientation`.

*   Игнорирует параметр `cameraDirection`.

*   Игнорирует `saveToPhotoAlbum` параметр. Важно: Все изображения, снятые камерой wp7/8 cordova API всегда копируются в рулон камеры телефона. В зависимости от параметров пользователя это также может означать, что изображение автоматически загружены на их OneDrive. Потенциально это может означать, что этот образ доступен для более широкой аудитории, чем ваше приложение предназначено. Если этот блокатор для вашего приложения, вам нужно будет осуществить CameraCaptureTask, как описано на сайте msdn: <http://msdn.microsoft.com/en-us/library/windowsphone/develop/hh394006.aspx> вы можете также комментарий или вверх голосование связанный с этим вопрос [отслеживания][3]

*   Игнорирует свойство `mediaType` объекта `cameraOptions` так как Windows Phone SDK не предоставляет способ выбрать видео из PHOTOLIBRARY.

 [3]: https://issues.apache.org/jira/browse/CB-2083

## CameraError

Функция обратного вызова вызываемая в случае возникновения ошибки.

    function(message) {
        // Show a helpful message
    }
    

### Параметры

*   **сообщение**: сообщение об ошибке предоставляемое платформой устройства. *(Строка)*

## cameraSuccess

Функция обратного вызова onSuccess, получающая данные изображения.

    function(imageData) {
        // Do something with the image
    }
    

### Параметры

*   **imageData**: Данные изображения в Base64 кодировке, *или* URI, в зависимости от применяемых параметров `cameraOptions`. *(Строка)*

### Пример

    // Show image
    //
    function cameraCallback(imageData) {
        var image = document.getElementById('myImage');
        image.src = "data:image/jpeg;base64," + imageData;
    }
    

## CameraPopoverHandle

Дескриптор диалогового окна инструмента, созданный `navigator.camera.getPicture`.

### Методы

*   **setPosition**: Задайте положение инструмента выбора изображения.

### Поддерживаемые платформы

*   iOS

### setPosition

Устанавливает положение инструмента выбора изображения.

**Параметры**:

*   `cameraPopoverOptions`: Объект `CameraPopoverOptions`, определяющий новое положение

### Пример

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

Параметры только для iOS, которые определяют расположение элемента привязки и направление стрелки инструмента при выборе изображений из библиотеки изображений iPad или альбома.

    {x: 0, y: 32, ширина: 320, высота: 480, arrowDir: Camera.PopoverArrowDirection.ARROW_ANY};
    

### CameraPopoverOptions

*   **x**: x координата в пикселях элемента экрана, на котором закрепить инструмента. *(Число)*

*   **x**: y координата в пикселях элемента экрана, на котором закрепить инструмента. *(Число)*

*   **width**: ширина в пикселях элемента экрана, на котором закрепить инструмент выбора изображения. *(Число)*

*   **height**: высота в пикселях элемента экрана, на котором закрепить инструмент выбора изображения. *(Число)*

*   **arrowDir**: Направление, куда должна указывать стрелка на инструменте. Определено в `Camera.PopoverArrowDirection` *(число)*
    
            Camera.PopoverArrowDirection = {
                ARROW_UP : 1,        // matches iOS UIPopoverArrowDirection constants
                ARROW_DOWN : 2,
                ARROW_LEFT : 4,
                ARROW_RIGHT : 8,
                ARROW_ANY : 15
            };
        

Обратите внимание, что размер инструмента может изменяться для корректировки в зависимости направлении стрелки и ориентации экрана. Убедитесь, что учитываете возможные изменения ориентации при указании расположения элемента привязки.

## navigator.camera.cleanup

Удаляет промежуточные фотографии, сделанные камерой из временного хранилища.

    navigator.camera.cleanup( cameraSuccess, cameraError );
    

### Описание

Удаляет промежуточные файлы изображений, которые хранятся во временном хранилище после вызова метода `camera.getPicture` . Применяется только тогда, когда значение `Camera.sourceType` равно `Camera.PictureSourceType.CAMERA` и `Camera.destinationType` равняется `Camera.DestinationType.FILE_URI`.

### Поддерживаемые платформы

*   iOS

### Пример

    navigator.camera.cleanup(onSuccess, onFail);
    
    function onSuccess() {
        console.log("Camera cleanup success.")
    }
    
    function onFail(message) {
        alert('Failed because: ' + message);
    }