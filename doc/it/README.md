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

Questo plugin definisce un oggetto globale `navigator.camera`, che fornisce un'API per scattare foto e per aver scelto immagini dalla libreria di immagini del sistema.

Anche se l'oggetto è associato con ambito globale del `navigator`, non è disponibile fino a dopo l'evento `deviceready`.

    document.addEventListener("deviceready", onDeviceReady, false);
    function onDeviceReady() {
        console.log(navigator.camera);
    }
    

## Installazione

    cordova plugin add cordova-plugin-camera
    

## API

  * Fotocamera 
      * navigator.camera.getPicture(success, fail, options)
      * CameraOptions
      * CameraPopoverHandle
      * CameraPopoverOptions
      * navigator.camera.cleanup

## navigator.camera.getPicture

Prende una foto utilizzando la fotocamera, o recupera una foto dalla galleria di immagini del dispositivo. L'immagine è passata al callback di successo come `String` con codifica base64, o come l'URI per il file di immagine. Lo stesso metodo restituisce un oggetto `CameraPopoverHandle` che può essere utilizzato per riposizionare il Muffin di selezione file.

    navigator.camera.getPicture(cameraSuccess, cameraError, cameraOptions);
    

#### Descrizione

La funzione `camera.getPicture` apre predefinito fotocamera applicazione il dispositivo che consente agli utenti di scattare foto. Questo comportamento si verifica per impostazione predefinita, quando `Camera.sourceType` è uguale a `Camera.PictureSourceType.CAMERA`. Una volta che l'utente scatta la foto, si chiude l'applicazione fotocamera e l'applicazione viene ripristinato.

Se `Camera.sourceType` è `Camera.PictureSourceType.PHOTOLIBRARY` o `Camera.PictureSourceType.SAVEDPHOTOALBUM`, una finestra di dialogo Visualizza che permette agli utenti di selezionare un'immagine esistente. La funzione `camera.getPicture` restituisce un oggetto `CameraPopoverHandle` che può essere utilizzato per riposizionare la finestra di selezione immagine, ad esempio, quando l'orientamento del dispositivo.

Il valore restituito viene inviato alla funzione di callback `cameraSuccess`, in uno dei seguenti formati, a seconda il `cameraOptions` specificato:

  * A `String` contenente l'immagine della foto con codifica base64.

  * A `String` che rappresenta il percorso del file di immagine su archiviazione locale (predefinito).

Si può fare quello che vuoi con l'immagine codificata o URI, ad esempio:

  * Il rendering dell'immagine in un `<img>` tag, come nell'esempio qui sotto

  * Salvare i dati localmente ( `LocalStorage` , [Lawnchair](http://brianleroux.github.com/lawnchair/), ecc.)

  * Inviare i dati a un server remoto

**Nota**: risoluzione foto sui più recenti dispositivi è abbastanza buona. Foto selezionate dalla galleria del dispositivo non è percepiranno di qualità inferiore, anche se viene specificato un parametro di `quality`. Per evitare problemi di memoria comune, impostare `Camera.destinationType` `FILE_URI` piuttosto che `DATA_URL`.

#### Piattaforme supportate

![](doc/img/android-success.png) ![](doc/img/blackberry-success.png) ![](doc/img/browser-success.png) ![](doc/img/firefox-success.png) ![](doc/img/fireos-success.png) ![](doc/img/ios-success.png) ![](doc/img/windows-success.png) ![](doc/img/wp8-success.png) ![](doc/img/ubuntu-success.png)

#### Esempio

Scattare una foto e recuperarla come un'immagine con codifica base64:

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
    

Scattare una foto e recuperare il percorso del file dell'immagine:

    navigator.camera.getPicture(onSuccess, onFail, { quality: 50,
        destinationType: Camera.DestinationType.FILE_URI });
    
    function onSuccess(imageURI) {
        var image = document.getElementById('myImage');
        image.src = imageURI;
    }
    
    function onFail(message) {
        alert('Failed because: ' + message);
    }
    

#### Preferenze (iOS)

  * **CameraUsesGeolocation** (boolean, default è false). Per l'acquisizione di immagini JPEG, impostato su true per ottenere dati di geolocalizzazione nell'intestazione EXIF. Questo innescherà una richiesta per le autorizzazioni di geolocalizzazione, se impostato su true.
    
        <preference name="CameraUsesGeolocation" value="false" />
        

#### Amazon fuoco OS stranezze

Amazon fuoco OS utilizza intenti a lanciare l'attività della fotocamera sul dispositivo per catturare immagini e sui telefoni con poca memoria, l'attività di Cordova può essere ucciso. In questo scenario, l'immagine potrebbe non apparire quando viene ripristinata l'attività di cordova.

#### Stranezze Android

Android utilizza intenti a lanciare l'attività della fotocamera sul dispositivo per catturare immagini e sui telefoni con poca memoria, l'attività di Cordova può essere ucciso. In questo scenario, l'immagine potrebbe non apparire quando viene ripristinata l'attività di Cordova.

#### Stranezze browser

Può restituire solo la foto come immagine con codifica base64.

#### Firefox OS stranezze

Fotocamera plugin è attualmente implementato mediante [Web Activities](https://hacks.mozilla.org/2013/01/introducing-web-activities/).

#### iOS stranezze

Compreso un JavaScript `alert()` in una delle funzioni di callback può causare problemi. Avvolgere l'avviso all'interno di un `setTimeout()` per consentire la selezione immagine iOS o muffin per chiudere completamente la prima che viene visualizzato l'avviso:

    setTimeout(function() {
        // do your thing here!
    }, 0);
    

#### Windows Phone 7 capricci

Richiamando l'applicazione nativa fotocamera mentre il dispositivo è collegato tramite Zune non funziona e innesca un callback di errore.

#### Tizen stranezze

Tizen supporta solo a `destinationType` di `Camera.DestinationType.FILE_URI` e un `sourceType` di `Camera.PictureSourceType.PHOTOLIBRARY`.

## CameraOptions

Parametri opzionali per personalizzare le impostazioni della fotocamera.

    { quality : 75,
      destinationType : Camera.DestinationType.DATA_URL,
      sourceType : Camera.PictureSourceType.CAMERA,
      allowEdit : true,
      encodingType: Camera.EncodingType.JPEG,
      targetWidth: 100,
      targetHeight: 100,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: false };
    

  * **quality**: qualità dell'immagine salvata, espressa come un intervallo di 0-100, dove 100 è tipicamente piena risoluzione senza perdita di compressione file. Il valore predefinito è 50. *(Numero)* (Si noti che informazioni sulla risoluzione della fotocamera non sono disponibile).

  * **destinationType**: Scegli il formato del valore restituito. Il valore predefinito è FILE_URI. Definito in `navigator.camera.DestinationType` *(numero)*
    
        Camera.DestinationType = {
            DATA_URL : 0,      // Return image as base64-encoded string
            FILE_URI : 1,      // Return image file URI
            NATIVE_URI : 2     // Return image native URI (e.g., assets-library:// on iOS or content:// on Android)
        };
        

  * **sourceType**: impostare l'origine dell'immagine. Il valore predefinito è la fotocamera. Definito in `navigator.camera.PictureSourceType` *(numero)*
    
        Camera.PictureSourceType = {
            PHOTOLIBRARY : 0,
            CAMERA : 1,
            SAVEDPHOTOALBUM : 2
        };
        

  * **Proprietà allowEdit**: consentire la semplice modifica dell'immagine prima di selezione. *(Booleano)*

  * **encodingType**: scegliere il file immagine restituita di codifica. Predefinito è JPEG. Definito in `navigator.camera.EncodingType` *(numero)*
    
        Camera.EncodingType = {
            JPEG : 0,               // Return JPEG encoded image
            PNG : 1                 // Return PNG encoded image
        };
        

  * **targetWidth**: larghezza in pixel all'immagine della scala. Deve essere usato con **targetHeight**. Proporzioni rimane costante. *(Numero)*

  * **targetHeight**: altezza in pixel all'immagine della scala. Deve essere usato con **targetWidth**. Proporzioni rimane costante. *(Numero)*

  * **mediaType**: impostare il tipo di supporto per scegliere da. Funziona solo quando `PictureSourceType` è `PHOTOLIBRARY` o `SAVEDPHOTOALBUM` . Definito in `nagivator.camera.MediaType` *(numero)*
    
        Camera.MediaType = {
            PICTURE: 0,    // allow selection of still pictures only. PER IMPOSTAZIONE PREDEFINITA. Will return format specified via DestinationType
            VIDEO: 1,      // allow selection of video only, WILL ALWAYS RETURN FILE_URI
            ALLMEDIA : 2   // allow selection from all media types
        };
        

  * **correctOrientation**: ruotare l'immagine per correggere l'orientamento del dispositivo durante l'acquisizione. *(Booleano)*

  * **saveToPhotoAlbum**: salvare l'immagine nell'album di foto sul dispositivo dopo la cattura. *(Booleano)*

  * **popoverOptions**: solo iOS opzioni che specificano la posizione di muffin in iPad. Definito in`CameraPopoverOptions`.

  * **cameraDirection**: scegliere la telecamera da utilizzare (o retro-frontale). Il valore predefinito è tornato. Definito in `navigator.camera.Direction` *(numero)*
    
        Camera.Direction = {
            BACK : 0,      // Use the back-facing camera
            FRONT : 1      // Use the front-facing camera
        };
        

#### Amazon fuoco OS stranezze

  * Qualsiasi `cameraDirection` valore i risultati in una foto di lamatura.

  * Ignora il `allowEdit` parametro.

  * `Camera.PictureSourceType.PHOTOLIBRARY`e `Camera.PictureSourceType.SAVEDPHOTOALBUM` entrambi visualizzare l'album fotografico stesso.

#### Stranezze Android

  * Qualsiasi `cameraDirection` valore i risultati in una foto di lamatura.

  * Android utilizza anche l'attività di ritaglio per allowEdit, anche se raccolto dovrebbe funzionare ed effettivamente passare l'immagine ritagliata a Cordova, l'unico che funziona è sempre quello in bundle con l'applicazione di Google Plus foto. Altre colture potrebbero non funzionare.

  * `Camera.PictureSourceType.PHOTOLIBRARY`e `Camera.PictureSourceType.SAVEDPHOTOALBUM` entrambi visualizzare l'album fotografico stesso.

#### BlackBerry 10 capricci

  * Ignora il `quality` parametro.

  * Ignora il `allowEdit` parametro.

  * `Camera.MediaType`non è supportato.

  * Ignora il `correctOrientation` parametro.

  * Ignora il `cameraDirection` parametro.

#### Firefox OS stranezze

  * Ignora il `quality` parametro.

  * `Camera.DestinationType`viene ignorato e corrisponde a `1` (URI del file di immagine)

  * Ignora il `allowEdit` parametro.

  * Ignora il `PictureSourceType` parametro (utente ne sceglie in una finestra di dialogo)

  * Ignora il`encodingType`

  * Ignora le `targetWidth` e`targetHeight`

  * `Camera.MediaType`non è supportato.

  * Ignora il `correctOrientation` parametro.

  * Ignora il `cameraDirection` parametro.

#### iOS stranezze

  * Impostare `quality` inferiore al 50 per evitare errori di memoria su alcuni dispositivi.

  * Quando si utilizza `destinationType.FILE_URI` , foto vengono salvati nella directory temporanea dell'applicazione. Il contenuto della directory temporanea dell'applicazione viene eliminato quando l'applicazione termina.

#### Tizen stranezze

  * opzioni non supportate

  * restituisce sempre un URI del FILE

#### Windows Phone 7 e 8 stranezze

  * Ignora il `allowEdit` parametro.

  * Ignora il `correctOrientation` parametro.

  * Ignora il `cameraDirection` parametro.

  * Ignora il `saveToPhotoAlbum` parametro. IMPORTANTE: Tutte le immagini scattate con la fotocamera di cordova wp7/8 API vengono sempre copiate rotolo fotocamera del telefono cellulare. A seconda delle impostazioni dell'utente, questo potrebbe anche significare che l'immagine viene caricato in automatico a loro OneDrive. Questo potenzialmente potrebbe significare che l'immagine è disponibile a un pubblico più ampio di app destinate. Se questo un blocco dell'applicazione, sarà necessario implementare il CameraCaptureTask come documentato su msdn: <http://msdn.microsoft.com/en-us/library/windowsphone/develop/hh394006.aspx> si può anche commentare o up-voto la questione correlata nel [tracciatore di problemi](https://issues.apache.org/jira/browse/CB-2083)

  * Ignora la `mediaType` proprietà di `cameraOptions` come il SDK di Windows Phone non fornisce un modo per scegliere il video da PHOTOLIBRARY.

## CameraError

funzione di callback onError che fornisce un messaggio di errore.

    function(message) {
        // Show a helpful message
    }
    

#### Descrizione

  * **message**: il messaggio è fornito dal codice nativo del dispositivo. *(String)*

## cameraSuccess

funzione di callback onSuccess che fornisce i dati di immagine.

    function(imageData) {
        // Do something with the image
    }
    

#### Descrizione

  * **imageData**: Base64 codifica dei dati immagine, *o* il file di immagine URI, a seconda `cameraOptions` in vigore. *(String)*

#### Esempio

    // Show image
    //
    function cameraCallback(imageData) {
        var image = document.getElementById('myImage');
        image.src = "data:image/jpeg;base64," + imageData;
    }
    

## CameraPopoverHandle

Un handle per la finestra di dialogo di muffin creato da `navigator.camera.getPicture`.

#### Descrizione

  * **setPosition**: Set the position of the popover. Takes the `CameraPopoverOptions` that specify the new position.

#### Piattaforme supportate

![](doc/img/android-fail.png) ![](doc/img/blackberry-fail.png) ![](doc/img/browser-fail.png) ![](doc/img/firefox-fail.png) ![](doc/img/fireos-fail.png) ![](doc/img/ios-success.png) ![](doc/img/windows-fail.png) ![](doc/img/wp8-fail.png) ![](doc/img/ubuntu-fail.png)

#### Esempio

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

iOS solo parametri che specificano l'ancoraggio elemento posizione e freccia direzione il Muffin quando si selezionano le immagini dalla libreria un iPad o un album.

    { x : 0,
      y :  32,
      width : 320,
      height : 480,
      arrowDir : Camera.PopoverArrowDirection.ARROW_ANY
    };
    

#### Descrizione

  * **x**: pixel coordinata x dell'elemento dello schermo su cui ancorare il muffin. *(Numero)*

  * **y**: coordinata y di pixel dell'elemento dello schermo su cui ancorare il muffin. *(Numero)*

  * **width**: larghezza, in pixel, dell'elemento dello schermo su cui ancorare il muffin. *(Numero)*

  * **height**: altezza, in pixel, dell'elemento dello schermo su cui ancorare il muffin. *(Numero)*

  * **arrowDir**: direzione dovrebbe puntare la freccia il muffin. Definito in `Camera.PopoverArrowDirection` *(numero)*
    
            Camera.PopoverArrowDirection = {
                ARROW_UP : 1,        // matches iOS UIPopoverArrowDirection constants
                ARROW_DOWN : 2,
                ARROW_LEFT : 4,
                ARROW_RIGHT : 8,
                ARROW_ANY : 15
            };
        

Si noti che la dimensione del muffin possa cambiare per regolare la direzione della freccia e l'orientamento dello schermo. Assicurarsi che tenere conto di modifiche di orientamento quando si specifica la posizione di elemento di ancoraggio.

## navigator.camera.cleanup

Rimuove intermedio foto scattate con la fotocamera da deposito temporaneo.

    navigator.camera.cleanup( cameraSuccess, cameraError );
    

#### Descrizione

Rimuove i file di immagine intermedia che vengono tenuti in custodia temporanea dopo la chiamata a `camera.getPicture`. Si applica solo quando il valore di `Camera.sourceType` è uguale a `Camera.PictureSourceType.CAMERA` e il `Camera.destinationType` è uguale a `Camera.DestinationType.FILE_URI`.

#### Piattaforme supportate

![](doc/img/android-fail.png) ![](doc/img/blackberry-fail.png) ![](doc/img/browser-fail.png) ![](doc/img/firefox-fail.png) ![](doc/img/fireos-fail.png) ![](doc/img/ios-success.png) ![](doc/img/windows-fail.png) ![](doc/img/wp8-fail.png) ![](doc/img/ubuntu-fail.png)

#### Esempio

    navigator.camera.cleanup(onSuccess, onFail);
    
    function onSuccess() {
        console.log("Camera cleanup success.")
    }
    
    function onFail(message) {
        alert('Failed because: ' + message);
    }