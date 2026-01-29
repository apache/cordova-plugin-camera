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

#import "CDVCamera.h"
#import "CDVJpegHeaderWriter.h"
#import "UIImage+CropScaleOrientation.h"
#import <ImageIO/CGImageProperties.h>
#import <AssetsLibrary/ALAssetRepresentation.h>
#import <AssetsLibrary/AssetsLibrary.h>
#import <AVFoundation/AVFoundation.h>
#import <ImageIO/CGImageSource.h>
#import <ImageIO/CGImageProperties.h>
#import <ImageIO/CGImageDestination.h>
#import <MobileCoreServices/UTCoreTypes.h>
#import <objc/message.h>
#import <Photos/Photos.h>

#ifndef __CORDOVA_4_0_0
    #import <Cordova/NSData+Base64.h>
#endif

#define CDV_PHOTO_PREFIX @"cdv_photo_"

static NSString* toBase64(NSData* data)
{
    SEL s1 = NSSelectorFromString(@"cdv_base64EncodedString");
    SEL s2 = NSSelectorFromString(@"base64EncodedString");
    SEL s3 = NSSelectorFromString(@"base64EncodedStringWithOptions:");

    if ([data respondsToSelector:s1]) {
        NSString* (*func)(id, SEL) = (void *)[data methodForSelector:s1];
        return func(data, s1);
    } else if ([data respondsToSelector:s2]) {
        NSString* (*func)(id, SEL) = (void *)[data methodForSelector:s2];
        return func(data, s2);
    } else if ([data respondsToSelector:s3]) {
        NSString* (*func)(id, SEL, NSUInteger) = (void *)[data methodForSelector:s3];
        return func(data, s3, 0);
    } else {
        return nil;
    }
}

static NSString* MIME_PNG     = @"image/png";
static NSString* MIME_JPEG    = @"image/jpeg";

@implementation CDVPictureOptions

+ (instancetype)createFromTakePictureArguments:(CDVInvokedUrlCommand*)command
{
    CDVPictureOptions* pictureOptions = [[CDVPictureOptions alloc] init];

    pictureOptions.quality = [command argumentAtIndex:0 withDefault:@(50)];
    pictureOptions.destinationType = [[command argumentAtIndex:1 withDefault:@(DestinationTypeFileUri)] unsignedIntegerValue];
    pictureOptions.sourceType = [[command argumentAtIndex:2 withDefault:@(UIImagePickerControllerSourceTypeCamera)] unsignedIntegerValue];

    NSNumber* targetWidth = [command argumentAtIndex:3 withDefault:nil];
    NSNumber* targetHeight = [command argumentAtIndex:4 withDefault:nil];
    pictureOptions.targetSize = CGSizeMake(0, 0);
    if ((targetWidth != nil) && (targetHeight != nil)) {
        pictureOptions.targetSize = CGSizeMake([targetWidth floatValue], [targetHeight floatValue]);
    }

    pictureOptions.encodingType = [[command argumentAtIndex:5 withDefault:@(EncodingTypeJPEG)] unsignedIntegerValue];
    pictureOptions.mediaType = [[command argumentAtIndex:6 withDefault:@(MediaTypePicture)] unsignedIntegerValue];
    pictureOptions.allowsEditing = [[command argumentAtIndex:7 withDefault:@(NO)] boolValue];
    pictureOptions.correctOrientation = [[command argumentAtIndex:8 withDefault:@(NO)] boolValue];
    pictureOptions.saveToPhotoAlbum = [[command argumentAtIndex:9 withDefault:@(NO)] boolValue];
    pictureOptions.cameraDirection = [[command argumentAtIndex:10 withDefault:@(UIImagePickerControllerCameraDeviceRear)] unsignedIntegerValue];

    pictureOptions.usesGeolocation = NO;

    return pictureOptions;
}

@end


@interface CDVCamera ()

// Redeclare CDVPlugin.hasPendingOperation as readwrite,
// so we can set it. Skips didReceiveMemoryWarning handling in
// CDVViewController when a plugin has a pending operation.
@property (readwrite, assign) BOOL hasPendingOperation;

@end

@implementation CDVCamera

@synthesize hasPendingOperation, pickerController, locationManager;

/**
    Reads the preference CameraUsesGeolocation from config.xml
    to determine whether to include GPS location data in JPEG EXIF metadata.

    @return YES if CameraUsesGeolocation is set to true, NO otherwise.
*/
- (BOOL)usesGeolocation
{
    id useGeo = [self.commandDelegate.settings objectForKey:[@"CameraUsesGeolocation" lowercaseString]];
    return [(NSNumber*)useGeo boolValue];
}

/**
 Called by JS function navigator.camera.getPicture(cameraSuccess, cameraError, cameraOptions)
 which will invoke the camera or photo picker to capture or select an image or video.
 
 @param command A Cordova command whose arguments map to camera options:
   - index 0 (quality): NSNumber (1–100). JPEG quality when encodingType is JPEG. Default: 50.
   - index 1 (destinationType): NSNumber (DestinationType). File URI or Data URL. Default: File URI.
   - index 2 (sourceType): NSNumber (UIImagePickerControllerSourceType). Camera or Photo Library. Default: Camera.
   - index 3 (targetWidth): NSNumber (optional). Desired width for scaling/cropping.
   - index 4 (targetHeight): NSNumber (optional). Desired height for scaling/cropping.
   - index 5 (encodingType): NSNumber (EncodingType). JPEG or PNG. Default: JPEG.
   - index 6 (mediaType): NSNumber (MediaType). Picture, Video, or All. Default: Picture.
   - index 7 (allowsEditing): NSNumber(BOOL). Allow user to crop/edit. Default: NO.
   - index 8 (correctOrientation): NSNumber(BOOL). Fix EXIF orientation. Default: NO.
   - index 9 (saveToPhotoAlbum): NSNumber(BOOL). Save captured image to Photos. Default: NO.
   - index 10 (cameraDirection): NSNumber (UIImagePickerControllerCameraDevice). Front/Rear. Default: Rear.

 @discussion
 This method validates hardware availability and permissions (camera or photo library),
 then presents the appropriate UI (UIImagePickerController or PHPickerViewController on iOS 14+).
 The result is returned via the Cordova callback.
 */
- (void)takePicture:(CDVInvokedUrlCommand*)command
{
    self.hasPendingOperation = YES;
    __weak CDVCamera* weakSelf = self;

    [self.commandDelegate runInBackground:^{
        CDVPictureOptions* pictureOptions = [CDVPictureOptions createFromTakePictureArguments:command];
        // Only for capturing JPEG images, get geolocation data to include in the EXIF header
        pictureOptions.usesGeolocation = [weakSelf usesGeolocation];
        pictureOptions.cropToSize = NO;

        // The camera should be used to take a picture
        if (pictureOptions.sourceType == UIImagePickerControllerSourceTypeCamera) {
            // Check if camera is available
            if (![UIImagePickerController isSourceTypeAvailable:pictureOptions.sourceType]) {
                NSLog(@"Camera.getPicture: source type %lu not available.", (unsigned long)pictureOptions.sourceType);
                [weakSelf.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"No camera available"]
                                                callbackId:command.callbackId];
                return;
            }
            
            // Validate the app has permission to access the camera
            [AVCaptureDevice requestAccessForMediaType:AVMediaTypeVideo completionHandler:^(BOOL granted) {
                 // Show an alert if not granted
                 if (!granted) {
                     [weakSelf presentPermissionDeniedAlertWithMessage:@"Access to the camera has been prohibited; please enable it in the Settings app to continue."
                                                            callbackId:command.callbackId];
                 } else {
                     [weakSelf showCameraPicker:command.callbackId withOptions:pictureOptions];
                 }
             }];
            
            // A photo should be picked from the photo library
        } else {
            // Use PHPickerViewController on iOS 14+
            // Doesn't require permissions
            if (@available(iOS 14, *)) {
                    [weakSelf showCameraPicker:command.callbackId withOptions:pictureOptions];
                
                // On iOS < 14, use UIImagePickerController and request permissions
            } else {
                // Request permission
                [weakSelf options:pictureOptions requestPhotoPermissions:^(BOOL granted) {
                    if (!granted) {
                        // Denied; show an alert
                        [weakSelf presentPermissionDeniedAlertWithMessage:@"Access to the camera roll has been prohibited; please enable it in the Settings to continue."
                                                               callbackId:command.callbackId];
                    } else {
                        [weakSelf showCameraPicker:command.callbackId withOptions:pictureOptions];
                    }
                }];
            }
        }
    }];
}

/**
 Presents a permission denial alert with OK and Settings actions.
 @param message The alert message to show.
 @param callbackId The Cordova callback identifier to send an error if needed.
 */
- (void)presentPermissionDeniedAlertWithMessage:(NSString*)message callbackId:(NSString*)callbackId
{
    __weak CDVCamera *weakSelf = self;

    // Perform UI creation and presentation on the main thread
    dispatch_async(dispatch_get_main_queue(), ^{
        NSString *bundleDisplayName = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"CFBundleDisplayName"];
        UIAlertController *alertController = [UIAlertController alertControllerWithTitle:bundleDisplayName
                                                                                 message:NSLocalizedString(message, nil)
                                                                          preferredStyle:UIAlertControllerStyleAlert];

        // Ok button
        [alertController addAction:[UIAlertAction actionWithTitle:NSLocalizedString(@"OK", nil)
                                                            style:UIAlertActionStyleDefault
                                                          handler:^(UIAlertAction * _Nonnull action) {
            [weakSelf sendNoPermissionResult:callbackId];
        }]];

         // Button for open settings
        [alertController addAction:[UIAlertAction actionWithTitle:NSLocalizedString(@"Settings", nil)
                                                            style:UIAlertActionStyleDefault
                                                          handler:^(UIAlertAction * _Nonnull action) {
            // Open settings
            [[UIApplication sharedApplication] openURL:[NSURL URLWithString:UIApplicationOpenSettingsURLString]
                                               options:@{}
                                     completionHandler:nil];
            [weakSelf sendNoPermissionResult:callbackId];
        }]];

        [self.viewController presentViewController:alertController animated:YES completion:nil];
    });
}

- (void)sendNoPermissionResult:(NSString*)callbackId
{
    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"has no access to camera"];   // error callback expects string ATM

    [self.commandDelegate sendPluginResult:result callbackId:callbackId];
    self.hasPendingOperation = NO;
    self.pickerController = nil;
}

/**
 Presents the appropriate UI to capture or select media based on the provided options and OS version.
 
 On iOS 14 and later, when the source type is PHOTOLIBRARY (or SAVEDPHOTOALBUM), this method presents
 PHPickerViewController to select media without requiring Photos authorization. Otherwise, it falls back
 to UIImagePickerController for camera usage or on older iOS versions.
 
 Threading:
 - Ensures presentation occurs on the main thread.
 
 Behavior:
 - Configures delegates and media types
 - Updates `hasPendingOperation` to reflect plugin activity state.
 
 @param callbackId The Cordova callback identifier used to deliver results back to JavaScript.
 @param pictureOptions Parsed camera options (sourceType, mediaType, allowsEditing, etc.).
 */
- (void)showCameraPicker:(NSString*)callbackId withOptions:(CDVPictureOptions*)pictureOptions
{
    // Use PHPickerViewController for photo library on iOS 14+
    if (@available(iOS 14, *)) {
        // sourceType is PHOTOLIBRARY
        if (pictureOptions.sourceType == UIImagePickerControllerSourceTypePhotoLibrary ||
            // sourceType is SAVEDPHOTOALBUM (same as PHOTOLIBRARY)
            pictureOptions.sourceType == UIImagePickerControllerSourceTypeSavedPhotosAlbum) {
            [self showPHPicker:callbackId withOptions:pictureOptions];
            return;
        }
    }

    // Use UIImagePickerController for camera or as image picker for iOS older than 14
    // UIImagePickerController must be created and presented on the main thread.
    dispatch_async(dispatch_get_main_queue(), ^{
        CDVCameraPicker* cameraPicker = [CDVCameraPicker createFromPictureOptions:pictureOptions];
        self.pickerController = cameraPicker;

        cameraPicker.delegate = self;
        cameraPicker.callbackId = callbackId;
        // we need to capture this state for memory warnings that dealloc this object
        cameraPicker.webView = self.webView;
        cameraPicker.modalPresentationStyle = UIModalPresentationCurrentContext;

        [self.viewController presentViewController:cameraPicker
                                          animated:YES
                                        completion:^{
            self.hasPendingOperation = NO;
        }];
    });
}

// Since iOS 14, we can use PHPickerViewController to select images from the photo library
#if __IPHONE_OS_VERSION_MAX_ALLOWED >= 140000 // Always true on XCode12+
- (void)showPHPicker:(NSString*)callbackId withOptions:(CDVPictureOptions*)pictureOptions API_AVAILABLE(ios(14))
{
    // PHPicker must be created and presented on the main thread.
    dispatch_async(dispatch_get_main_queue(), ^{
        // Using [PHPickerConfiguration init] instead of
        // [PHPickerConfiguration initWithPhotoLibrary:[PHPhotoLibrary sharedPhotoLibrary]]
        // is more open and lets the picker return items that aren’t PHAssets, like cloud/shared providers,
        // but will not return asset identifiers.
        PHPickerConfiguration *config = [[PHPickerConfiguration alloc] init];

        // Configure filter based on media type
        // Images
        if (pictureOptions.mediaType == MediaTypePicture) {
            config.filter = [PHPickerFilter imagesFilter];

            // Videos
        } else if (pictureOptions.mediaType == MediaTypeVideo) {
            config.filter = [PHPickerFilter videosFilter];

            // Images and videos
        } else if (pictureOptions.mediaType == MediaTypeAll) {
            config.filter = [PHPickerFilter anyFilterMatchingSubfilters:@[
                [PHPickerFilter imagesFilter],
                [PHPickerFilter videosFilter]
            ]];
        }

        config.selectionLimit = 1;
        
        // PHPickerConfigurationAssetRepresentationModeCurrent:
        // A mode that uses the current representation to avoid transcoding, if possible.
        // This means PHPicker tries to give you a representation already available without
        // re‑encoding. That usually is the stored file on device (e.g., HEIC/JPEG),
        // but if the asset is only in iCloud or already has a cached “current” rendition,
        // you might get that cached representation instead of downloading the original.
        // This plugin supports only JPEG and PNG currently and will convert the
        // image later in processImage: to the requested format.
        config.preferredAssetRepresentationMode = PHPickerConfigurationAssetRepresentationModeCurrent;

        PHPickerViewController *picker = [[PHPickerViewController alloc] initWithConfiguration:config];
        picker.delegate = self;

        // Store callback ID and options in picker with objc_setAssociatedObject
        // PHPickerViewController’s delegate method picker:didFinishPicking: only gives you back the picker instance
        // and the results array. It doesn’t carry arbitrary context. By associating the callbackId and pictureOptions
        // with the picker, you can retrieve them later inside the delegate method
        objc_setAssociatedObject(picker, "callbackId", callbackId, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
        objc_setAssociatedObject(picker, "pictureOptions", pictureOptions, OBJC_ASSOCIATION_RETAIN_NONATOMIC);

        [self.viewController presentViewController:picker animated:YES completion:^{
            self.hasPendingOperation = NO;
        }];
    });
}

// PHPickerViewControllerDelegate method
- (void)picker:(PHPickerViewController*)picker didFinishPicking:(NSArray<PHPickerResult*>*)results API_AVAILABLE(ios(14))
{
    NSString *callbackId = objc_getAssociatedObject(picker, "callbackId");
    CDVPictureOptions *pictureOptions = objc_getAssociatedObject(picker, "pictureOptions");
    
    __weak CDVCamera* weakSelf = self;
    
    [picker dismissViewControllerAnimated:YES completion:^{
        if (results.count == 0) {
            // User cancelled
            CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"No Image Selected"];
            [weakSelf.commandDelegate sendPluginResult:result callbackId:callbackId];
            weakSelf.hasPendingOperation = NO;
            return;
        }
        
        PHPickerResult *pickerResult = results.firstObject;
        
        // Check if it's a video
        if ([pickerResult.itemProvider hasItemConformingToTypeIdentifier:UTTypeMovie.identifier]) {
            // loadFileRepresentationForTypeIdentifier returns an url which will be gone after the completion handler returns,
            // so we need to copy the video to a temporary location, which can be accessed later
            [pickerResult.itemProvider loadFileRepresentationForTypeIdentifier:UTTypeMovie.identifier
                                                             completionHandler:^(NSURL * _Nullable url, NSError * _Nullable error) {
                if (error) {
                    NSLog(@"CDVCamera: Failed to load video: %@", [error localizedDescription]);
                    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_IO_EXCEPTION
                                                                messageAsString:[NSString stringWithFormat:@"Failed to load video: %@", [error localizedDescription]]];
                    [weakSelf.commandDelegate sendPluginResult:result callbackId:callbackId];
                    weakSelf.hasPendingOperation = NO;
                    return;
                }
                
                // Copy video to a temporary location, so it can be accessed after this completion handler returns
                NSString* tempVideoPath = [weakSelf copyFileToTemp:[url path]];
                
                // Send Cordova plugin result back
                CDVPluginResult* result = nil;
                
                if (tempVideoPath == nil) {
                    result = [CDVPluginResult resultWithStatus:CDVCommandStatus_IO_EXCEPTION
                                                messageAsString:@"Failed to copy video file to temporary location"];
                } else {
                    result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:tempVideoPath];
                }
                
                [weakSelf.commandDelegate sendPluginResult:result callbackId:callbackId];
                weakSelf.hasPendingOperation = NO;
            }];
            
            // Handle image
        } else if ([pickerResult.itemProvider hasItemConformingToTypeIdentifier:UTTypeImage.identifier]) {
            // Load image data for the NSItemProvider
            [pickerResult.itemProvider loadDataRepresentationForTypeIdentifier:UTTypeImage.identifier
                                                             completionHandler:^(NSData * _Nullable imageData, NSError * _Nullable error) {
                if (error) {
                    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                                                messageAsString:[error localizedDescription]];
                    [weakSelf.commandDelegate sendPluginResult:result callbackId:callbackId];
                    weakSelf.hasPendingOperation = NO;
                    return;
                }
                
                // Process image according to pictureOptions
                UIImage *processedImage = [UIImage imageWithData:imageData];
                
                if (pictureOptions.correctOrientation) {
                    processedImage = [processedImage imageCorrectedForCaptureOrientation];
                }
                
                // Scale with optional cropping
                if ((pictureOptions.targetSize.width > 0) && (pictureOptions.targetSize.height > 0)) {
                    // Scale and crop to target size
                    if (pictureOptions.cropToSize) {
                        processedImage = [processedImage imageByScalingAndCroppingForSize:pictureOptions.targetSize];

                        // Scale with no cropping
                    } else {
                        processedImage = [processedImage imageByScalingNotCroppingForSize:pictureOptions.targetSize];
                    }
                }

                // Store metadata of exif, tiff, gps in self.metadata, which will be processed in resultForImage
                NSDictionary *metadata = [weakSelf convertImageMetadata:imageData];
                
                if (metadata.count > 0) {
                    self.metadata = [NSMutableDictionary dictionary];

                    NSDictionary *exif = metadata[(NSString *)kCGImagePropertyExifDictionary];
                    if (exif.count > 0) {
                        self.metadata[(NSString *)kCGImagePropertyExifDictionary] = [exif mutableCopy];
                    }

                    NSDictionary *tiff = metadata[(NSString *)kCGImagePropertyTIFFDictionary];
                    if (tiff.count > 0) {
                        self.metadata[(NSString *)kCGImagePropertyTIFFDictionary] = [tiff mutableCopy];
                    }

                    NSDictionary *gps = metadata[(NSString *)kCGImagePropertyGPSDictionary];
                    if (gps.count > 0) {
                        self.metadata[(NSString *)kCGImagePropertyGPSDictionary] = [gps mutableCopy];
                    }
                }
                
                // Return CDVPluginResult to WebView
                // Create info dictionary similar to UIImagePickerController
                NSMutableDictionary *info = [@{ UIImagePickerControllerOriginalImage : processedImage } mutableCopy];
                
                if (metadata.count > 0) {
                    info[UIImagePickerControllerMediaMetadata] = metadata;
                }
                
                // Process and return result
                [self resultForImage:pictureOptions info:info completion:^(CDVPluginResult* pluginResult) {
                    [weakSelf.commandDelegate sendPluginResult:pluginResult callbackId:callbackId];
                    weakSelf.hasPendingOperation = NO;
                    weakSelf.pickerController = nil;
                }];
            }];
        }
    }];
}
#endif

// UINavigationControllerDelegate method
- (void)navigationController:(UINavigationController*)navigationController
      willShowViewController:(UIViewController*)viewController
                    animated:(BOOL)animated
{
    // Backward compatibility for iOS < 14
    // Set title "Videos", when picking videos with the legacy UIImagePickerController
    if([navigationController isKindOfClass:[UIImagePickerController class]]) {
        UIImagePickerController* imagePickerController = (UIImagePickerController*)navigationController;

        // Set title "Videos" when picking not images
        if(![imagePickerController.mediaTypes containsObject:(NSString*)kUTTypeImage]) {
            [viewController.navigationItem setTitle:NSLocalizedString(@"Videos", nil)];
        }
    }
}

- (NSString*)getMimeForEncoding:(CDVEncodingType)encoding
{
    switch (encoding) {
        case EncodingTypePNG: return MIME_PNG;
        case EncodingTypeJPEG:
        default:
            return MIME_JPEG;
    }
}

- (NSString*)formatAsDataURI:(NSData*)data withMIME:(NSString*)mime
{
    NSString* base64 = toBase64(data);
    
    if (base64 == nil) {
        return nil;
    }
    
    return [NSString stringWithFormat:@"data:%@;base64,%@", mime, base64];
}

- (NSString*)processImageAsDataUri:(UIImage*)image info:(NSDictionary*)info options:(CDVPictureOptions*)options
{
    NSString* mime = nil;
    NSData* data = [self processImage:image info:info options:options outMime:&mime];
    
    return [self formatAsDataURI:data withMIME:mime];
}

- (NSData*)processImage:(UIImage*)image info:(NSDictionary*)info options:(CDVPictureOptions*)options
{
    return [self processImage:image info:info options:options outMime:nil];
}

- (NSData*)processImage:(UIImage*)image info:(NSDictionary*)info options:(CDVPictureOptions*)options outMime:(NSString**)outMime
{
    NSData* data = nil;

    switch (options.encodingType) {
        case EncodingTypePNG:
            data = UIImagePNGRepresentation(image);
            if (outMime != nil) *outMime = MIME_PNG;
            break;
        case EncodingTypeJPEG:
        {
            if (outMime != nil) *outMime = MIME_JPEG;

            if ((options.allowsEditing == NO) && (options.targetSize.width <= 0) && (options.targetSize.height <= 0) && (options.correctOrientation == NO) && (([options.quality integerValue] == 100) || (options.sourceType != UIImagePickerControllerSourceTypeCamera))){
                // use image unedited as requested , don't resize
                data = UIImageJPEGRepresentation(image, 1.0);
            } else {
                data = UIImageJPEGRepresentation(image, [options.quality floatValue] / 100.0f);
            }

            if (pickerController.sourceType == UIImagePickerControllerSourceTypeCamera) {
                // Include geolocation data in EXIF metadata if requested, this will
                // be done in locationManager:didUpdateLocations:
                // Note: This will be done only if UIImagePickerControllerMediaMetadata is available
                if (options.usesGeolocation) {

                    // Get the metadata from the UIImagePickerController info dictionary
                    NSDictionary *mediaMetadata = info[UIImagePickerControllerMediaMetadata];
                    
                    // Get location if mediaMetadata is set
                    if (mediaMetadata) {
                        self.data = data;
                        self.metadata = [[NSMutableDictionary alloc] init];
                        
                        NSDictionary *exifDict = mediaMetadata[(NSString *)kCGImagePropertyExifDictionary];

                        if (exifDict.count > 0) {
                            self.metadata[(NSString *)kCGImagePropertyExifDictionary] = [exifDict mutableCopy];
                        }

                        [[self locationManager] requestWhenInUseAuthorization];
                        [[self locationManager] startUpdatingLocation];
                    }

                    // Don't return anything if options.usesGeolocation is set
                    // Data will be returned in locationManager:didUpdateLocations: or locationManager:didFailWithError:
                    // Note: If mediaMetadata is not set, this would also be set to nil, is this expected?
                    data = nil;
                }
            } else if (pickerController.sourceType == UIImagePickerControllerSourceTypePhotoLibrary) {
                PHAsset* asset = [info objectForKey:@"UIImagePickerControllerPHAsset"];
                NSDictionary* controllerMetadata = [self getImageMetadataFromAsset:asset];
                self.data = data;

                if (controllerMetadata.count > 0) {
                    self.metadata = [NSMutableDictionary dictionary];

                    NSDictionary *exif = controllerMetadata[(NSString *)kCGImagePropertyExifDictionary];
                    if (exif.count > 0) {
                        self.metadata[(NSString *)kCGImagePropertyExifDictionary] = [exif mutableCopy];
                    }

                    NSDictionary *tiff = controllerMetadata[(NSString *)kCGImagePropertyTIFFDictionary];
                    if (tiff.count > 0) {
                        self.metadata[(NSString *)kCGImagePropertyTIFFDictionary] = [tiff mutableCopy];
                    }

                    NSDictionary *gps = controllerMetadata[(NSString *)kCGImagePropertyGPSDictionary];
                    if (gps.count > 0) {
                        self.metadata[(NSString *)kCGImagePropertyGPSDictionary] = [gps mutableCopy];
                    }
                }
            }

        }
            break;
        default:
            break;
    };
    
    
    return data;
}

/* --------------------------------------------------------------
-- get the metadata of the image from a PHAsset
-------------------------------------------------------------- */
- (NSDictionary*)getImageMetadataFromAsset:(PHAsset*)asset
{
    if(asset == nil) return nil;

    // get photo info from this asset
    __block NSDictionary *dict = nil;
    PHImageRequestOptions *imageRequestOptions = [[PHImageRequestOptions alloc] init];
    imageRequestOptions.synchronous = YES;
    
    [[PHImageManager defaultManager] requestImageDataAndOrientationForAsset:asset
                                                                    options:imageRequestOptions
                                                                resultHandler:^(NSData *_Nullable imageData, NSString *_Nullable dataUTI, CGImagePropertyOrientation orientation, NSDictionary *_Nullable info) {
        // as this imageData is in NSData format so we need a method to convert this NSData into NSDictionary
        dict = [self convertImageMetadata:imageData];
    }];
    
    return dict;
}

- (NSDictionary*)convertImageMetadata:(NSData*)imageData
{
    CGImageSourceRef imageSource = CGImageSourceCreateWithData((__bridge CFDataRef)(imageData), NULL);

    if (imageSource) {
        NSDictionary *options = @{(NSString *)kCGImageSourceShouldCache : [NSNumber numberWithBool:NO]};
        CFDictionaryRef imageProperties = CGImageSourceCopyPropertiesAtIndex(imageSource, 0, (__bridge CFDictionaryRef)options);

        if (imageProperties) {
            NSDictionary *metadata = (__bridge NSDictionary *)imageProperties;
            CFRelease(imageProperties);
            CFRelease(imageSource);
            NSLog(@"Metadata of selected image%@", metadata);// image metadata after converting NSData into NSDictionary
            return metadata;
        }

        CFRelease(imageSource);
    }

    NSLog(@"Can't read image metadata");
    return nil;
}

/**
 Requests Photos library permissions when needed for picking media from the photo library.
 This is only needed for iOS 13 and older when using UIImagePickerController for picking an image.
 On iOS 14 and later, PHPickerViewController is used and does not need extra permissions.
 @param options The picture options indicating the requested source type.
 @param completion A block invoked with YES when access is authorized (or not required),
                   or NO when access is denied or restricted.
 */
- (void)options:(CDVPictureOptions*)options requestPhotoPermissions:(void (^)(BOOL auth))completion
{
    // This is would be no good response
    if (options.sourceType == UIImagePickerControllerSourceTypeCamera) {
        completion(YES);
    } else {
        PHAuthorizationStatus status = [PHPhotoLibrary authorizationStatus];

        switch (status) {
            case PHAuthorizationStatusAuthorized:
                completion(YES);
                break;
            case PHAuthorizationStatusNotDetermined: {
                [PHPhotoLibrary requestAuthorization:^(PHAuthorizationStatus authorizationStatus) {
                    if (authorizationStatus == PHAuthorizationStatusAuthorized) {
                        completion(YES);
                    } else {
                        completion(NO);
                    }
                }];
                break;
            }
            default:
                completion(NO);
                break;
        }

    }

}

- (UIImage*)retrieveImage:(NSDictionary*)info options:(CDVPictureOptions*)options
{
    // get the image
    UIImage* image = nil;
    if (options.allowsEditing && [info objectForKey:UIImagePickerControllerEditedImage]) {
        image = [info objectForKey:UIImagePickerControllerEditedImage];
    } else {
        image = [info objectForKey:UIImagePickerControllerOriginalImage];
    }

    if (options.correctOrientation) {
        image = [image imageCorrectedForCaptureOrientation];
    }

    UIImage* scaledImage = nil;

    if ((options.targetSize.width > 0) && (options.targetSize.height > 0)) {
        // if cropToSize, resize image and crop to target size, otherwise resize to fit target without cropping
        if (options.cropToSize) {
            scaledImage = [image imageByScalingAndCroppingForSize:options.targetSize];
        } else {
            scaledImage = [image imageByScalingNotCroppingForSize:options.targetSize];
        }
    }

    return (scaledImage == nil ? image : scaledImage);
}

- (void)resultForImage:(CDVPictureOptions*)options
                  info:(NSDictionary*)info
            completion:(void (^)(CDVPluginResult* res))completion
{
    CDVPluginResult* result = nil;
    BOOL saveToPhotoAlbum = options.saveToPhotoAlbum;
    UIImage* image = nil;

    switch (options.destinationType) {
        case DestinationTypeDataUrl:
        {
            image = [self retrieveImage:info options:options];
            NSString* data = [self processImageAsDataUri:image info:info options:options];
            if (data)  {
                result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString: data];
            }
        }
            break;
        default: // DestinationTypeFileUri
        {
            image = [self retrieveImage:info options:options];
            NSData* data = [self processImage:image info:info options:options];
            
            if (data) {
                if (pickerController.sourceType == UIImagePickerControllerSourceTypePhotoLibrary) {
                    NSMutableData *imageDataWithExif = [NSMutableData data];
                    if (self.metadata) {
                        CGImageSourceRef sourceImage = CGImageSourceCreateWithData((__bridge CFDataRef)self.data, NULL);
                        CFStringRef sourceType = CGImageSourceGetType(sourceImage);

                        CGImageDestinationRef destinationImage = CGImageDestinationCreateWithData((__bridge CFMutableDataRef)imageDataWithExif, sourceType, 1, NULL);
                        CGImageDestinationAddImageFromSource(destinationImage, sourceImage, 0, (__bridge CFDictionaryRef)self.metadata);
                        CGImageDestinationFinalize(destinationImage);

                        CFRelease(sourceImage);
                        CFRelease(destinationImage);
                    } else {
                        imageDataWithExif = [self.data mutableCopy];
                    }

                    NSError* err = nil;
                    NSString* extension = self.pickerController.pictureOptions.encodingType == EncodingTypePNG ? @"png":@"jpg";
                    NSString* filePath = [self tempFilePathForExtension:extension];

                    // save file
                    if (![imageDataWithExif writeToFile:filePath options:NSAtomicWrite error:&err]) {
                        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_IO_EXCEPTION
                                                   messageAsString:[err localizedDescription]];
                    }
                    else {
                        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK
                                                   messageAsString:[[NSURL fileURLWithPath:filePath] absoluteString]];
                    }
                    
                } else if (pickerController.sourceType != UIImagePickerControllerSourceTypeCamera || !options.usesGeolocation) {
                    // No need to save file if usesGeolocation is true since it will be saved after the location is tracked
                    NSString* extension = options.encodingType == EncodingTypePNG? @"png" : @"jpg";
                    NSString* filePath = [self tempFilePathForExtension:extension];
                    NSError* err = nil;

                    // save file
                    if (![data writeToFile:filePath options:NSAtomicWrite error:&err]) {
                        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_IO_EXCEPTION
                                                   messageAsString:[err localizedDescription]];
                    } else {
                        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK
                                                   messageAsString:[[NSURL fileURLWithPath:filePath] absoluteString]];
                    }
                }

            }
        }
            break;
    };

    if (saveToPhotoAlbum && image) {
        UIImageWriteToSavedPhotosAlbum(image, nil, nil, nil);
    }

    completion(result);
}

- (CDVPluginResult*)resultForVideo:(NSDictionary*)info
{
    NSString* moviePath = [[info objectForKey:UIImagePickerControllerMediaURL] absoluteString];
    
    // On iOS 13 the movie path becomes inaccessible, create and return a copy
    if (@available(iOS 13, *)) {
        moviePath = [self copyFileToTemp:[[info objectForKey:UIImagePickerControllerMediaURL] path]];
    }
    
    return [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:moviePath];
}

/**
 Generates a unique temporary file path for a file extension.
 
 The filename is prefixed with `cdv_photo_` and suffixed with the provided
 file extension. A UNIX timestamp in milliseconds since 1970 is used to ensure
 uniqueness between calls.
 
 Threading: Safe to call from any thread. Uses NSTemporaryDirectory() and
 does not perform any I/O; it only constructs a path string.
 
 @param fileExtension  The desired file extension without a leading dot
                      (for example, "jpg", "png", or the original video
                      extension like "mov").
 
 @return An absolute path string within the app's temporary directory,
         e.g. `/var/mobile/Containers/Data/Application/<UUID>/tmp/cdv_photo_<timestamp>.jpg`.
 
 @discussion The returned path is not created on disk. Callers are responsible
             for writing data to the path and handling any errors.
 
 @note Only files whose names start with `cdv_photo_` are cleaned up by the
       plugin's `cleanup:` method.
 **/
- (NSString*)tempFilePathForExtension:(NSString*)fileExtension
{
    // Return a unique file name like
    // `/var/mobile/Containers/Data/Application/<UUID>/tmp/cdv_photo_<timestamp>.jpg`.
    return [NSString stringWithFormat:
            @"%@/%@%lld.%@",
            [NSTemporaryDirectory() stringByStandardizingPath],
            CDV_PHOTO_PREFIX,
            (long long)([[NSDate date] timeIntervalSince1970] * 1000.0),
            fileExtension];
}

- (NSString*)copyFileToTemp:(NSString*)filePath
{
    NSFileManager* fileManager = [[NSFileManager alloc] init];
    NSString* tempFilePath = [self tempFilePathForExtension:[filePath pathExtension]];
    NSError *error = nil;
    
    // Copy file to temp directory
    BOOL copySuccess = [fileManager copyItemAtPath:filePath toPath:tempFilePath error:&error];
    
    if (!copySuccess || error) {
        NSLog(@"CDVCamera: Failed to copy file from %@ to temporary path %@. Error: %@", filePath, tempFilePath, [error localizedDescription]);
        return nil;
    }
    
    // Verify the copied file exists
    if (![fileManager fileExistsAtPath:tempFilePath]) {
        NSLog(@"CDVCamera: Copied file does not exist at temporary path: %@", tempFilePath);
        return nil;
    }
    
    return [[NSURL fileURLWithPath:tempFilePath] absoluteString];
}

/**
  Called by JS camera.cleanup()
  Removes intermediate image files that are kept in temporary storage after
  calling camera.getPicture.
*/
- (void)cleanup:(CDVInvokedUrlCommand*)command
{
    NSFileManager* fileManager = [NSFileManager defaultManager];
    NSString* tempDirectoryPath = NSTemporaryDirectory();
    NSError* error = nil;
    
    NSArray<NSString*>* allFiles = [fileManager contentsOfDirectoryAtPath:tempDirectoryPath error:&error];
    
    if (error) {
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_IO_EXCEPTION 
                                                    messageAsString:[error localizedDescription]];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        return;
    }
    
    BOOL hasErrors = NO;
    
    for (NSString* fileName in allFiles) {
        // Only delete files created by the camera plugin
        if (![fileName hasPrefix:CDV_PHOTO_PREFIX]) continue;
        
        NSString* filePath = [tempDirectoryPath stringByAppendingPathComponent:fileName];
        NSError* deleteError = nil;
        
        if (![fileManager removeItemAtPath:filePath error:&deleteError]) {
            NSLog(@"Failed to delete: %@ (error: %@)", filePath, deleteError);
            hasErrors = YES;
        }
    }
    
    CDVPluginResult* result = hasErrors 
        ? [CDVPluginResult resultWithStatus:CDVCommandStatus_IO_EXCEPTION messageAsString:@"One or more files failed to be deleted."]
        : [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

#pragma mark UIImagePickerControllerDelegate methods

- (void)imagePickerController:(UIImagePickerController*)picker didFinishPickingMediaWithInfo:(NSDictionary*)info
{
    __weak CDVCameraPicker* cameraPicker = (CDVCameraPicker*)picker;
    __weak CDVCamera* weakSelf = self;

    dispatch_block_t invoke = ^(void) {
        __block CDVPluginResult* result = nil;

        NSString* mediaType = [info objectForKey:UIImagePickerControllerMediaType];
        
        // Image selected
        if ([mediaType isEqualToString:(NSString*)kUTTypeImage]) {
            [weakSelf resultForImage:cameraPicker.pictureOptions info:info completion:^(CDVPluginResult* res) {
                if (![self usesGeolocation] || picker.sourceType != UIImagePickerControllerSourceTypeCamera) {
                    [weakSelf.commandDelegate sendPluginResult:res callbackId:cameraPicker.callbackId];
                    weakSelf.hasPendingOperation = NO;
                    weakSelf.pickerController = nil;
                }
            }];
            
            // Video selected
        } else {
            result = [weakSelf resultForVideo:info];
            [weakSelf.commandDelegate sendPluginResult:result callbackId:cameraPicker.callbackId];
            weakSelf.hasPendingOperation = NO;
            weakSelf.pickerController = nil;
        }
    };

    [[cameraPicker presentingViewController] dismissViewControllerAnimated:YES completion:invoke];
}

// older api calls newer didFinishPickingMediaWithInfo
- (void)imagePickerController:(UIImagePickerController*)picker
        didFinishPickingImage:(UIImage*)image
                  editingInfo:(NSDictionary*)editingInfo
{
    NSDictionary* imageInfo = [NSDictionary dictionaryWithObject:image forKey:UIImagePickerControllerOriginalImage];

    [self imagePickerController:picker didFinishPickingMediaWithInfo:imageInfo];
}

- (void)imagePickerControllerDidCancel:(UIImagePickerController*)picker
{
    __weak CDVCameraPicker* cameraPicker = (CDVCameraPicker*)picker;
    __weak CDVCamera* weakSelf = self;

    dispatch_block_t invoke = ^ (void) {
        CDVPluginResult* result;
        if (picker.sourceType == UIImagePickerControllerSourceTypeCamera && [AVCaptureDevice authorizationStatusForMediaType:AVMediaTypeVideo] != AVAuthorizationStatusAuthorized) {
            result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"has no access to camera"];
        } else {
            result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"No Image Selected"];
        }


        [weakSelf.commandDelegate sendPluginResult:result callbackId:cameraPicker.callbackId];

        weakSelf.hasPendingOperation = NO;
        weakSelf.pickerController = nil;
    };

    [[cameraPicker presentingViewController] dismissViewControllerAnimated:YES completion:invoke];
}

#pragma mark CLLocationManager

/**
    Lazy instantiation of the CLLocationManager used to get GPS location data when
    when capturing JPEGs.
    @return The CLLocationManager instance.
*/
- (CLLocationManager*)locationManager
{
    if (locationManager != nil) {
        return locationManager;
    }

    locationManager = [[CLLocationManager alloc] init];
    [locationManager setDesiredAccuracy:kCLLocationAccuracyNearestTenMeters];
    [locationManager setDelegate:self];

    return locationManager;
}

# pragma mark CLLocationManagerDelegate methods

/**
    Called when the CLLocationManager has retrieved a location update.
    The location data is formatted and added to the image metadata, and
    the image result is returned. Only used when capturing JPEGs.
    @param manager The CLLocationManager instance.
    @param newLocation The new CLLocation data.
    @param oldLocation The previous CLLocation data.
*/
- (void)locationManager:(CLLocationManager*)manager
    didUpdateToLocation:(CLLocation*)newLocation
           fromLocation:(CLLocation*)oldLocation
{
    if (locationManager == nil) {
        return;
    }

    [self.locationManager stopUpdatingLocation];
    self.locationManager = nil;

    NSMutableDictionary *GPSDictionary = [[NSMutableDictionary dictionary] init];

    CLLocationDegrees latitude  = newLocation.coordinate.latitude;
    CLLocationDegrees longitude = newLocation.coordinate.longitude;

    // latitude
    if (latitude < 0.0) {
        latitude = latitude * -1.0f;
        [GPSDictionary setObject:@"S" forKey:(NSString*)kCGImagePropertyGPSLatitudeRef];
    } else {
        [GPSDictionary setObject:@"N" forKey:(NSString*)kCGImagePropertyGPSLatitudeRef];
    }
    [GPSDictionary setObject:[NSNumber numberWithFloat:latitude] forKey:(NSString*)kCGImagePropertyGPSLatitude];

    // longitude
    if (longitude < 0.0) {
        longitude = longitude * -1.0f;
        [GPSDictionary setObject:@"W" forKey:(NSString*)kCGImagePropertyGPSLongitudeRef];
    }
    else {
        [GPSDictionary setObject:@"E" forKey:(NSString*)kCGImagePropertyGPSLongitudeRef];
    }
    [GPSDictionary setObject:[NSNumber numberWithFloat:longitude] forKey:(NSString*)kCGImagePropertyGPSLongitude];

    // altitude
    CGFloat altitude = newLocation.altitude;
    if (!isnan(altitude)){
        if (altitude < 0) {
            altitude = -altitude;
            [GPSDictionary setObject:@"1" forKey:(NSString *)kCGImagePropertyGPSAltitudeRef];
        } else {
            [GPSDictionary setObject:@"0" forKey:(NSString *)kCGImagePropertyGPSAltitudeRef];
        }
        [GPSDictionary setObject:[NSNumber numberWithFloat:altitude] forKey:(NSString *)kCGImagePropertyGPSAltitude];
    }

    // Time and date
    NSDateFormatter *formatter = [[NSDateFormatter alloc] init];
    [formatter setDateFormat:@"HH:mm:ss.SSSSSS"];
    [formatter setTimeZone:[NSTimeZone timeZoneWithAbbreviation:@"UTC"]];
    [GPSDictionary setObject:[formatter stringFromDate:newLocation.timestamp] forKey:(NSString *)kCGImagePropertyGPSTimeStamp];
    [formatter setDateFormat:@"yyyy:MM:dd"];
    [GPSDictionary setObject:[formatter stringFromDate:newLocation.timestamp] forKey:(NSString *)kCGImagePropertyGPSDateStamp];

    [self.metadata setObject:GPSDictionary forKey:(NSString *)kCGImagePropertyGPSDictionary];
    [self imagePickerControllerReturnImageResult];
}

/**
    Called when the CLLocationManager fails to retrieve location data.
    The image result is returned without location metadata.
    Only used when capturing JPEGs.
    @param manager The CLLocationManager instance.
    @param error The error that occurred.
*/
- (void)locationManager:(CLLocationManager*)manager didFailWithError:(NSError*)error
{
    if (locationManager == nil) {
        return;
    }

    [self.locationManager stopUpdatingLocation];
    self.locationManager = nil;

    [self imagePickerControllerReturnImageResult];
}

/**
    Called to return the image result after location data has been added to the metadata
    or an error occurred while retrieving location data.
*/
- (void)imagePickerControllerReturnImageResult
{
    CDVPictureOptions* options = self.pickerController.pictureOptions;
    CDVPluginResult* result = nil;
   
    NSMutableData *imageDataWithExif = [NSMutableData data];

    if (self.metadata) {
        NSData* dataCopy = [self.data mutableCopy];
        CGImageSourceRef sourceImage = CGImageSourceCreateWithData((__bridge CFDataRef)dataCopy, NULL);
        CFStringRef sourceType = CGImageSourceGetType(sourceImage);

        CGImageDestinationRef destinationImage = CGImageDestinationCreateWithData((__bridge CFMutableDataRef)imageDataWithExif, sourceType, 1, NULL);
        CGImageDestinationAddImageFromSource(destinationImage, sourceImage, 0, (__bridge CFDictionaryRef)self.metadata);
        CGImageDestinationFinalize(destinationImage);

        dataCopy = nil;
        CFRelease(sourceImage);
        CFRelease(destinationImage);
    } else {
        imageDataWithExif = [self.data mutableCopy];
    }

    switch (options.destinationType) {
        case DestinationTypeDataUrl:
        {
            NSString* mime = [self getMimeForEncoding: self.pickerController.pictureOptions.encodingType];
            NSString* uri = [self formatAsDataURI: self.data withMIME: mime];
            result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString: uri];
        }
            break;
        default: // DestinationTypeFileUri
        {
            NSError* err = nil;
            NSString* extension = self.pickerController.pictureOptions.encodingType == EncodingTypePNG ? @"png":@"jpg";
            NSString* filePath = [self tempFilePathForExtension:extension];

            // save file
            if (![self.data writeToFile:filePath options:NSAtomicWrite error:&err]) {
                result = [CDVPluginResult resultWithStatus:CDVCommandStatus_IO_EXCEPTION
                                           messageAsString:[err localizedDescription]];
            }
            else {
                result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK
                                           messageAsString:[[NSURL fileURLWithPath:filePath] absoluteString]];
            }
        }
            break;
    };

    if (result) {
        [self.commandDelegate sendPluginResult:result callbackId:self.pickerController.callbackId];
    }

    self.hasPendingOperation = NO;
    self.pickerController = nil;
    self.data = nil;
    self.metadata = nil;
    imageDataWithExif = nil;
    if (options.saveToPhotoAlbum) {
        UIImageWriteToSavedPhotosAlbum([[UIImage alloc] initWithData:self.data], nil, nil, nil);
    }
}

@end

@implementation CDVCameraPicker

- (BOOL)prefersStatusBarHidden
{
    return YES;
}

- (UIViewController*)childViewControllerForStatusBarHidden
{
    return nil;
}

- (void)viewWillAppear:(BOOL)animated
{
    SEL sel = NSSelectorFromString(@"setNeedsStatusBarAppearanceUpdate");
    if ([self respondsToSelector:sel]) {
        [self performSelector:sel withObject:nil afterDelay:0];
    }

    [super viewWillAppear:animated];
}

+ (instancetype)createFromPictureOptions:(CDVPictureOptions*)pictureOptions
{
    CDVCameraPicker* cameraPicker = [[CDVCameraPicker alloc] init];
    cameraPicker.pictureOptions = pictureOptions;
    cameraPicker.sourceType = pictureOptions.sourceType;
    cameraPicker.allowsEditing = pictureOptions.allowsEditing;

    if (cameraPicker.sourceType == UIImagePickerControllerSourceTypeCamera) {
        // We only allow taking pictures (no video) in this API.
        cameraPicker.mediaTypes = @[(NSString*)kUTTypeImage];
        // We can only set the camera device if we're actually using the camera.
        cameraPicker.cameraDevice = pictureOptions.cameraDirection;
    } else if (pictureOptions.mediaType == MediaTypeAll) {
        cameraPicker.mediaTypes = [UIImagePickerController availableMediaTypesForSourceType:cameraPicker.sourceType];
    } else {
        NSArray* mediaArray = @[(NSString*)(pictureOptions.mediaType == MediaTypeVideo ? kUTTypeMovie : kUTTypeImage)];
        cameraPicker.mediaTypes = mediaArray;
    }

    return cameraPicker;
}

@end
