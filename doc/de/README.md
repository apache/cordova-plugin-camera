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

# cordova-plugin-camera

[![Build Status](https://travis-ci.org/apache/cordova-plugin-camera.svg)](https://travis-ci.org/apache/cordova-plugin-camera)

Dieses Plugin definiert eine globale `navigator.camera`-Objekt, das eine API für Aufnahmen und für die Auswahl der Bilder aus dem System-Image-Library bietet.

Obwohl das Objekt mit der globalen Gültigkeitsbereich `navigator` verbunden ist, steht es nicht bis nach dem `Deviceready`-Ereignis.

    document.addEventListener("deviceready", onDeviceReady, false);
    function onDeviceReady() {
        console.log(navigator.camera);
    }
    

## Installation

    cordova plugin add cordova-plugin-camera
    

## API

  * Kamera 
      * navigator.camera.getPicture(success, fail, options)
      * CameraOptions
      * CameraPopoverHandle
      * CameraPopoverOptions
      * navigator.camera.cleanup

## navigator.camera.getPicture

Nimmt ein Foto mit der Kamera, oder ein Foto aus dem Gerät Bildergalerie abgerufen. Das Bild wird an den Erfolg-Rückruf als base64-codierte `String` oder als URI für die Image-Datei übergeben. Die Methode selbst gibt ein `CameraPopoverHandle`-Objekt, das verwendet werden kann, um die Datei-Auswahl-Popover neu zu positionieren.

    navigator.camera.getPicture(cameraSuccess, cameraError, cameraOptions);
    

#### Beschreibung

Die `camera.getPicture`-Funktion öffnet das Gerät Standard-Kamera-Anwendung, die Benutzern ermöglicht, Bilder ausrichten. Dieses Verhalten tritt in der Standardeinstellung, wenn `Camera.sourceType` `Camera.PictureSourceType.CAMERA` entspricht. Sobald der Benutzer die Fotoschnäpper, die Kameraanwendung geschlossen wird und die Anwendung wird wiederhergestellt.

Wenn `Camera.sourceType` `Camera.PictureSourceType.PHOTOLIBRARY` oder `Camera.PictureSourceType.SAVEDPHOTOALBUM` ist, dann wird ein Dialogfeld angezeigt, das Benutzern ermöglicht, ein vorhandenes Bild auszuwählen. Die `camera.getPicture`-Funktion gibt ein `CameraPopoverHandle`-Objekt, das verwendet werden kann, um die Bild-Auswahl-Dialog, z. B. beim ändert sich der Orientierung des Geräts neu positionieren.

Der Rückgabewert wird an die `cameraSuccess`-Callback-Funktion in einem der folgenden Formate, je nach dem angegebenen `cameraOptions` gesendet:

  * A `String` mit dem base64-codierte Foto-Bild.

  * A `String` , die die Bild-Datei-Stelle auf lokalem Speicher (Standard).

Sie können tun, was Sie wollen, mit dem codierten Bildes oder URI, zum Beispiel:

  * Rendern Sie das Bild in ein `<img>` Tag, wie im folgenden Beispiel

  * Die Daten lokal zu speichern ( `LocalStorage` , [Lawnchair](http://brianleroux.github.com/lawnchair/), etc..)

  * Post die Daten an einen entfernten server

**Hinweis**: Fotoauflösung auf neueren Geräten ist ganz gut. Fotos aus dem Gerät Galerie ausgewählt sind nicht zu einer niedrigeren Qualität herunterskaliert, selbst wenn ein `Qualität`-Parameter angegeben wird. Um Speicherprobleme zu vermeiden, legen Sie `Camera.destinationType` auf `FILE_URI` statt `DATA_URL`.

#### Unterstützte Plattformen

![](doc/img/android-success.png) ![](doc/img/blackberry-success.png) ![](doc/img/browser-success.png) ![](doc/img/firefox-success.png) ![](doc/img/fireos-success.png) ![](doc/img/ios-success.png) ![](doc/img/windows-success.png) ![](doc/img/wp8-success.png) ![](doc/img/ubuntu-success.png)

#### Beispiel

Nehmen Sie ein Foto und rufen Sie sie als base64-codierte Bild:

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
    

Nehmen Sie ein Foto und rufen Sie das Bild-Datei-Speicherort:

    navigator.camera.getPicture(onSuccess, onFail, { quality: 50,
        destinationType: Camera.DestinationType.FILE_URI });
    
    function onSuccess(imageURI) {
        var image = document.getElementById('myImage');
        image.src = imageURI;
    }
    
    function onFail(message) {
        alert('Failed because: ' + message);
    }
    

#### "Einstellungen" (iOS)

  * **CameraUsesGeolocation** (Boolean, Standardwert ist False). Zur Erfassung von JPEGs, auf true festgelegt, um Geolocation-Daten im EXIF-Header zu erhalten. Dies löst einen Antrag auf Geolocation-Berechtigungen, wenn auf True festgelegt.
    
        <preference name="CameraUsesGeolocation" value="false" />
        

#### Amazon Fire OS Macken

Amazon Fire OS verwendet Absichten zum Starten von der Kamera-Aktivität auf dem Gerät, um Bilder zu erfassen und auf Handys mit wenig Speicher, Cordova Tätigkeit getötet werden kann. In diesem Szenario kann das Bild nicht angezeigt, wenn die Aktivität von Cordova wiederhergestellt wird.

#### Android Eigenarten

Android verwendet Absichten zum Starten von der Kamera-Aktivität auf dem Gerät, um Bilder zu erfassen und auf Handys mit wenig Speicher, Cordova Tätigkeit getötet werden kann. In diesem Szenario kann das Bild nicht angezeigt, wenn die Aktivität von Cordova wiederhergestellt wird.

#### Browser-Eigenheiten

Fotos können nur als base64-codierte Bild zurückgeben werden.

#### Firefox OS Macken

Kamera-Plugin ist derzeit implementiert mithilfe von [Web-Aktivitäten](https://hacks.mozilla.org/2013/01/introducing-web-activities/).

#### iOS Macken

Einschließlich einer JavaScript-`alert()` entweder Rückruffunktionen kann Probleme verursachen. Wickeln Sie die Warnung innerhalb eine `setTimeout()` erlauben die iOS-Bild-Picker oder Popover vollständig zu schließen, bevor die Warnung angezeigt:

    setTimeout(function() {
        // do your thing here!
    }, 0);
    

#### Windows Phone 7 Macken

Die native Kameraanwendung aufrufen, während das Gerät via Zune angeschlossen ist funktioniert nicht und löst eine Fehler-Callback.

#### Tizen Macken

Tizen unterstützt nur ein `DestinationType` von `Camera.DestinationType.FILE_URI` und ein `SourceType` von `Camera.PictureSourceType.PHOTOLIBRARY`.

## CameraOptions

Optionale Parameter die Kameraeinstellungen anpassen.

    { quality : 75,
      destinationType : Camera.DestinationType.DATA_URL,
      sourceType : Camera.PictureSourceType.CAMERA,
      allowEdit : true,
      encodingType: Camera.EncodingType.JPEG,
      targetWidth: 100,
      targetHeight: 100,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: false };
    

  * **Qualität**: Qualität des gespeicherten Bildes, ausgedrückt als ein Bereich von 0-100, wo 100 in der Regel voller Auflösung ohne Verlust aus der Dateikomprimierung ist. Der Standardwert ist 50. *(Anzahl)* (Beachten Sie, dass Informationen über die Kamera Auflösung nicht verfügbar ist.)

  * **DestinationType**: Wählen Sie das Format des Rückgabewerts. Der Standardwert ist FILE_URI. Im Sinne `navigator.camera.DestinationType` *(Anzahl)*
    
        Camera.DestinationType = {
            DATA_URL : 0,      // Return image as base64-encoded string
            FILE_URI : 1,      // Return image file URI
            NATIVE_URI : 2     // Return image native URI (e.g., assets-library:// on iOS or content:// on Android)
        };
        

  * **SourceType**: Legen Sie die Quelle des Bildes. Der Standardwert ist die Kamera. Im Sinne `navigator.camera.PictureSourceType` *(Anzahl)*
    
        Camera.PictureSourceType = {
            PHOTOLIBRARY : 0,
            CAMERA : 1,
            SAVEDPHOTOALBUM : 2
        };
        

  * **AllowEdit**: einfache Bearbeitung des Bildes vor Auswahl zu ermöglichen. *(Boolesch)*

  * **EncodingType**: die zurückgegebene Image-Datei ist Codierung auswählen. Standardwert ist JPEG. Im Sinne `navigator.camera.EncodingType` *(Anzahl)*
    
        Camera.EncodingType = {
            JPEG : 0,               // Return JPEG encoded image
            PNG : 1                 // Return PNG encoded image
        };
        

  * **TargetWidth**: Breite in Pixel zum Bild skalieren. Muss mit **TargetHeight**verwendet werden. Seitenverhältnis bleibt konstant. *(Anzahl)*

  * **TargetHeight**: Höhe in Pixel zum Bild skalieren. Muss mit **TargetWidth**verwendet werden. Seitenverhältnis bleibt konstant. *(Anzahl)*

  * **MediaType**: Legen Sie den Typ der Medien zur Auswahl. Funktioniert nur, wenn `PictureSourceType` ist `PHOTOLIBRARY` oder `SAVEDPHOTOALBUM` . Im Sinne `nagivator.camera.MediaType` *(Anzahl)*
    
        Camera.MediaType = {
            PICTURE: 0,    // allow selection of still pictures only. STANDARD. Will return format specified via DestinationType
            VIDEO: 1,      // allow selection of video only, WILL ALWAYS RETURN FILE_URI
            ALLMEDIA : 2   // allow selection from all media types
        };
        

  * **CorrectOrientation**: Drehen Sie das Bild um die Ausrichtung des Geräts während der Aufnahme zu korrigieren. *(Boolesch)*

  * **SaveToPhotoAlbum**: das Bild auf das Fotoalbum auf dem Gerät zu speichern, nach Einnahme. *(Boolesch)*

  * **PopoverOptions**: iOS-nur Optionen, die Popover Lage in iPad angeben. In definierten`CameraPopoverOptions`.

  * **CameraDirection**: Wählen Sie die Kamera (vorn oder hinten-gerichtete) verwenden. Der Standardwert ist zurück. Im Sinne `navigator.camera.Direction` *(Anzahl)*
    
        Camera.Direction = {
            BACK : 0,      // Use the back-facing camera
            FRONT : 1      // Use the front-facing camera
        };
        

#### Amazon Fire OS Macken

  * `cameraDirection`Ergebnisse in einem hinten gerichteter Foto Wert.

  * Ignoriert die `allowEdit` Parameter.

  * `Camera.PictureSourceType.PHOTOLIBRARY`und `Camera.PictureSourceType.SAVEDPHOTOALBUM` beide das gleiche Fotoalbum anzuzeigen.

#### Android Eigenarten

  * `cameraDirection`Ergebnisse in einem hinten gerichteter Foto Wert.

  * Android verwendet auch die Ernte-Aktivität für AllowEdit, obwohl Ernte sollte arbeiten und das zugeschnittene Bild zurück zu Cordova, das einzige, dass Werke konsequent die gebündelt mit der Google-Plus-Fotos-Anwendung ist tatsächlich zu übergeben. Andere Kulturen funktioniert möglicherweise nicht.

  * `Camera.PictureSourceType.PHOTOLIBRARY`und `Camera.PictureSourceType.SAVEDPHOTOALBUM` beide das gleiche Fotoalbum anzuzeigen.

#### BlackBerry 10 Macken

  * Ignoriert die `quality` Parameter.

  * Ignoriert die `allowEdit` Parameter.

  * `Camera.MediaType`wird nicht unterstützt.

  * Ignoriert die `correctOrientation` Parameter.

  * Ignoriert die `cameraDirection` Parameter.

#### Firefox OS Macken

  * Ignoriert die `quality` Parameter.

  * `Camera.DestinationType`wird ignoriert, und gleich `1` (Bilddatei-URI)

  * Ignoriert die `allowEdit` Parameter.

  * Ignoriert die `PictureSourceType` Parameter (Benutzer wählt es in einem Dialogfenster)

  * Ignoriert die`encodingType`

  * Ignoriert die `targetWidth` und`targetHeight`

  * `Camera.MediaType`wird nicht unterstützt.

  * Ignoriert die `correctOrientation` Parameter.

  * Ignoriert die `cameraDirection` Parameter.

#### iOS Macken

  * Legen Sie `quality` unter 50 Speicherfehler auf einigen Geräten zu vermeiden.

  * Bei der Verwendung `destinationType.FILE_URI` , Fotos werden im temporären Verzeichnis der Anwendung gespeichert. Den Inhalt des temporären Verzeichnis der Anwendung wird gelöscht, wenn die Anwendung beendet.

#### Tizen Macken

  * nicht unterstützte Optionen

  * gibt immer einen Datei-URI

#### Windows Phone 7 und 8 Eigenarten

  * Ignoriert die `allowEdit` Parameter.

  * Ignoriert die `correctOrientation` Parameter.

  * Ignoriert die `cameraDirection` Parameter.

  * Ignoriert die `saveToPhotoAlbum` Parameter. WICHTIG: Alle Aufnahmen die wp7/8 Cordova-Kamera-API werden immer in Kamerarolle des Telefons kopiert. Abhängig von den Einstellungen des Benutzers könnte dies auch bedeuten, dass das Bild in ihre OneDrive automatisch hochgeladen ist. Dies könnte möglicherweise bedeuten, dass das Bild für ein breiteres Publikum als Ihre Anwendung vorgesehen ist. Wenn diese einen Blocker für Ihre Anwendung, Sie müssen die CameraCaptureTask zu implementieren, wie im Msdn dokumentiert: <http://msdn.microsoft.com/en-us/library/windowsphone/develop/hh394006.aspx> Sie können kommentieren oder Up-Abstimmung das Beiträge zu diesem Thema im [Bugtracker](https://issues.apache.org/jira/browse/CB-2083)

  * Ignoriert die `mediaType` -Eigenschaft des `cameraOptions` wie das Windows Phone SDK keine Möglichkeit, Fotothek Videos wählen.

## CameraError

onError-Callback-Funktion, die eine Fehlermeldung bereitstellt.

    function(message) {
        // Show a helpful message
    }
    

#### Beschreibung

  * **Meldung**: die Nachricht wird durch das Gerät systemeigenen Code bereitgestellt. *(String)*

## cameraSuccess

onSuccess Callback-Funktion, die die Bilddaten bereitstellt.

    function(imageData) {
        // Do something with the image
    }
    

#### Beschreibung

  * **CMYK**: Base64-Codierung der Bilddaten, *oder* die Image-Datei-URI, je nach `cameraOptions` in Kraft. *(String)*

#### Beispiel

    // Show image
    //
    function cameraCallback(imageData) {
        var image = document.getElementById('myImage');
        image.src = "data:image/jpeg;base64," + imageData;
    }
    

## CameraPopoverHandle

Ein Handle für das Dialogfeld "Popover" erstellt von `navigator.camera.getPicture`.

#### Beschreibung

  * **setPosition**: Set the position of the popover. Takes the `CameraPopoverOptions` that specify the new position.

#### Unterstützte Plattformen

![](doc/img/android-fail.png) ![](doc/img/blackberry-fail.png) ![](doc/img/browser-fail.png) ![](doc/img/firefox-fail.png) ![](doc/img/fireos-fail.png) ![](doc/img/ios-success.png) ![](doc/img/windows-fail.png) ![](doc/img/wp8-fail.png) ![](doc/img/ubuntu-fail.png)

#### Beispiel

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

nur iOS-Parametern, die Anker-Element Lage und Pfeil Richtung der Popover angeben, bei der Auswahl von Bildern aus einem iPad Bibliothek oder Album.

    { x : 0,
      y :  32,
      width : 320,
      height : 480,
      arrowDir : Camera.PopoverArrowDirection.ARROW_ANY
    };
    

#### Beschreibung

  * **X**: x Pixelkoordinate des Bildschirmelement auf dem der Popover zu verankern. *(Anzahl)*

  * **y**: y Pixelkoordinate des Bildschirmelement auf dem der Popover zu verankern. *(Anzahl)*

  * **width**: Breite in Pixeln, das Bildschirmelement auf dem der Popover zu verankern. *(Anzahl)*

  * **height**: Höhe in Pixeln, das Bildschirmelement auf dem der Popover zu verankern. *(Anzahl)*

  * **arrowDir**: Richtung der Pfeil auf der Popover zeigen sollte. Im Sinne `Camera.PopoverArrowDirection` *(Anzahl)*
    
            Camera.PopoverArrowDirection = {
                ARROW_UP : 1,        // matches iOS UIPopoverArrowDirection constants
                ARROW_DOWN : 2,
                ARROW_LEFT : 4,
                ARROW_RIGHT : 8,
                ARROW_ANY : 15
            };
        

Beachten Sie, dass die Größe der Popover ändern kann, um die Richtung des Pfeils und Ausrichtung des Bildschirms anzupassen. Achten Sie darauf, um Orientierung zu berücksichtigen, wenn Sie den Anker-Element-Speicherort angeben.

## navigator.camera.cleanup

Entfernt Mittelstufe Fotos von der Kamera aus der vorübergehenden Verwahrung genommen.

    navigator.camera.cleanup( cameraSuccess, cameraError );
    

#### Beschreibung

Fortgeschrittene Image-Dateien, die in vorübergehender Verwahrung gehalten werden, nach dem Aufruf von `camera.getPicture` entfernt. Gilt nur wenn der Wert von `Camera.sourceType` gleich `Camera.PictureSourceType.CAMERA` und `Camera.destinationType` gleich `Camera.DestinationType.FILE_URI`.

#### Unterstützte Plattformen

![](doc/img/android-fail.png) ![](doc/img/blackberry-fail.png) ![](doc/img/browser-fail.png) ![](doc/img/firefox-fail.png) ![](doc/img/fireos-fail.png) ![](doc/img/ios-success.png) ![](doc/img/windows-fail.png) ![](doc/img/wp8-fail.png) ![](doc/img/ubuntu-fail.png)

#### Beispiel

    navigator.camera.cleanup(onSuccess, onFail);
    
    function onSuccess() {
        console.log("Camera cleanup success.")
    }
    
    function onFail(message) {
        alert('Failed because: ' + message);
    }