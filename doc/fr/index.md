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

Ce plugin fournit une API pour la prise de photos et de choisir des images de libarary image du système.

    cordova plugin add org.apache.cordova.camera
    

## navigator.camera.getPicture

Prend une photo à l'aide de la caméra, ou récupère une photo de la Galerie d'images de l'appareil. L'image est passée au callback "succès" comme une `String` encodée en base64 ou l'URI du fichier de l'image. La méthode elle-même renvoie un objet `CameraPopoverHandle` qui permet de repositionner la boite de dialogue de selection d'image.

    navigator.camera.getPicture( cameraSuccess, cameraError, [ cameraOptions ] );
    

### Description

La fonction `camera.getPicture` ouvre l'application par défaut de l'appareil qui permet aux utilisateurs de prendre des photos. Ce comportement se produit par défaut, lorsque `Camera.sourceType` est égal à `Camera.PictureSourceType.CAMERA`. Une fois que l'utilisateur a pris la photo, l'application "camera" se ferme et l'application est restaurée.

Si `Camera.sourceType` est `Camera.PictureSourceType.PHOTOLIBRARY` ou `Camera.PictureSourceType.SAVEDPHOTOALBUM`, alors une boîte de dialogue s'affiche pour permettre aux utilisateurs de sélectionner une image existante. La fonction `camera.getPicture` retourne un objet `CameraPopoverHandle` qui permet de repositionner le dialogue de sélection d'image, par exemple, lorsque l'orientation de l'appareil change.

La valeur de retour est envoyée à la fonction callback `cameraSuccess`, dans l'un des formats suivants, selon spécifié par `cameraOptions` :

*   A `String` contenant l'image photo codée en base64.

*   A `String` qui représente l'emplacement du fichier image sur le stockage local (par défaut).

Vous pouvez faire ce que vous voulez avec l'image encodée ou l'URI, par exemple :

*   Afficher l'image dans un `<img>` tag, comme dans l'exemple ci-dessous

*   Enregistrer les données localement ( `LocalStorage` , [poids][1], etc..)

*   Publier les données sur un serveur distant

 [1]: http://brianleroux.github.com/lawnchair/

**NOTE**: la résolution de Photo sur les nouveaux appareils est assez bonne. Les photos sélectionnées de la Galerie de l'appareil ne sont pas réduites avec une baisse de la qualité, même si un paramètre de `qualité` est spécifié. Pour éviter les problèmes de mémoire, définissez `Camera.destinationType` à `FILE_URI` plutôt que `DATA_URL`.

### Plates-formes prises en charge

*   Amazon Fire OS
*   Android
*   BlackBerry 10
*   Firefox OS
*   iOS
*   Paciarelli
*   Windows Phone 7 et 8
*   Windows 8

### Amazon Fire OS Quirks

Amazon Fire OS utilise des intentions pour lancer l'activité de l'appareil photo sur l'appareil pour capturer des images et sur les téléphones avec peu de mémoire, l'activité de Cordova peut être tuée. Dans ce scénario, l'image peut ne pas apparaître lorsque l'activité de cordova est restaurée.

### Spécificités Android

*4.4 Android uniquement*: 4.4 Android a présenté un nouveau [Cadre d'accès de stockage][2] qui rend plus facile pour les utilisateurs de parcourir et ouvrir des documents dans l'ensemble de leurs fournisseurs de stockage de document préféré. Cordova n'a pas encore été entièrement intégré à ce nouveau cadre d'accès de stockage. Pour cette raison, la `getPicture()` méthode ne retournera pas correctement photos lorsque l'utilisateur sélectionne des dossiers "Récent", "Drive", "Images" ou "Stockage externe" lorsque le `destinationType` est `FILE_URI` . Toutefois, l'utilisateur sera en mesure de sélectionner correctement toutes les images si elles passent par l'application de la « Galerie » tout d'abord. Les solutions possibles à ce problème sont documentées sur [cette question de StackOverflow][3]. S'il vous plaît voir [CB-5398][4] pour suivre cette question.

 [2]: https://developer.android.com/guide/topics/providers/document-provider.html
 [3]: http://stackoverflow.com/questions/19834842/android-gallery-on-kitkat-returns-different-uri-for-intent-action-get-content/20177611
 [4]: https://issues.apache.org/jira/browse/CB-5398

Android utilise des objets de type Intends pour lancer l'activité de l'appareil photo sur le périphérique pour capturer des images. Sur les téléphones avec peu de mémoire, l'activité de Cordova peut être tuée. Dans ce scénario, l'image peut ne pas apparaître lorsque l'activité de Cordova est restaurée.

### Firefox OS Quirks

Appareil photo plugin est actuellement mis en œuvre à l'aide [d'Activités sur le Web][5].

 [5]: https://hacks.mozilla.org/2013/01/introducing-web-activities/

### iOS Quirks

L'inclusion d'un `alert()` JavaScript dans une des fonctions callback peut causer des problèmes. Encapsuler l'alerte dans un `setTimeout()` pour permettre au sélecteur d'images iOS de se fermer entièrement avant que l'alerte s'affiche :

    setTimeout(function() {/ / votre code ici!}, 0) ;
    

### Spécificités Windows Phone 7

Invoquant l'application native caméra alors que l'appareil est connecté via Zune ne fonctionne pas et déclenche un rappel de l'erreur.

### Spécificités Tizen

Tizen prend uniquement en charge un `destinationType` de `Camera.DestinationType.FILE_URI` et un `sourceType` de `Camera.PictureSourceType.PHOTOLIBRARY`.

### Exemple

Prendre une photo, puis l'extraire comme une image codée en base64 :

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
    

Prendre une photo et récupérer l'emplacement du fichier de l'image :

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

Paramètres optionnels de personnalisation des réglages de l'appareil photo.

    { quality : 75,
      destinationType : Camera.DestinationType.DATA_URL,
      sourceType : Camera.PictureSourceType.CAMERA,
      allowEdit : true,
      encodingType: Camera.EncodingType.JPEG,
      targetWidth: 100,
      targetHeight: 100,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: false };
    

### Options

*   **quality** : Qualité de l'image enregistrée, comprise entre 0 et 100, où 100 correspond à la pleine résolution de l'appareil, sans perte liée à la compression. *(Number)* (Notez que les informations sur la résolution de l'appareil photo sont indisponibles.)

*   **destinationType**: choisissez le format de la valeur de retour. Définies dans `navigator.camera.DestinationType` *(nombre)* 
    
        Camera.DestinationType = {
            DATA_URL : 0,      // Retourne l'image sous la forme d'une chaîne encodée en base-64
            FILE_URI : 1,      // Retourne l'URI du fichier image
            NATIVE_URI : 2     // Retourne l'URI native de l'image (ex. assets-library:// sur iOS ou content:// pour Android)
        };
        

*   **sourceType**: définissez la source de l'image. Définies dans `navigator.camera.PictureSourceType` *(nombre)* 
    
        Camera.PictureSourceType = {
            PHOTOLIBRARY : 0,
            CAMERA : 1,
            SAVEDPHOTOALBUM : 2
        };
        

*   **allowEdit**: Autoriser une modification simple de l'image avant sa sélection. *(Boolean)*

*   **encodingType**: choisir le fichier image retournée de codage. Définies dans `navigator.camera.EncodingType` *(nombre)* 
    
        Camera.EncodingType = {
            JPEG : 0,               // Renvoie l'image au format JPEG
            PNG : 1                 // Renvoie l'image au format PNG
        };
        

*   **targetWidth**: largeur de sortie en pixels de l'image . Doit être utilisé avec **targetHeight**. Le ratio de l'aspect reste constant. *(Nombre)*

*   **targetHeight**: hauteur de sortie en pixels de l'image. Doit être utilisé avec **targetWidth**. Aspect ratio reste constant. *(Nombre)*

*   **mediaType**: définit le type de média à choisir. Ne fonctionne que quand `PictureSourceType` vaut `PHOTOLIBRARY` ou `SAVEDPHOTOALBUM` . Définie dans `nagivator.camera.MediaType` *(nombre)* 
    
        Camera.MediaType = {photo: 0, / / permettre la sélection de photos seulement. PAR DÉFAUT. Retourne le format spécifié via DestinationType VIDEO: 1, / / autoriser la sélection de la vidéo seulement, RETOURNERA TOUJOURS FILE_URI ALLMEDIA: 2 // permet la sélection de tous les types de médias
        
    
    };

*   **correctOrientation**: faire pivoter l'image afin de corriger l'orientation de l'appareil lors de la capture. *(Booléen)*

*   **saveToPhotoAlbum**: enregistrer l'image sur l'album photo sur l'appareil après la capture. *(Booléen)*

*   **popoverOptions**: options pour iOS uniquement qui spécifient l'emplacement de la boîte de dialogue sur iPad. Définie dans`CameraPopoverOptions`.

*   **cameraDirection**: choisissez la caméra à utiliser (ou dos-face). Définies dans `navigator.camera.Direction` *(nombre)* 
    
        Camera.Direction = {BACK: 0, // utiliser la caméra arrière FRONT: 1 // utiliser la caméra frontale} ;
        

### Amazon Fire OSQuirks

*   Tout `cameraDirection` résultats dans le back-face photo de valeur.

*   Ignore le paramètre `allowEdit`.

*   `Camera.PictureSourceType.PHOTOLIBRARY`et `Camera.PictureSourceType.SAVEDPHOTOALBUM` les deux affichent le même album photo.

### Quirks Android

*   Tout `cameraDirection` résultats dans le back-face photo de valeur.

*   Ignore la `allowEdit` paramètre.

*   `Camera.PictureSourceType.PHOTOLIBRARY`et `Camera.PictureSourceType.SAVEDPHOTOALBUM` les deux affichent le même album photo.

### BlackBerry 10 Quirks

*   Ignore le paramètre `quality`.

*   Ignore le paramètre `sourceType`.

*   Ignore la `allowEdit` paramètre.

*   `Camera.MediaType` n'est pas pris en charge.

*   Ignore le paramètre `correctOrientation`.

*   Ignore le paramètre `cameraDirection`.

### Firefox OS Quirks

*   Ignore la `quality` paramètre.

*   `Camera.DestinationType`est ignorée et est égal à `1` (URI du fichier image)

*   Ignore la `allowEdit` paramètre.

*   Ignore la `PictureSourceType` paramètre (utilisateur il choisit dans une fenêtre de dialogue)

*   Ignore le`encodingType`

*   Ignore la `targetWidth` et`targetHeight`

*   `Camera.MediaType`n'est pas pris en charge.

*   Ignore la `correctOrientation` paramètre.

*   Ignore la `cameraDirection` paramètre.

### iOS Quirks

*   Choisir la valeur `quality` en dessous de 50 pour éviter les erreurs de mémoire sur certains appareils.

*   Lorsque vous utilisez `destinationType.FILE_URI` , les photos sont sauvegardées dans le répertoire temporaire de l'application. Vous pouvez supprimer le contenu de ce répertoire en utilisant l'API `navigator.fileMgr` si l'espace de stockage est un sujet de préoccupation.

### Bizarreries de paciarelli

*   options non prises en charge

*   retourne toujours un URI de fichier

### Windows Phone 7 et 8 Quirks

*   Ignore la `allowEdit` paramètre.

*   Ignore la `correctOrientation` paramètre.

*   Ignore la `cameraDirection` paramètre.

*   Ignore la `mediaType` propriété de `cameraOptions` comme le kit de développement Windows Phone ne fournit pas un moyen de choisir les vidéos de PHOTOLIBRARY.

## CameraError

Fonction callback onError qui fournit un message d'erreur.

    function(message) {
        // Show a helpful message
    }
    

### Paramètres

*   **message** : le message est fourni par du code natif de l'appareil. *(String)*

## cameraSuccess

Fonction de callback onSuccess qui fournit les données de l'image.

    function(imageData) {
        // Do something with the image
    }
    

### Paramètres

*   **imageData**: codage Base64 de l'image, *ou* le fichier image URI, selon `cameraOptions` utilisé. *(String)*

### Exemple

    // Show image
    //
    function cameraCallback(imageData) {
        var image = document.getElementById('myImage');
        image.src = "data:image/jpeg;base64," + imageData;
    }
    

## CameraPopoverHandle

Un handle vers la boîte de dialogue de kangourou créé par`navigator.camera.getPicture`.

### Méthodes

*   **setPosition**: Définit la position de la boite de dialogue.

### Plates-formes prises en charge

*   iOS

### setPosition

Définit la position de la boite de dialogue.

**Paramètres**:

*   `cameraPopoverOptions`: l'objet `CameraPopoverOptions` spécifiant la nouvelle position

### Exemple

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

Paramètres, uniquement supportés par iOS, spécifiant l'emplacement d'accroche et la direction de la flèche de la boite de dialogue liée à la sélection d'images dans la bibliothèque et les albums sur iPad.

    { x : 0, y :  32, width : 320, height : 480, arrowDir : Camera.PopoverArrowDirection.ARROW_ANY };
    

### CameraPopoverOptions

*   **x**: coordonnée en x (pixels) de l'élément à l'écran sur lequel accrocher la boite de dialogue. *(Number)*

*   **y**: coordonnée en y (pixels) de l'élément à l'écran sur lequel accrocher la boite de dialogue. *(Number)*

*   **width**: largeur en pixels de l'élément à l'écran sur lequel accrocher la boite de dialogue. *(Number)*

*   **height**: hauteur en pixels de l'élément à l'écran sur lequel accrocher la boite de dialogue. *(Number)*

*   **arrowDir**: Direction vers laquelle la flèche de la boîte de dialogue doit pointer. Définie dans `Camera.PopoverArrowDirection` *(Number)*
    
            Camera.PopoverArrowDirection = {
                ARROW_UP : 1,        // correspondent aux constantes iOS UIPopoverArrowDirection
                ARROW_DOWN : 2,
                ARROW_LEFT : 4,
                ARROW_RIGHT : 8,
                ARROW_ANY : 15
            };
        

Notez que la taille de la boite de dialogue peut varier afin de permettre l'ajustement de la direction de la flèche et de l'orientation de l'écran. Assurez-vous de tenir compte des changements d'orientation lors de la spécification de l'emplacement d'élément d'accroche.

## Navigator.Camera.Cleanup

Supprime les photos intermédiaires prises par la caméra sur le support de stockage temporaire.

    navigator.camera.cleanup( cameraSuccess, cameraError );
    

### Description

Supprime les fichiers d'image intermédiaire qui sont conservés dans le support de stockage temporaire après l'appel à `camera.getPicture`. S'applique uniquement lorsque la valeur de `Camera.sourceType` est égale à `Camera.PictureSourceType.CAMERA` et `Camera.destinationType` est égale à `Camera.DestinationType.FILE_URI`.

### Plates-formes prises en charge

*   iOS

### Exemple

    navigator.camera.cleanup(onSuccess, onFail);
    
    function onSuccess() {
        console.log("Camera cleanup success.")
    }
    
    function onFail(message) {
        alert('Failed because: ' + message);
    }