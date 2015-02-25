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

Este plugin define un global `navigator.camera` objeto que proporciona una API para tomar fotografías y por elegir imágenes de biblioteca de imágenes del sistema.

Aunque el objeto está unido al ámbito global `navigator` , no estará disponible hasta después de la `deviceready` evento.

    document.addEventListener ("deviceready", onDeviceReady, false);
    function onDeviceReady() {console.log(navigator.camera)};
    

## Instalación

    Cordova plugin agregar org.apache.cordova.camera
    

## navigator.camera.getPicture

Toma una foto con la cámara, o recupera una foto de Galería de imágenes del dispositivo. La imagen se pasa a la devolución de llamada de éxito como un codificado en base64 `String` , o como el URI para el archivo de imagen. El método se devuelve un `CameraPopoverHandle` objeto que puede utilizarse para volver a colocar el popover de selección de archivo.

    navigator.camera.getPicture (cameraSuccess, cameraError, cameraOptions);
    

### Descripción

El `camera.getPicture` función abre la aplicación de cámara predeterminada del dispositivo que permite a los usuarios ajustar imágenes. Este comportamiento se produce de forma predeterminada, cuando `Camera.sourceType` es igual a `Camera.PictureSourceType.CAMERA` . Una vez que el usuario ajusta la foto, una aplicación de cámara se cierra y se restablecerá la aplicación.

Si `Camera.sourceType` es `Camera.PictureSourceType.PHOTOLIBRARY` o `Camera.PictureSourceType.SAVEDPHOTOALBUM` , entonces una muestra de diálogo que permite a los usuarios seleccionar una imagen existente. El `camera.getPicture` función devuelve un `CameraPopoverHandle` objeto, que puede utilizarse para volver a colocar el diálogo de selección de imagen, por ejemplo, cuando cambia la orientación del dispositivo.

El valor devuelto es enviado a la `cameraSuccess` función de callback, en uno de los formatos siguientes, dependiendo del objeto `cameraOptions` :

*   Una `String` que contiene la imagen codificada en base64.

*   Una `String` que representa la ubicación del archivo de imagen en almacenamiento local (por defecto).

Puedes hacer lo que quieras con la imagen codificada o URI, por ejemplo:

*   Representar la imagen en una etiqueta de `<img>`, como en el ejemplo siguiente

*   Guardar los datos localmente (`LocalStorage`, [Lawnchair][1], etc.)

*   Enviar los datos a un servidor remoto

 [1]: http://brianleroux.github.com/lawnchair/

**Nota**: resolución de la foto en los nuevos dispositivos es bastante bueno. Fotos seleccionadas de la Galería del dispositivo no son degradadas a una calidad más baja, incluso si un `quality` se especifica el parámetro. Para evitar problemas con la memoria común, establezca `Camera.destinationType` a `FILE_URI` en lugar de`DATA_URL`.

### Plataformas soportadas

*   Amazon fire OS
*   Android
*   BlackBerry 10
*   Explorador
*   Firefox OS
*   iOS
*   Tizen
*   Windows Phone 7 y 8
*   Windows 8

### Preferencias (iOS)

*   **CameraUsesGeolocation** (booleano, el valor predeterminado de false). Para la captura de imágenes JPEG, establecido en true para obtener datos de geolocalización en la cabecera EXIF. Esto activará la solicitud de permisos de geolocalización si establecido en true.
    
        <preference name="CameraUsesGeolocation" value="false" />
        

### Amazon fuego OS rarezas

Amazon fuego OS utiliza los intentos para poner en marcha la actividad de la cámara del dispositivo para capturar imágenes y en teléfonos con poca memoria, puede matar la actividad Cordova. En este escenario, la imagen no aparezca cuando se restaura la actividad cordova.

### Rarezas Android

Android utiliza los intentos para iniciar la actividad de la cámara del dispositivo para capturar imágenes, y en los teléfonos con poca memoria, puede matar la actividad Cordova. En este escenario, la imagen no aparezca cuando se restaura la actividad Cordova.

### Navegador rarezas

Sólo puede devolver fotos como imagen codificada en base64.

### Firefox OS rarezas

Cámara plugin actualmente se implementa mediante [Actividades Web][2].

 [2]: https://hacks.mozilla.org/2013/01/introducing-web-activities/

### iOS rarezas

Incluyendo un JavaScript `alert()` en cualquiera de la devolución de llamada funciones pueden causar problemas. Envuelva la alerta dentro de un `setTimeout()` para permitir que el selector de imagen iOS o popover cerrar completamente antes de la alerta se muestra:

    setTimeout(function() {/ / Haz lo tuyo aquí!}, 0);
    

### Windows Phone 7 rarezas

Invocando la aplicación de cámara nativa mientras el dispositivo está conectado vía Zune no funciona y desencadena un callback de error.

### Rarezas Tizen

Tizen sólo es compatible con un `destinationType` de `Camera.DestinationType.FILE_URI` y un `sourceType` de`Camera.PictureSourceType.PHOTOLIBRARY`.

### Ejemplo

Tomar una foto y recuperarlo como una imagen codificada en base64:

    navigator.camera.getPicture (onSuccess, onFail, { quality: 50,
        destinationType: Camera.DestinationType.DATA_URL
    });
    
    function onSuccess(imageData) {var imagen = document.getElementById('myImage');
        Image.src = "datos: image / jpeg; base64," + imageData;}
    
    function onFail(message) {alert (' falló porque: ' + mensaje);}
    

Tomar una foto y recuperar la ubicación del archivo de la imagen:

    navigator.camera.getPicture (onSuccess, onFail, { quality: 50,
        destinationType: Camera.DestinationType.FILE_URI });
    
    function onSuccess(imageURI) {var imagen = document.getElementById('myImage');
        Image.src = imageURI;
    } function onFail(message) {alert (' falló porque: ' + mensaje);}
    

## CameraOptions

Parámetros opcionales para personalizar la configuración de la cámara.

    {calidad: destinationType 75,: Camera.DestinationType.DATA_URL, sourceType: Camera.PictureSourceType.CAMERA, allowEdit: true, encodingType: Camera.EncodingType.JPEG, targetWidth: 100, targetHeight: 100, popoverOptions: CameraPopoverOptions, saveToPhotoAlbum: falsa};
    

### Opciones

*   **calidad**: calidad de la imagen guardada, expresada en un rango de 0-100, donde 100 es típicamente resolución sin pérdida de compresión del archivo. El valor predeterminado es 50. *(Número)* (Tenga en cuenta que no está disponible información sobre resolución de la cámara).

*   **destinationType**: elegir el formato del valor devuelto. El valor predeterminado es FILE_URI. Definido en `navigator.camera.DestinationType` *(número)*
    
        Camera.DestinationType = {
            DATA_URL : 0,      // Return image as base64-encoded string
            FILE_URI : 1,      // Return image file URI
            NATIVE_URI : 2     // Return image native URI (e.g., assets-library:// on iOS or content:// on Android)
        };
        

*   **sourceType**: establecer el origen de la imagen. El valor predeterminado es cámara. Definido en `navigator.camera.PictureSourceType` *(número)*
    
        Camera.PictureSourceType = {
            PHOTOLIBRARY : 0,
            CAMERA : 1,
            SAVEDPHOTOALBUM : 2
        };
        

*   **allowEdit**: permite edición sencilla de imagen antes de la selección. *(Booleano)*

*   **encodingType**: elegir la codificación del archivo de imagen devuelta. Por defecto es JPEG. Definido en `navigator.camera.EncodingType` *(número)*
    
        Camera.EncodingType = {
            JPEG : 0,               // Return JPEG encoded image
            PNG : 1                 // Return PNG encoded image
        };
        

*   **targetWidth**: ancho en píxeles a escala de la imagen. Debe usarse con **targetHeight**. Proporción se mantiene constante. *(Número)*

*   **targetHeight**: altura en píxeles a escala de la imagen. Debe usarse con **targetWidth**. Proporción se mantiene constante. *(Número)*

*   **mediaType**: definir el tipo de medios para seleccionar. Sólo funciona cuando `PictureSourceType` es `PHOTOLIBRARY` o `SAVEDPHOTOALBUM` . Definido en `nagivator.camera.MediaType` *(número)*
    
        Camera.MediaType = {
            PICTURE: 0,    // allow selection of still pictures only. DE FORMA PREDETERMINADA. Will return format specified via DestinationType
            VIDEO: 1,      // allow selection of video only, WILL ALWAYS RETURN FILE_URI
            ALLMEDIA : 2   // allow selection from all media types
        };
        

*   **correctOrientation**: rotar la imagen para corregir la orientación del dispositivo durante la captura. *(Booleano)*

*   **saveToPhotoAlbum**: guardar la imagen en el álbum de fotos en el dispositivo después de su captura. *(Booleano)*

*   **popoverOptions**: opciones sólo iOS que especifican popover ubicación en iPad. Definido en`CameraPopoverOptions`.

*   **cameraDirection**: elegir la cámara para usar (o parte posterior-frontal). El valor predeterminado es atrás. Definido en `navigator.camera.Direction` *(número)*
    
        Camera.Direction = {
            BACK : 0,      // Use the back-facing camera
            FRONT : 1      // Use the front-facing camera
        };
        

### Amazon fuego OS rarezas

*   Cualquier valor de `cameraDirection` da como resultado una foto orientada hacia atrás.

*   Ignora el `allowEdit` parámetro.

*   `Camera.PictureSourceType.PHOTOLIBRARY` y `Camera.PictureSourceType.SAVEDPHOTOALBUM` Mostrar el mismo álbum de fotos.

### Rarezas Android

*   Cualquier valor de `cameraDirection` da como resultado una foto orientada hacia atrás.

*   Ignora el `allowEdit` parámetro.

*   `Camera.PictureSourceType.PHOTOLIBRARY` y `Camera.PictureSourceType.SAVEDPHOTOALBUM` Mostrar el mismo álbum de fotos.

### BlackBerry 10 rarezas

*   Ignora el `quality` parámetro.

*   Ignora el `allowEdit` parámetro.

*   `Camera.MediaType`No se admite.

*   Ignora el `correctOrientation` parámetro.

*   Ignora el `cameraDirection` parámetro.

### Firefox OS rarezas

*   Ignora el `quality` parámetro.

*   `Camera.DestinationType`se ignora y es igual a `1` (URI del archivo de imagen)

*   Ignora el `allowEdit` parámetro.

*   Ignora el `PictureSourceType` parámetro (el usuario lo elige en una ventana de diálogo)

*   Ignora el`encodingType`

*   Ignora el `targetWidth` y`targetHeight`

*   `Camera.MediaType`No se admite.

*   Ignora el `correctOrientation` parámetro.

*   Ignora el `cameraDirection` parámetro.

### iOS rarezas

*   Establecer `quality` por debajo de 50 para evitar errores de memoria en algunos dispositivos.

*   Cuando se utiliza `destinationType.FILE_URI` , fotos se guardan en el directorio temporal de la aplicación. El contenido del directorio temporal de la aplicación se eliminará cuando finalice la aplicación.

### Rarezas Tizen

*   opciones no compatibles

*   siempre devuelve un identificador URI de archivo

### Windows Phone 7 y 8 rarezas

*   Ignora el `allowEdit` parámetro.

*   Ignora el `correctOrientation` parámetro.

*   Ignora el `cameraDirection` parámetro.

*   Ignora el `saveToPhotoAlbum` parámetro. IMPORTANTE: Todas las imágenes tomadas con la cámara wp7/8 cordova API siempre se copian en rollo de cámara del teléfono. Dependiendo de la configuración del usuario, esto podría significar también que la imagen es auto-subido a su OneDrive. Esto potencialmente podría significar que la imagen está disponible a una audiencia más amplia que su aplicación previsto. Si un bloqueador para su aplicación, usted necesitará aplicar el CameraCaptureTask como se documenta en msdn: <http://msdn.microsoft.com/en-us/library/windowsphone/develop/hh394006.aspx> también puede comentar o votar hasta el tema relacionado en el [issue tracker de][3]

*   Ignora el `mediaType` propiedad de `cameraOptions` como el SDK de Windows Phone no proporciona una manera para elegir vídeos fototeca.

 [3]: https://issues.apache.org/jira/browse/CB-2083

## CameraError

onError función callback que proporciona un mensaje de error.

    function(Message) {/ / Mostrar un mensaje útil}
    

### Parámetros

*   **mensaje**: el mensaje es proporcionado por código nativo del dispositivo. *(String)*

## cameraSuccess

onSuccess función callback que proporciona los datos de imagen.

    function(ImageData) {/ / hacer algo con la imagen}
    

### Parámetros

*   **imageData**: codificación en Base64 de los datos de imagen, *o* el archivo de imagen URI, dependiendo de `cameraOptions` en vigor. *(String)*

### Ejemplo

    Mostrar imagen / / function cameraCallback(imageData) {var imagen = document.getElementById('myImage');
        Image.src = "datos: image / jpeg; base64," + imageData;}
    

## CameraPopoverHandle

Un identificador para el cuadro de diálogo popover creado por`navigator.camera.getPicture`.

### Métodos

*   **setPosition**: establecer la posición de la popover.

### Plataformas soportadas

*   iOS

### setPosition

Establecer la posición de la popover.

**Parámetros**:

*   `cameraPopoverOptions`: el `CameraPopoverOptions` que especifican la nueva posición

### Ejemplo

     var cameraPopoverHandle = navigator.camera.getPicture (onSuccess, onFail, {destinationType: Camera.DestinationType.FILE_URI, sourceType: Camera.PictureSourceType.PHOTOLIBRARY, popoverOptions: CameraPopoverOptions nuevo (300, 300, 100, 100, Camera.PopoverArrowDirection.ARROW_ANY)});
    
     Vuelva a colocar el popover si cambia la orientación.
     Window.onorientationchange = function() {var cameraPopoverOptions = new CameraPopoverOptions (0, 0, 100, 100, Camera.PopoverArrowDirection.ARROW_ANY);
         cameraPopoverHandle.setPosition(cameraPopoverOptions);
     }
    

## CameraPopoverOptions

Sólo iOS parámetros que especifican la dirección ancla elemento ubicación y la flecha de la popover al seleccionar imágenes de biblioteca o álbum de un iPad.

    {x: 0, y: 32, ancho: 320, altura: 480, arrowDir: Camera.PopoverArrowDirection.ARROW_ANY};
    

### CameraPopoverOptions

*   **x**: coordenadas de píxeles del elemento de la pantalla en la que anclar el popover x. *(Número)*

*   **y**: coordenada píxeles del elemento de la pantalla en la que anclar el popover. *(Número)*

*   **anchura**: anchura, en píxeles, del elemento sobre el que anclar el popover pantalla. *(Número)*

*   **altura**: alto, en píxeles, del elemento sobre el que anclar el popover pantalla. *(Número)*

*   **arrowDir**: dirección de la flecha en el popover debe apuntar. Definido en `Camera.PopoverArrowDirection` *(número)*
    
            Camera.PopoverArrowDirection = {
                ARROW_UP : 1,        // matches iOS UIPopoverArrowDirection constants
                ARROW_DOWN : 2,
                ARROW_LEFT : 4,
                ARROW_RIGHT : 8,
                ARROW_ANY : 15
            };
        

Tenga en cuenta que puede cambiar el tamaño de la popover para ajustar la dirección de la flecha y orientación de la pantalla. Asegúrese de que para tener en cuenta los cambios de orientación cuando se especifica la ubicación del elemento de anclaje.

## Navigator.Camera.Cleanup

Elimina intermedio fotos tomadas por la cámara de almacenamiento temporal.

    Navigator.Camera.cleanup (cameraSuccess, cameraError);
    

### Descripción

Elimina intermedio archivos de imagen que se mantienen en depósito temporal después de llamar `camera.getPicture` . Se aplica sólo cuando el valor de `Camera.sourceType` es igual a `Camera.PictureSourceType.CAMERA` y el `Camera.destinationType` es igual a`Camera.DestinationType.FILE_URI`.

### Plataformas soportadas

*   iOS

### Ejemplo

    Navigator.Camera.cleanup (onSuccess, onFail);
    
    function onSuccess() {console.log ("cámara limpieza éxito.")}
    
    function onFail(message) {alert (' falló porque: ' + mensaje);}