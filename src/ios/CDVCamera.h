/*
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
 */

#import <Foundation/Foundation.h>
#import <CoreLocation/CoreLocation.h>
#import <CoreLocation/CLLocationManager.h>
#import <Cordova/CDVPlugin.h>

enum CDVDestinationType {
    DestinationTypeDataUrl = 0,
    DestinationTypeFileUri,
    DestinationTypeNativeUri
};
typedef NSUInteger CDVDestinationType;

enum CDVEncodingType {
    EncodingTypeJPEG = 0,
    EncodingTypePNG
};
typedef NSUInteger CDVEncodingType;

enum CDVMediaType {
    MediaTypePicture = 0,
    MediaTypeVideo,
    MediaTypeAll
};
typedef NSUInteger CDVMediaType;

@interface CDVPictureOptions : NSObject

@property (strong) NSNumber* quality;
@property (assign) CDVDestinationType destinationType;
@property (assign) UIImagePickerControllerSourceType sourceType;
@property (assign) CGSize targetSize;
@property (assign) CDVEncodingType encodingType;
@property (assign) CDVMediaType mediaType;
@property (assign) BOOL allowsEditing;
@property (assign) BOOL correctOrientation;
@property (assign) BOOL saveToPhotoAlbum;
@property (strong) NSDictionary* popoverOptions;
@property (assign) UIImagePickerControllerCameraDevice cameraDirection;

@property (assign) BOOL popoverSupported;
@property (assign) BOOL usesGeolocation;
@property (assign) BOOL cropToSize;

+ (instancetype) createFromTakePictureArguments:(CDVInvokedUrlCommand*)command;

@end

@interface CDVCameraPicker : UIImagePickerController

@property (strong) CDVPictureOptions* pictureOptions;

@property (copy)   NSString* callbackId;
@property (copy)   NSString* postUrl;
@property (strong) UIPopoverController* pickerPopoverController;
@property (assign) BOOL cropToSize;
@property (strong) UIView* webView;

+ (instancetype) createFromPictureOptions:(CDVPictureOptions*)options;

@end

// ======================================================================= //

typedef void(^CDVCameraReadMetadataCompletionBlock)(UIImage*, NSDictionary*, CDVPictureOptions*);
typedef void(^CDVCameraProcessImageResultBlock)(UIImage*, NSDictionary*, NSURL*);
typedef void(^CDVCameraProcessImageFailureBlock)(NSString*);

@interface CDVCamera : CDVPlugin <UIImagePickerControllerDelegate,
                       UINavigationControllerDelegate,
                       UIPopoverControllerDelegate,
                       CLLocationManagerDelegate>
{}

@property (strong) CDVCameraPicker* pickerController;
@property (strong) NSDictionary* metadata;
@property (strong, nonatomic) CLLocationManager *locationManager;
@property (strong) UIImage* image;

/*
 * takePicture
 *
 * arguments:
 *  1: success callback (called with either Base64, file URI or native URI)
 *  2: error callback
 * options:
 *  - quality (number [0-100])
 *  - destinationType (number):
 *    0: DATA_URL => Returns a Base64 image
 *    1: FILE_URI => Returns a file URI
 *    2: NATIVE_URI => Returns a native URI (asset-library://...)
 *  - sourceType (number):
 *    0: PHOTOLIBRARY
 *    1: CAMERA
 *    2: SAVEDPHOTOALBUM
 *  - allowEdit (bool)
 *  - encodingType (number):
 *    0: JPEG
 *    1: PNG
 *  - targetWidth/targetHeight (number)
 *  - mediaType (number):
 *    0: PICTURE
 *    1: VIDEO
 *    2: ALLMEDIA
 *  - correctOrientation (bool)
 *  - saveToPhotoAlbum (bool)
 *  - cameraDirection (number)
 *    0: BACK
 *    1: FRONT
 *  - popoverOptions (dictionnary) [iPad only]:
 *    - x (number)
 *    - y (number)
 *    - width (number)
 *    - height (number)
 *    - arrowDir (number):
 *      1: ARROW_UP
 *      2: ARROW_DOWN
 *      4: ARROW_LEFT
 *      8: ARROW_RIGHT
 *      15: ARROW_ANY
 */
- (void)takePicture:(CDVInvokedUrlCommand*)command;
- (void)cleanup:(CDVInvokedUrlCommand*)command;
- (void)repositionPopover:(CDVInvokedUrlCommand*)command;

- (void)imagePickerController:(UIImagePickerController*)picker didFinishPickingMediaWithInfo:(NSDictionary*)info;
- (void)imagePickerController:(UIImagePickerController*)picker didFinishPickingImage:(UIImage*)image editingInfo:(NSDictionary*)editingInfo;
- (void)imagePickerControllerDidCancel:(UIImagePickerController*)picker;
- (void)navigationController:(UINavigationController *)navigationController willShowViewController:(UIViewController *)viewController animated:(BOOL)animated;

- (void)locationManager:(CLLocationManager*)manager didUpdateToLocation:(CLLocation*)newLocation fromLocation:(CLLocation*)oldLocation;
- (void)locationManager:(CLLocationManager *)manager didFailWithError:(NSError *)error;

@end
