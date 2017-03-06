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

このプラグインは、写真を撮るため、システムのイメージ ライブラリからイメージを選択するために API を提供します、グローバル `navigator.camera` オブジェクトを定義します。

オブジェクトは、グローバル スコープの `ナビゲーター` に添付、それがないまで `deviceready` イベントの後。

    document.addEventListener("deviceready", onDeviceReady, false);
    function onDeviceReady() {
        console.log(navigator.camera);
    }
    

## インストール

    cordova plugin add cordova-plugin-camera
    

## API

  * カメラ 
      * navigator.camera.getPicture(success, fail, options)
      * CameraOptions
      * CameraPopoverHandle
      * CameraPopoverOptions
      * navigator.camera.cleanup

## navigator.camera.getPicture

カメラを使用して写真を取るか、デバイスの画像ギャラリーから写真を取得します。 イメージが渡されます成功時のコールバックを base64 エンコードされた `文字列`、または、URI としてイメージ ファイル。 メソッド自体はファイル選択ポップ オーバーの位置を変更するために使用できる `CameraPopoverHandle` オブジェクトを返します。

    navigator.camera.getPicture(cameraSuccess, cameraError, cameraOptions);
    

#### 解説

`camera.getPicture` 関数は、ユーザーの写真をスナップすることができますデバイスのデフォルト カメラ アプリケーションを開きます。 `Camera.sourceType` が `Camera.PictureSourceType.CAMERA` と等しい場合既定では、この現象が発生します。 ユーザーは写真をスナップ、カメラ アプリケーションを閉じるし、アプリケーションが復元されます。

`Camera.sourceType` `Camera.PictureSourceType.PHOTOLIBRARY` または `Camera.PictureSourceType.SAVEDPHOTOALBUM` の場合、ダイアログ ボックスはユーザーを既存のイメージを選択することができますが表示されます。 `camera.getPicture` 関数は、デバイスの向きが変更されたとき、たとえば、イメージの選択ダイアログには、位置を変更するために使用することができます、`CameraPopoverHandle` オブジェクトを返します。

戻り値が `cameraSuccess` コールバック関数の指定 `cameraOptions` に応じて、次の形式のいずれかに送信されます。

  * A `String` 写真の base64 でエンコードされたイメージを含んでいます。

  * A `String` (既定値) のローカル記憶域上のイメージ ファイルの場所を表します。

自由に変更、エンコードされたイメージ、または URI などを行うことができます。

  * イメージをレンダリングする `<img>` 以下の例のように、タグ

  * ローカル データの保存 ( `LocalStorage` 、 [Lawnchair](http://brianleroux.github.com/lawnchair/)など)。

  * リモート サーバーにデータを投稿します。

**注**: 新しいデバイス上の写真の解像度はかなり良いです。 デバイスのギャラリーから選択した写真は `quality` パラメーターが指定されて場合でも下方の品質に縮小されません。 一般的なメモリの問題を避けるために `DATA_URL` ではなく `FILE_URI` に `Camera.destinationType` を設定します。.

#### サポートされているプラットフォーム

![](doc/img/android-success.png) ![](doc/img/blackberry-success.png) ![](doc/img/browser-success.png) ![](doc/img/firefox-success.png) ![](doc/img/fireos-success.png) ![](doc/img/ios-success.png) ![](doc/img/windows-success.png) ![](doc/img/wp8-success.png) ![](doc/img/ubuntu-success.png)

#### 例

写真を撮るし、base64 エンコード イメージとして取得します。

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
    

写真を撮るし、イメージのファイルの場所を取得します。

    navigator.camera.getPicture(onSuccess, onFail, { quality: 50,
        destinationType: Camera.DestinationType.FILE_URI });
    
    function onSuccess(imageURI) {
        var image = document.getElementById('myImage');
        image.src = imageURI;
    }
    
    function onFail(message) {
        alert('Failed because: ' + message);
    }
    

#### 環境設定 （iOS）

  * **CameraUsesGeolocation**(ブール値、デフォルトは false)。 Jpeg 画像をキャプチャするため EXIF ヘッダーで地理位置情報データを取得する場合は true に設定します。 これは、場合地理位置情報のアクセス許可に対する要求をトリガーする true に設定します。
    
        <preference name="CameraUsesGeolocation" value="false" />
        

#### アマゾン火 OS 癖

アマゾン火 OS イメージをキャプチャするデバイス上のカメラの活動を開始する意図を使用して、メモリの少ない携帯電話、コルドバ活動が殺されるかもしれない。 このシナリオではコルドバ活動が復元されると、イメージが表示されません。

#### Android の癖

アンドロイド、イメージをキャプチャするデバイス上でカメラのアクティビティを開始する意図を使用し、メモリの少ない携帯電話、コルドバ活動が殺されるかもしれない。 このシナリオではコルドバ活動が復元されると、イメージが表示されません。

#### ブラウザーの癖

Base64 エンコード イメージとして写真を返すのみことができます。

#### Firefox OS 癖

カメラのプラグインは現在、[Web アクティビティ](https://hacks.mozilla.org/2013/01/introducing-web-activities/) を使用して実装されていた.

#### iOS の癖

コールバック関数のいずれかの JavaScript `alert()` を含む問題が発生することができます。 IOS イメージ ピッカーまたは完全が終了するまで、警告が表示されますポップ オーバーを許可する `setTimeout()` 内でアラートをラップします。

    setTimeout(function() {
        // do your thing here!
    }, 0);
    

#### Windows Phone 7 の癖

ネイティブ カメラ アプリケーションを呼び出すと、デバイスが Zune を介して接続されている動作しませんし、エラー コールバックをトリガーします。

#### Tizen の癖

Tizen のみ `Camera.DestinationType.FILE_URI` の `destinationType` と `Camera.PictureSourceType.PHOTOLIBRARY` の `sourceType` をサポートしています.

## CameraOptions

カメラの設定をカスタマイズするオプションのパラメーター。

    { quality : 75,
      destinationType : Camera.DestinationType.DATA_URL,
      sourceType : Camera.PictureSourceType.CAMERA,
      allowEdit : true,
      encodingType: Camera.EncodingType.JPEG,
      targetWidth: 100,
      targetHeight: 100,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: false };
    

  * **quality**： 0-100、100 がファイルの圧縮から損失なしで通常のフル解像度の範囲で表される、保存されたイメージの品質。 既定値は 50 です。 *(数)*（カメラの解像度についての情報が利用できないことに注意してください)。

  * **destinationType**: 戻り値の形式を選択します。既定値は FILE_URI です。定義されている `navigator.camera.DestinationType` *（番号）*
    
        Camera.DestinationType = {
            DATA_URL : 0,      // Return image as base64-encoded string
            FILE_URI : 1,      // Return image file URI
            NATIVE_URI : 2     // Return image native URI (e.g., assets-library:// on iOS or content:// on Android)
        };
        

  * **sourceType**: 画像のソースを設定します。既定値は、カメラです。定義されている `navigator.camera.PictureSourceType` *（番号）*
    
        Camera.PictureSourceType = {
            PHOTOLIBRARY : 0,
            CAMERA : 1,
            SAVEDPHOTOALBUM : 2
        };
        

  * **allowEdit**: 単純な選択の前に画像の編集を許可します。*(ブール値)*

  * **encodingType**: 返されるイメージ ファイルのエンコーディングを選択します。デフォルトは JPEG です。定義されている `navigator.camera.EncodingType` *（番号）*
    
        Camera.EncodingType = {
            JPEG : 0,               // Return JPEG encoded image
            PNG : 1                 // Return PNG encoded image
        };
        

  * **targetWidth**: スケール イメージにピクセル単位の幅。**TargetHeight**を使用する必要があります。縦横比は変わりません。*(数)*

  * **targetHeight**: スケール イメージにピクセル単位の高さ。**TargetWidth**を使用する必要があります。縦横比は変わりません。*(数)*

  * **mediaType**： から選択するメディアの種類を設定します。 場合にのみ働きます `PictureSourceType` は `PHOTOLIBRARY` または `SAVEDPHOTOALBUM` 。 定義されている `nagivator.camera.MediaType` *（番号）*
    
        Camera.MediaType = {
            PICTURE: 0,    // allow selection of still pictures only. DEFAULT. Will return format specified via DestinationType
            VIDEO: 1,      // allow selection of video only, WILL ALWAYS RETURN FILE_URI
            ALLMEDIA : 2   // allow selection from all media types
        };
        

  * **correctOrientation**: キャプチャ中に、デバイスの向きを修正する画像を回転させます。*(ブール値)*

  * **saveToPhotoAlbum**: キャプチャ後、デバイス上のフォト アルバムに画像を保存します。*(ブール値)*

  * **popoverOptions**: iPad のポップ オーバーの場所を指定する iOS のみのオプションです。定義されています。`CameraPopoverOptions`.

  * **cameraDirection**： （前面または背面側） を使用するカメラを選択します。既定値は戻るです。定義されている `navigator.camera.Direction` *（番号）*
    
        Camera.Direction = {
            BACK : 0,      // Use the back-facing camera
            FRONT : 1      // Use the front-facing camera
        };
        

#### アマゾン火 OS 癖

  * 任意 `cameraDirection` 背面写真で結果の値します。

  * 無視、 `allowEdit` パラメーター。

  * `Camera.PictureSourceType.PHOTOLIBRARY``Camera.PictureSourceType.SAVEDPHOTOALBUM`両方のアルバムが表示されます同じ写真。

#### Android の癖

  * 任意 `cameraDirection` 背面写真で結果の値します。

  * アンドロイドも使用しています作物活性、allowEdit もトリミングする必要があります動作し、実際にトリミングされた画像をコルドバで 1 つだけの作品一貫して Google プラス写真アプリケーションにバンドルされているものであることに渡します。 他の作物が機能しません。

  * `Camera.PictureSourceType.PHOTOLIBRARY``Camera.PictureSourceType.SAVEDPHOTOALBUM`両方のアルバムが表示されます同じ写真。

#### ブラックベリー 10 癖

  * 無視、 `quality` パラメーター。

  * 無視、 `allowEdit` パラメーター。

  * `Camera.MediaType`サポートされていません。

  * 無視、 `correctOrientation` パラメーター。

  * 無視、 `cameraDirection` パラメーター。

#### Firefox OS 癖

  * 無視、 `quality` パラメーター。

  * `Camera.DestinationType`無視され、等しい `1` (イメージ ファイル URI)

  * 無視、 `allowEdit` パラメーター。

  * 無視、 `PictureSourceType` パラメーター (ユーザーが選択ダイアログ ウィンドウに)

  * 無視します、`encodingType`

  * 無視、 `targetWidth` と`targetHeight`

  * `Camera.MediaType`サポートされていません。

  * 無視、 `correctOrientation` パラメーター。

  * 無視、 `cameraDirection` パラメーター。

#### iOS の癖

  * 設定 `quality` 一部のデバイスでメモリ不足エラーを避けるために 50 の下。

  * 使用する場合 `destinationType.FILE_URI` 、写真、アプリケーションの一時ディレクトリに保存されます。アプリケーションの一時ディレクトリの内容は、アプリケーションの終了時に削除されます。

#### Tizen の癖

  * サポートされていないオプション

  * 常にファイルの URI を返す

#### Windows Phone 7 と 8 癖

  * 無視、 `allowEdit` パラメーター。

  * 無視、 `correctOrientation` パラメーター。

  * 無視、 `cameraDirection` パラメーター。

  * 無視、 `saveToPhotoAlbum` パラメーター。 重要: wp7/8 コルドバ カメラ API で撮影したすべての画像は携帯電話のカメラ巻き物に常にコピーします。 ユーザーの設定に応じて、これも、画像はその OneDrive に自動アップロードを意味できます。 イメージは意図したアプリより広い聴衆に利用できる可能性があります可能性があります。 場合は、このアプリケーションのブロッカー、msdn で説明されているように、CameraCaptureTask を実装する必要があります: <http://msdn.microsoft.com/en-us/library/windowsphone/develop/hh394006.aspx>コメントにすることがありますもかアップ投票関連の問題を[課題追跡システム](https://issues.apache.org/jira/browse/CB-2083)で

  * 無視、 `mediaType` のプロパティ `cameraOptions` として Windows Phone SDK には、フォト ライブラリからビデオを選択する方法は行いません。

## CameraError

エラー メッセージを提供する onError コールバック関数。

    function(message) {
        // Show a helpful message
    }
    

#### 解説

  * **message**: メッセージは、デバイスのネイティブ コードによって提供されます。*(文字列)*

## cameraSuccess

画像データを提供する onSuccess コールバック関数。

    function(imageData) {
        // Do something with the image
    }
    

#### 解説

  * **imagedata を扱う**: Base64 エンコード イメージのデータ、*または*画像ファイルによって URI の `cameraOptions` 効果。*(文字列)*

#### 例

    // Show image
    //
    function cameraCallback(imageData) {
        var image = document.getElementById('myImage');
        image.src = "data:image/jpeg;base64," + imageData;
    }
    

## CameraPopoverHandle

`Navigator.camera.getPicture` によって作成されたポップオーバーパン ダイアログ ボックスへのハンドル.

#### 解説

  * **setPosition**: Set the position of the popover. Takes the `CameraPopoverOptions` that specify the new position.

#### サポートされているプラットフォーム

![](doc/img/android-fail.png) ![](doc/img/blackberry-fail.png) ![](doc/img/browser-fail.png) ![](doc/img/firefox-fail.png) ![](doc/img/fireos-fail.png) ![](doc/img/ios-success.png) ![](doc/img/windows-fail.png) ![](doc/img/wp8-fail.png) ![](doc/img/ubuntu-fail.png)

#### 例

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

iOS だけ指定パラメーターをポップ オーバーのアンカー要素の場所および矢印方向計算されたライブラリまたはアルバムから画像を選択するとき。

    { x : 0,
      y :  32,
      width : 320,
      height : 480,
      arrowDir : Camera.PopoverArrowDirection.ARROW_ANY
    };
    

#### 解説

  * **x**: ピクセルの x 座標画面要素にポップ オーバーのアンカーになります。*(数)*

  * **y**: y ピクセル座標の画面要素にポップ オーバーのアンカーになります。*(数)*

  * **width**: ポップ オーバーのアンカーになる上の画面要素のピクセル単位の幅。*(数)*

  * **height**: ポップ オーバーのアンカーになる上の画面要素のピクセル単位の高さ。*(数)*

  * **arrowDir**: 方向のポップ オーバーで矢印をポイントする必要があります。定義されている `Camera.PopoverArrowDirection` *（番号）*
    
            Camera.PopoverArrowDirection = {
                ARROW_UP : 1,        // matches iOS UIPopoverArrowDirection constants
                ARROW_DOWN : 2,
                ARROW_LEFT : 4,
                ARROW_RIGHT : 8,
                ARROW_ANY : 15
            };
        

矢印の方向と、画面の向きを調整するポップ オーバーのサイズを変更可能性がありますに注意してください。 アンカー要素の位置を指定するときの方向の変化を考慮することを確認します。

## navigator.camera.cleanup

削除中間一時ストレージからカメラで撮影した写真。

    navigator.camera.cleanup( cameraSuccess, cameraError );
    

#### 解説

`camera.getPicture` を呼び出した後一時記憶域に保存されている中間画像ファイルを削除します。 `Camera.sourceType` の値が `Camera.PictureSourceType.CAMERA` に等しい、`Camera.destinationType` が `Camera.DestinationType.FILE_URI` と等しいの場合にのみ適用されます。.

#### サポートされているプラットフォーム

![](doc/img/android-fail.png) ![](doc/img/blackberry-fail.png) ![](doc/img/browser-fail.png) ![](doc/img/firefox-fail.png) ![](doc/img/fireos-fail.png) ![](doc/img/ios-success.png) ![](doc/img/windows-fail.png) ![](doc/img/wp8-fail.png) ![](doc/img/ubuntu-fail.png)

#### 例

    navigator.camera.cleanup(onSuccess, onFail);
    
    function onSuccess() {
        console.log("Camera cleanup success.")
    }
    
    function onFail(message) {
        alert('Failed because: ' + message);
    }