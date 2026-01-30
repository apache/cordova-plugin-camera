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

// Since iOS 14, we can use PHPickerViewController to select images from the photo library
//
// The following condition checks if the iOS 14 SDK is available for XCode
// which is true for XCode 12+. It does not check on runtime, if the device is running iOS 14+.
// For that API_AVAILABLE(ios(14)) is used for methods declarations and @available(iOS 14, *) for the code.
// The condition here makes just sure that the code can compile in XCode
#if __IPHONE_OS_VERSION_MAX_ALLOWED >= 140000 // Always true on XCode12+

// Import UniformTypeIdentifiers.h for using UTType* things, available since iOS 14,
// which replaces for e.g. kUTTypeImage with UTTypeImage, which must be used in the future instead
// Currently only used for PHPickerViewController
#import <UniformTypeIdentifiers/UniformTypeIdentifiers.h>

// Import PhotosUI framework for using PHPickerViewController
// PhotosUI is already available since iOS 8, but since we need it currently
// only for the PHPickerViewController, we import it conditionally here
#import <PhotosUI/PhotosUI.h>

#endif

enum CDVDestinationType {
    DestinationTypeDataUrl = 0,
    DestinationTypeFileUri
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
@property (assign) UIImagePickerControllerCameraDevice cameraDirection;

/** 
  Include GPS location information in the image's EXIF metadata, when capturing JPEGs.
  This is YES when the preference `CameraUsesGeolocation` is set to true in config.xml.
*/
@property (assign) BOOL usesGeolocation;
@property (assign) BOOL cropToSize;

+ (instancetype) createFromTakePictureArguments:(CDVInvokedUrlCommand*)command;

@end

@interface CDVUIImagePickerController : UIImagePickerController

@property (strong) CDVPictureOptions* pictureOptions;

@property (copy)   NSString* callbackId;
@property (copy)   NSString* postUrl;
@property (assign) BOOL cropToSize;
@property (strong) UIView* webView;

+ (instancetype) createFromPictureOptions:(CDVPictureOptions*)options;

@end

// ======================================================================= //
// Use PHPickerViewController in iOS 14+ to select images from the photo library
// PHPickerViewControllerDelegate is only available since iOS 14
#if __IPHONE_OS_VERSION_MAX_ALLOWED >= 140000 // Always true on XCode12+
@interface CDVCamera : CDVPlugin <UIImagePickerControllerDelegate,
                       UINavigationControllerDelegate,
                       CLLocationManagerDelegate,
                       PHPickerViewControllerDelegate>
{}
#else
@interface CDVCamera : CDVPlugin <UIImagePickerControllerDelegate,
                       UINavigationControllerDelegate,
                       CLLocationManagerDelegate>
{}
#endif

@property (strong) CDVUIImagePickerController* cdvUIImagePickerController;
@property (strong) NSMutableDictionary *metadata;
@property (strong, nonatomic) CLLocationManager *locationManager;
@property (strong) NSData* data;

- (void)takePicture:(CDVInvokedUrlCommand*)command;
- (void)cleanup:(CDVInvokedUrlCommand*)command;

// UIImagePickerControllerDelegate methods
- (void)imagePickerController:(UIImagePickerController*)picker didFinishPickingMediaWithInfo:(NSDictionary*)info;
- (void)imagePickerController:(UIImagePickerController*)picker didFinishPickingImage:(UIImage*)image editingInfo:(NSDictionary*)editingInfo;
- (void)imagePickerControllerDidCancel:(UIImagePickerController*)picker;

// UINavigationControllerDelegate method
- (void)navigationController:(UINavigationController *)navigationController willShowViewController:(UIViewController *)viewController animated:(BOOL)animated;

// CLLocationManagerDelegate methods
- (void)locationManager:(CLLocationManager*)manager didUpdateToLocation:(CLLocation*)newLocation fromLocation:(CLLocation*)oldLocation;
- (void)locationManager:(CLLocationManager *)manager didFailWithError:(NSError *)error;

// PHPickerViewController specific methods (iOS 14+)
#if __IPHONE_OS_VERSION_MAX_ALLOWED >= 140000 // Always true on XCode12+
- (void)showPHPicker:(NSString*)callbackId withOptions:(CDVPictureOptions*)pictureOptions API_AVAILABLE(ios(14));
- (void)processPHPickerImage:(UIImage*)image metadata:(NSDictionary*)metadata callbackId:(NSString*)callbackId options:(CDVPictureOptions*)options API_AVAILABLE(ios(14));
// PHPickerViewControllerDelegate method
- (void)picker:(PHPickerViewController *)picker didFinishPicking:(NSArray<PHPickerResult *> *)results API_AVAILABLE(ios(14));
#endif

@end
