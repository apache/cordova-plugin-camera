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

Ce plugin définit un global `navigator.camera` objet qui fournit une API pour la prise de photos et de choisir des images de la bibliothèque d'images du système.

Bien que l'objet est attaché à la portée globale `navigator` , il n'est pas disponible jusqu'après la `deviceready` événement.

    document.addEventListener (« deviceready », onDeviceReady, false) ;
    function onDeviceReady() {console.log(navigator.camera);}
    

## Installation

    cordova plugin add cordova-plugin-camera
    

## API

  * Appareil photo 
      * navigator.camera.getPicture(success, fail, options)
      * CameraOptions
      * CameraPopoverHandle
      * CameraPopoverOptions
      * Navigator.Camera.Cleanup

## navigator.camera.getPicture

Prend une photo à l'aide de la caméra, ou récupère une photo de la Galerie d'images de l'appareil. L'image est passé au rappel succès comme un codage base64 `String` , ou comme l'URI du fichier de l'image. La méthode elle-même retourne un `CameraPopoverHandle` objet qui permet de repositionner le kangourou de sélection de fichier.

    navigator.camera.getPicture(cameraSuccess, cameraError, cameraOptions);
    

#### Description

Le `camera.getPicture` fonction ouvre l'application de caméra par défaut de l'appareil qui permet aux utilisateurs de prendre des photos. Ce comportement se produit par défaut, lorsque `Camera.sourceType` est égal à `Camera.PictureSourceType.CAMERA` . Une fois que l'utilisateur s'enclenche la photo, l'application appareil photo se ferme et l'application est restaurée.

Si `Camera.sourceType` est `Camera.PictureSourceType.PHOTOLIBRARY` ou `Camera.PictureSourceType.SAVEDPHOTOALBUM` , puis un dialogue affiche qui permet aux utilisateurs de sélectionner une image existante. Le `camera.getPicture` retourne un `CameraPopoverHandle` objet, ce qui permet de repositionner le dialogue de sélection d'image, par exemple, lorsque l'orientation de l'appareil change.

La valeur de retour est envoyée à la `cameraSuccess` la fonction de rappel, dans l'un des formats suivants, selon les `cameraOptions` :

  * A `String` contenant l'image photo codée en base64.

  * A `String` qui représente l'emplacement du fichier image sur le stockage local (par défaut).

Vous pouvez faire ce que vous voulez avec l'image codée ou URI, par exemple :

  * Afficher l'image dans un `<img>` tag, comme dans l'exemple ci-dessous

  * Enregistrer les données localement ( `LocalStorage` , [poids](http://brianleroux.github.com/lawnchair/), etc..)

  * Publier les données sur un serveur distant

**NOTE**: la résolution de Photo sur les nouveaux appareils est assez bonne. Photos sélectionnées de la Galerie de l'appareil ne sont pas réduites à une baisse de la qualité, même si un `quality` paramètre est spécifié. Pour éviter les problèmes de mémoire commun, définissez `Camera.destinationType` à `FILE_URI` au lieu de`DATA_URL`.

#### Plates-formes supportées

![](doc/img/android-success.png) ![](doc/img/blackberry-success.png) ![](doc/img/browser-success.png) ![](doc/img/firefox-success.png) ![](doc/img/fireos-success.png) ![](doc/img/ios-success.png) ![](doc/img/windows-success.png) ![](doc/img/wp8-success.png) ![](doc/img/ubuntu-success.png)

#### Exemple

Prendre une photo, puis extrayez-la comme une image codée en base64 :

    navigator.camera.getPicture (onSuccess, onFail, { quality: 50,
        destinationType: Camera.DestinationType.DATA_URL
    }) ;
    
    function onSuccess(imageData) {var image = document.getElementById('myImage') ;
        image.src = "données : image / jpeg ; base64," + imageData;}
    
    function onFail(message) {alert (' a échoué car: "+ message);}
    

Prendre une photo et récupérer l'emplacement du fichier de l'image :

    navigator.camera.getPicture (onSuccess, onFail, { quality: 50,
        destinationType: Camera.DestinationType.FILE_URI }) ;
    
    function onSuccess(imageURI) {var image = document.getElementById('myImage') ;
        image.SRC = imageURI ;
    } function onFail(message) {alert (' a échoué car: "+ message);}
    

#### Préférences (iOS)

  * **CameraUsesGeolocation** (boolean, par défaut, false). Pour capturer des images JPEG, true pour obtenir des données de géolocalisation dans l'en-tête EXIF. Cela va déclencher une demande d'autorisations de géolocalisation si défini à true.
    
        <preference name="CameraUsesGeolocation" value="false" />
        

#### Amazon Fire OS Quirks

Amazon Fire OS utilise des intentions pour lancer l'activité de l'appareil photo sur l'appareil pour capturer des images et sur les téléphones avec peu de mémoire, l'activité de Cordova peut être tuée. Dans ce scénario, l'image peut ne pas apparaître lorsque l'activité de cordova est restaurée.

#### Quirks Android

Android utilise des intentions pour lancer l'activité de l'appareil photo sur l'appareil pour capturer des images et sur les téléphones avec peu de mémoire, l'activité de Cordova peut être tuée. Dans ce scénario, l'image peut ne pas apparaître lorsque l'activité de Cordova est restaurée.

#### Bizarreries navigateur

Peut retourner uniquement les photos comme image codée en base64.

#### Firefox OS Quirks

Appareil photo plugin est actuellement mis en œuvre à l'aide [d'Activités sur le Web](https://hacks.mozilla.org/2013/01/introducing-web-activities/).

#### Notes au sujet d'iOS

Y compris un JavaScript `alert()` dans les deux le rappel fonctions peuvent causer des problèmes. Envelopper l'alerte dans un `setTimeout()` pour permettre le sélecteur d'image iOS ou kangourou pour fermer entièrement avant que l'alerte s'affiche :

    setTimeout(function() {/ / faire votre truc ici!}, 0) ;
    

#### Windows Phone 7 Quirks

Invoquant l'application native caméra alors que l'appareil est connecté via Zune ne fonctionne pas et déclenche un rappel de l'erreur.

#### Bizarreries de paciarelli

Paciarelli prend uniquement en charge un `destinationType` de `Camera.DestinationType.FILE_URI` et un `sourceType` de`Camera.PictureSourceType.PHOTOLIBRARY`.

## CameraOptions

Paramètres optionnels pour personnaliser les réglages de l'appareil.

    {qualité : destinationType 75,: Camera.DestinationType.DATA_URL, TypeSource : Camera.PictureSourceType.CAMERA, allowEdit : encodingType vrai,: Camera.EncodingType.JPEG, targetWidth : 100, targetHeight : 100, popoverOptions : CameraPopoverOptions, saveToPhotoAlbum : false} ;
    

  * **qualité**: qualité de l'image enregistrée, exprimée en une gamme de 0 à 100, 100 étant généralement pleine résolution sans perte de compression de fichiers. La valeur par défaut est 50. *(Nombre)* (Notez que les informations sur la résolution de la caméra sont indisponibles).

  * **destinationType**: choisissez le format de la valeur de retour. La valeur par défaut est FILE_URI. Définies dans `navigator.camera.DestinationType` *(nombre)*
    
        Camera.DestinationType = {
            DATA_URL : 0,      // Return image as base64-encoded string
            FILE_URI : 1,      // Return image file URI
            NATIVE_URI : 2     // Return image native URI (e.g., assets-library:// on iOS or content:// on Android)
        };
        

  * **sourceType**: définissez la source de l'image. La valeur par défaut est la caméra. Définies dans `navigator.camera.PictureSourceType` *(nombre)*
    
        Camera.PictureSourceType = {
            PHOTOLIBRARY : 0,
            CAMERA : 1,
            SAVEDPHOTOALBUM : 2
        };
        

  * **allowEdit**: permettre un montage simple d'image avant la sélection. *(Booléen)*

  * **encodingType**: choisir le fichier image retournée de codage. Valeur par défaut est JPEG. Définies dans `navigator.camera.EncodingType` *(nombre)*
    
        Camera.EncodingType = {
            JPEG : 0,               // Return JPEG encoded image
            PNG : 1                 // Return PNG encoded image
        };
        

  * **targetWidth**: largeur en pixels de l'image de l'échelle. Doit être utilisé avec **targetHeight**. Aspect ratio reste constant. *(Nombre)*

  * **targetHeight**: hauteur en pixels de l'image de l'échelle. Doit être utilisé avec **targetWidth**. Aspect ratio reste constant. *(Nombre)*

  * **mediaType**: définir le type de média pour choisir de. Ne fonctionne que quand `PictureSourceType` est `PHOTOLIBRARY` ou `SAVEDPHOTOALBUM` . Définies dans `nagivator.camera.MediaType` *(nombre)*
    
        Camera.MediaType = {
            PICTURE: 0,    // allow selection of still pictures only. PAR DÉFAUT. Will return format specified via DestinationType
            VIDEO: 1,      // allow selection of video only, WILL ALWAYS RETURN FILE_URI
            ALLMEDIA : 2   // allow selection from all media types
        };
        

  * **correctOrientation**: faire pivoter l'image afin de corriger l'orientation de l'appareil lors de la capture. *(Booléen)*

  * **saveToPhotoAlbum**: enregistrer l'image sur l'album photo sur l'appareil après la capture. *(Booléen)*

  * **popoverOptions**: iOS uniquement des options qui spécifient l'emplacement de kangourou dans iPad. Défini dans`CameraPopoverOptions`.

  * **cameraDirection**: choisissez la caméra à utiliser (ou dos-face). La valeur par défaut est de retour. Définies dans `navigator.camera.Direction` *(nombre)*
    
        Camera.Direction = {
            BACK : 0,      // Use the back-facing camera
            FRONT : 1      // Use the front-facing camera
        };
        

#### Amazon Fire OS Quirks

  * Tout `cameraDirection` résultats dans le back-face photo de valeur.

  * Ignore la `allowEdit` paramètre.

  * `Camera.PictureSourceType.PHOTOLIBRARY`et `Camera.PictureSourceType.SAVEDPHOTOALBUM` les deux affichent le même album photo.

#### Quirks Android

  * Tout `cameraDirection` résultats dans le back-face photo de valeur.

  * Android utilise également l'activité de récolte pour allowEdit, même si la récolte doit travailler et transmet en réalité l'image recadrée à Cordoue, le seul que les œuvres sont toujours celui livré avec l'application Google Plus Photos. Autres cultures peuvent ne pas fonctionner.

  * `Camera.PictureSourceType.PHOTOLIBRARY`et `Camera.PictureSourceType.SAVEDPHOTOALBUM` les deux affichent le même album photo.

#### BlackBerry 10 Quirks

  * Ignore la `quality` paramètre.

  * Ignore la `allowEdit` paramètre.

  * `Camera.MediaType`n'est pas pris en charge.

  * Ignore la `correctOrientation` paramètre.

  * Ignore la `cameraDirection` paramètre.

#### Firefox OS Quirks

  * Ignore la `quality` paramètre.

  * `Camera.DestinationType`est ignorée et est égal à `1` (URI du fichier image)

  * Ignore la `allowEdit` paramètre.

  * Ignore la `PictureSourceType` paramètre (utilisateur il choisit dans une fenêtre de dialogue)

  * Ignore le`encodingType`

  * Ignore la `targetWidth` et`targetHeight`

  * `Camera.MediaType`n'est pas pris en charge.

  * Ignore la `correctOrientation` paramètre.

  * Ignore la `cameraDirection` paramètre.

#### Notes au sujet d'iOS

  * La valeur `quality` inférieur à 50 pour éviter les erreurs de mémoire sur certains appareils.

  * Lorsque vous utilisez `destinationType.FILE_URI` , les photos sont sauvegardées dans le répertoire temporaire de l'application. Le contenu du répertoire temporaire de l'application est supprimé lorsque l'application se termine.

#### Bizarreries de paciarelli

  * options non prises en charge

  * retourne toujours un URI de fichier

#### Notes au sujet de Windows Phone 7 et 8

  * Ignore la `allowEdit` paramètre.

  * Ignore la `correctOrientation` paramètre.

  * Ignore la `cameraDirection` paramètre.

  * Ignore la `saveToPhotoAlbum` paramètre. IMPORTANT : Toutes les images prises avec la caméra de cordova wp7/8 API sont toujours copiés au rôle d'appareil photo du téléphone. Selon les paramètres de l'utilisateur, cela pourrait également signifier que l'image est auto-téléchargées à leur OneDrive. Potentiellement, cela pourrait signifier que l'image est disponible à un public plus large que votre application destinée. Si ce un bloqueur pour votre application, vous devrez implémenter le CameraCaptureTask tel que documenté sur msdn : <http://msdn.microsoft.com/en-us/library/windowsphone/develop/hh394006.aspx> vous pouvez aussi commenter ou haut-vote la question connexe dans le [gestionnaire d'incidents](https://issues.apache.org/jira/browse/CB-2083)

  * Ignore la `mediaType` propriété de `cameraOptions` comme le kit de développement Windows Phone ne fournit pas un moyen de choisir les vidéos de PHOTOLIBRARY.

## CameraError

fonction de rappel onError qui fournit un message d'erreur.

    function(message) {/ / afficher un message utile}
    

#### Description

  * **message**: le message est fourni par du code natif de l'appareil. *(String)*

## cameraSuccess

fonction de rappel onSuccess qui fournit les données d'image.

    function(ImageData) {/ / faire quelque chose avec l'image}
    

#### Description

  * **imageData**: codage Base64 de l'image, *ou* le fichier image URI, selon `cameraOptions` en vigueur. *(String)*

#### Exemple

    Afficher image / / function cameraCallback(imageData) {var image = document.getElementById('myImage') ;
        image.src = "données : image / jpeg ; base64," + imageData;}
    

## CameraPopoverHandle

Un handle vers la boîte de dialogue de kangourou créé par`navigator.camera.getPicture`.

#### Description

  * **setPosition**: Set the position of the popover. Takes the `CameraPopoverOptions` that specify the new position.

#### Plates-formes supportées

![](doc/img/android-fail.png) ![](doc/img/blackberry-fail.png) ![](doc/img/browser-fail.png) ![](doc/img/firefox-fail.png) ![](doc/img/fireos-fail.png) ![](doc/img/ios-success.png) ![](doc/img/windows-fail.png) ![](doc/img/wp8-fail.png) ![](doc/img/ubuntu-fail.png)

#### Exemple

     var cameraPopoverHandle = navigator.camera.getPicture (onSuccess, onFail, {destinationType : Camera.DestinationType.FILE_URI, TypeSource : Camera.PictureSourceType.PHOTOLIBRARY, popoverOptions : nouvelle CameraPopoverOptions (300, 300, 100, 100, Camera.PopoverArrowDirection.ARROW_ANY)}) ;
    
     Repositionner le kangourou si l'orientation change.
     Window.onorientationchange = function() {var cameraPopoverOptions = new CameraPopoverOptions (0, 0, 100, 100, Camera.PopoverArrowDirection.ARROW_ANY) ;
         cameraPopoverHandle.setPosition(cameraPopoverOptions) ;
     }
    

## CameraPopoverOptions

iOS uniquement les paramètres qui spécifient la direction ancre élément emplacement et de la flèche de la kangourou lors de la sélection des images de la bibliothèque de l'iPad ou l'album.

    {x: 0, y: 32, largeur : 320, hauteur : 480, arrowDir : Camera.PopoverArrowDirection.ARROW_ANY} ;
    

#### Description

  * **x**: coordonnée de pixel de l'élément de l'écran sur lequel ancrer le kangourou x. *(Nombre)*

  * **y**: coordonnée de y pixels de l'élément de l'écran sur lequel ancrer le kangourou. *(Nombre)*

  * **largeur**: largeur, en pixels, de l'élément de l'écran sur lequel ancrer le kangourou. *(Nombre)*

  * **hauteur**: hauteur, en pixels, de l'élément de l'écran sur lequel ancrer le kangourou. *(Nombre)*

  * **arrowDir**: Direction de la flèche sur le kangourou doit pointer. Définies dans `Camera.PopoverArrowDirection` *(nombre)*
    
            Camera.PopoverArrowDirection = {
                ARROW_UP : 1,        // matches iOS UIPopoverArrowDirection constants
                ARROW_DOWN : 2,
                ARROW_LEFT : 4,
                ARROW_RIGHT : 8,
                ARROW_ANY : 15
            };
        

Notez que la taille de la kangourou peut changer pour s'adapter à la direction de la flèche et l'orientation de l'écran. Assurez-vous que tenir compte des changements d'orientation lors de la spécification de l'emplacement d'élément d'ancrage.

## Navigator.Camera.Cleanup

Supprime les intermédiaires photos prises par la caméra de stockage temporaire.

    Navigator.Camera.Cleanup (cameraSuccess, cameraError) ;
    

#### Description

Supprime les intermédiaires les fichiers image qui sont gardées en dépôt temporaire après avoir appelé `camera.getPicture` . S'applique uniquement lorsque la valeur de `Camera.sourceType` est égale à `Camera.PictureSourceType.CAMERA` et le `Camera.destinationType` est égal à`Camera.DestinationType.FILE_URI`.

#### Plates-formes supportées

![](doc/img/android-fail.png) ![](doc/img/blackberry-fail.png) ![](doc/img/browser-fail.png) ![](doc/img/firefox-fail.png) ![](doc/img/fireos-fail.png) ![](doc/img/ios-success.png) ![](doc/img/windows-fail.png) ![](doc/img/wp8-fail.png) ![](doc/img/ubuntu-fail.png)

#### Exemple

    Navigator.Camera.Cleanup (onSuccess, onFail) ;
    
    fonction onSuccess() {console.log ("succès de caméra nettoyage.")}
    
    function onFail(message) {alert (' a échoué car: "+ message);}