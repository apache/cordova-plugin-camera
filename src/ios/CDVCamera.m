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

#ifndef __CORDOVA_4_0_0
    #import <Cordova/NSData+Base64.h>
#endif

#define CDV_PHOTO_PREFIX @"cdv_photo_"

static NSSet* org_apache_cordova_validArrowDirections;

static NSString* toBase64(NSData* data) {
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

@implementation CDVPictureOptions


/*
 *  API:
 *  Camera:
 *    - CameraPopoverHandle:
 *      - setPosition(popoverOptions) => ()
 *    - getPicture(success, failure, options) => CameraPopoverHandle
 *      - options:
 *        - quality (number [0-100])
 *        - destinationType (number):
 *          0: DATA_URL => Returns a Base64 image
 *          1: FILE_URI => Returns a file URI
 *          2: NATIVE_URI => Returns a native URI (asset-library://...)
 *        - sourceType (number):
 *          0: PHOTOLIBRARY
 *          1: CAMERA
 *          2: SAVEDPHOTOALBUM
 *        - allowEdit (bool)
 *        - encodingType (number):
 *          0: JPEG
 *          1: PNG
 *        - targetWidth/targetHeight (number)
 *        - mediaType (number):
 *          0: PICTURE
 *          1: VIDEO
 *          2: ALLMEDIA
 *        - correctOrientation (bool)
 *        - saveToPhotoAlbum (bool)
 *        - cameraDirection (number)
 *          0: BACK
 *          1: FRONT
 *        - popoverOptions (dictionnary) [iPad only]:
 *          - x (number)
 *          - y (number)
 *          - width (number)
 *          - height (number)
 *          - arrowDir (number):
 *            1: ARROW_UP
 *            2: ARROW_DOWN
 *            4: ARROW_LEFT
 *            8: ARROW_RIGHT
 *            15: ARROW_ANY
 *    - cleanup => ()
 */
+ (instancetype) createFromTakePictureArguments:(CDVInvokedUrlCommand*)command
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

    /*
    As per the doc :
    When using destinationType.NATIVE_URI and sourceType.CAMERA, photos are
    saved in the saved photo album regardless on the value of saveToPhotoAlbum
    parameter.
    */
    BOOL isDestinationNativeUri = (pictureOptions.destinationType == DestinationTypeNativeUri);
    BOOL isSourceCamera = (pictureOptions.sourceType == UIImagePickerControllerSourceTypeCamera);
    pictureOptions.saveToPhotoAlbum = [[command argumentAtIndex:9 withDefault:@(NO)] boolValue] || (isDestinationNativeUri && isSourceCamera);
    pictureOptions.popoverOptions = [command argumentAtIndex:10 withDefault:nil];
    pictureOptions.cameraDirection = [[command argumentAtIndex:11 withDefault:@(UIImagePickerControllerCameraDeviceRear)] unsignedIntegerValue];
    
    pictureOptions.popoverSupported = NO;
    pictureOptions.usesGeolocation = NO;
    
    return pictureOptions;
}

@end


@interface CDVCamera ()

@property (readwrite, assign) BOOL hasPendingOperation;

@end

@implementation CDVCamera

+ (void)initialize
{
    org_apache_cordova_validArrowDirections = [[NSSet alloc] initWithObjects:[NSNumber numberWithInt:UIPopoverArrowDirectionUp], [NSNumber numberWithInt:UIPopoverArrowDirectionDown], [NSNumber numberWithInt:UIPopoverArrowDirectionLeft], [NSNumber numberWithInt:UIPopoverArrowDirectionRight], [NSNumber numberWithInt:UIPopoverArrowDirectionAny], nil];
}

@synthesize hasPendingOperation, pickerController, locationManager;

- (NSURL*) urlTransformer:(NSURL*)url
{
    NSURL* urlToTransform = url;
    
    // for backwards compatibility - we check if this property is there
    SEL sel = NSSelectorFromString(@"urlTransformer");
    if ([self.commandDelegate respondsToSelector:sel]) {
        // grab the block from the commandDelegate
        NSURL* (^urlTransformer)(NSURL*) = ((id(*)(id, SEL))objc_msgSend)(self.commandDelegate, sel);
        // if block is not null, we call it
        if (urlTransformer) {
            urlToTransform = urlTransformer(url);
        }
    }
    
    return urlToTransform;
}

- (BOOL)usesGeolocation
{
    id useGeo = [self.commandDelegate.settings objectForKey:[@"CameraUsesGeolocation" lowercaseString]];
    return [(NSNumber*)useGeo boolValue];
}

- (BOOL)popoverSupported
{
    return (NSClassFromString(@"UIPopoverController") != nil) &&
           (UI_USER_INTERFACE_IDIOM() == UIUserInterfaceIdiomPad);
}

- (void)takePicture:(CDVInvokedUrlCommand*)command
{
    self.hasPendingOperation = YES;
    
    __weak CDVCamera* weakSelf = self;

    [self.commandDelegate runInBackground:^{
        
        CDVPictureOptions* pictureOptions = [CDVPictureOptions createFromTakePictureArguments:command];
        
        /*
         FIXME #1
         What to do about quality?
         If the option is set and the image is retrieved from the PhotoLibrary or SavedAlbum with a NATIVE_URI, no editing,
         and is not saved to the photo album, then we return the "wrong" image.
         However, the doc says "quality of the **saved** image", so it might be fine.
         */
        /*
         FIXME #2
         The doc says: "Rotate the image to correct for the orientation of the device **during capture**."
         Is capture <=> sourceType == CAMERA ?
         */
        // Check for option compatibility
        BOOL isDestinationNativeUri = (pictureOptions.destinationType == DestinationTypeNativeUri);
        
        BOOL needsResize = [self needsResize:pictureOptions];
        BOOL needsOrientationCorrection = pictureOptions.correctOrientation;
        BOOL isSourceCamera = (pictureOptions.sourceType == UIImagePickerControllerSourceTypeCamera);
        BOOL allowsEditing = pictureOptions.allowsEditing;
        BOOL needsSavingToPhotoAlbum = (needsResize || needsOrientationCorrection || allowsEditing);
        
        // if one wants an edited image and a NATIVE_URI, the edited image must be in the assets library therefore one must set the saveToPhotoAlbum option to true.
        if (!pictureOptions.saveToPhotoAlbum && isDestinationNativeUri && needsSavingToPhotoAlbum) {
            NSLog(@"Incompatible options, cannot return native URI if image is not in the assets library");
            CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Incompatible options, cannot return native URI if image is not in the assets library"];
            [weakSelf.commandDelegate sendPluginResult:result callbackId:command.callbackId];
            return;
        }
        
        pictureOptions.popoverSupported = [weakSelf popoverSupported];
        pictureOptions.usesGeolocation = [weakSelf usesGeolocation];
        
        BOOL hasCamera = [UIImagePickerController isSourceTypeAvailable:pictureOptions.sourceType];
        if (!hasCamera) {
            NSLog(@"Camera.getPicture: source type %lu not available.", (unsigned long)pictureOptions.sourceType);
            CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"No camera available"];
            [weakSelf.commandDelegate sendPluginResult:result callbackId:command.callbackId];
            return;
        }

        // Validate the app has permission to access the camera
        if (pictureOptions.sourceType == UIImagePickerControllerSourceTypeCamera && [AVCaptureDevice respondsToSelector:@selector(authorizationStatusForMediaType:)]) {
            AVAuthorizationStatus authStatus = [AVCaptureDevice authorizationStatusForMediaType:AVMediaTypeVideo];
            if (authStatus == AVAuthorizationStatusDenied ||
                authStatus == AVAuthorizationStatusRestricted) {
                // If iOS 8+, offer a link to the Settings app
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wtautological-pointer-compare"
                NSString* settingsButton = (&UIApplicationOpenSettingsURLString != NULL)
                    ? NSLocalizedString(@"Settings", nil)
                    : nil;
#pragma clang diagnostic pop

                // Denied; show an alert
                dispatch_async(dispatch_get_main_queue(), ^{
                    [[[UIAlertView alloc] initWithTitle:[[NSBundle mainBundle]
                                                         objectForInfoDictionaryKey:@"CFBundleDisplayName"]
                                                message:NSLocalizedString(@"Access to the camera has been prohibited; please enable it in the Settings app to continue.", nil)
                                               delegate:weakSelf
                                      cancelButtonTitle:NSLocalizedString(@"OK", nil)
                                      otherButtonTitles:settingsButton, nil] show];
                });
            }
        }

        CDVCameraPicker* cameraPicker = [CDVCameraPicker createFromPictureOptions:pictureOptions];
        weakSelf.pickerController = cameraPicker;
        
        cameraPicker.delegate = weakSelf;
        cameraPicker.callbackId = command.callbackId;
        // we need to capture this state for memory warnings that dealloc this object
        cameraPicker.webView = weakSelf.webView;
        
        // Perform UI operations on the main thread
        dispatch_async(dispatch_get_main_queue(), ^{
            // If a popover is already open, close it; we only want one at a time.
            if (([[weakSelf pickerController] pickerPopoverController] != nil) && [[[weakSelf pickerController] pickerPopoverController] isPopoverVisible]) {
                [[[weakSelf pickerController] pickerPopoverController] dismissPopoverAnimated:YES];
                [[[weakSelf pickerController] pickerPopoverController] setDelegate:nil];
                [[weakSelf pickerController] setPickerPopoverController:nil];
            }

            if ([weakSelf popoverSupported] && (pictureOptions.sourceType != UIImagePickerControllerSourceTypeCamera)) {
                if (cameraPicker.pickerPopoverController == nil) {
                    cameraPicker.pickerPopoverController = [[NSClassFromString(@"UIPopoverController") alloc] initWithContentViewController:cameraPicker];
                }
                [weakSelf displayPopover:pictureOptions.popoverOptions];
                weakSelf.hasPendingOperation = NO;
            } else {
                [weakSelf.viewController presentViewController:cameraPicker animated:YES completion:^{
                    weakSelf.hasPendingOperation = NO;
                }];
            }
        });
    }];
}

// Delegate for camera permission UIAlertView
- (void)alertView:(UIAlertView *)alertView clickedButtonAtIndex:(NSInteger)buttonIndex
{
    // If Settings button (on iOS 8), open the settings app
    if (buttonIndex == 1) {
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wtautological-pointer-compare"
        if (&UIApplicationOpenSettingsURLString != NULL) {
            [[UIApplication sharedApplication] openURL:[NSURL URLWithString:UIApplicationOpenSettingsURLString]];
        }
#pragma clang diagnostic pop
    }

    // Dismiss the view
    [[self.pickerController presentingViewController] dismissViewControllerAnimated:YES completion:nil];

    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"has no access to camera"];   // error callback expects string ATM

    [self.commandDelegate sendPluginResult:result callbackId:self.pickerController.callbackId];

    self.hasPendingOperation = NO;
    self.pickerController = nil;
}

- (void)repositionPopover:(CDVInvokedUrlCommand*)command
{
    NSDictionary* options = [command argumentAtIndex:0 withDefault:nil];

    [self displayPopover:options];
}

- (NSInteger)integerValueForKey:(NSDictionary*)dict key:(NSString*)key defaultValue:(NSInteger)defaultValue
{
    NSInteger value = defaultValue;

    NSNumber* val = [dict valueForKey:key];  // value is an NSNumber

    if (val != nil) {
        value = [val integerValue];
    }
    return value;
}

- (void)displayPopover:(NSDictionary*)options
{
    NSInteger x = 0;
    NSInteger y = 32;
    NSInteger width = 320;
    NSInteger height = 480;
    UIPopoverArrowDirection arrowDirection = UIPopoverArrowDirectionAny;

    if (options) {
        x = [self integerValueForKey:options key:@"x" defaultValue:0];
        y = [self integerValueForKey:options key:@"y" defaultValue:32];
        width = [self integerValueForKey:options key:@"width" defaultValue:320];
        height = [self integerValueForKey:options key:@"height" defaultValue:480];
        arrowDirection = [self integerValueForKey:options key:@"arrowDir" defaultValue:UIPopoverArrowDirectionAny];
        if (![org_apache_cordova_validArrowDirections containsObject:[NSNumber numberWithUnsignedInteger:arrowDirection]]) {
            arrowDirection = UIPopoverArrowDirectionAny;
        }
    }

    [[[self pickerController] pickerPopoverController] setDelegate:self];
    [[[self pickerController] pickerPopoverController] presentPopoverFromRect:CGRectMake(x, y, width, height)
                                                                 inView:[self.webView superview]
                                               permittedArrowDirections:arrowDirection
                                                               animated:YES];
}

- (void)navigationController:(UINavigationController *)navigationController willShowViewController:(UIViewController *)viewController animated:(BOOL)animated
{
    if([navigationController isKindOfClass:[UIImagePickerController class]]){
        UIImagePickerController* cameraPicker = (UIImagePickerController*)navigationController;
        
        if(![cameraPicker.mediaTypes containsObject:(NSString*)kUTTypeImage]){
            [viewController.navigationItem setTitle:NSLocalizedString(@"Videos", nil)];
        }
    }
}

- (void)cleanup:(CDVInvokedUrlCommand*)command
{
    // empty the tmp directory
    NSFileManager* fileMgr = [[NSFileManager alloc] init];
    NSError* err = nil;
    BOOL hasErrors = NO;

    // clear contents of NSTemporaryDirectory
    NSString* tempDirectoryPath = NSTemporaryDirectory();
    NSDirectoryEnumerator* directoryEnumerator = [fileMgr enumeratorAtPath:tempDirectoryPath];
    NSString* fileName = nil;
    BOOL result;

    while ((fileName = [directoryEnumerator nextObject])) {
        // only delete the files we created
        if (![fileName hasPrefix:CDV_PHOTO_PREFIX]) {
            continue;
        }
        NSString* filePath = [tempDirectoryPath stringByAppendingPathComponent:fileName];
        result = [fileMgr removeItemAtPath:filePath error:&err];
        if (!result && err) {
            NSLog(@"Failed to delete: %@ (error: %@)", filePath, err);
            hasErrors = YES;
        }
    }

    CDVPluginResult* pluginResult;
    if (hasErrors) {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_IO_EXCEPTION messageAsString:@"One or more files failed to be deleted."];
    } else {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    }
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void)popoverControllerDidDismissPopover:(id)popoverController
{
    UIPopoverController* pc = (UIPopoverController*)popoverController;

    [pc dismissPopoverAnimated:YES];
    pc.delegate = nil;
    if (self.pickerController && self.pickerController.callbackId && self.pickerController.pickerPopoverController) {
        self.pickerController.pickerPopoverController = nil;
        NSString* callbackId = self.pickerController.callbackId;
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"no image selected"];   // error callback expects string ATM
        [self.commandDelegate sendPluginResult:result callbackId:callbackId];
    }
    self.hasPendingOperation = NO;
}

- (NSString*)tempFilePath:(NSString*)extension
{
    NSString* docsPath = [NSTemporaryDirectory()stringByStandardizingPath];
    NSFileManager* fileMgr = [[NSFileManager alloc] init]; // recommended by Apple (vs [NSFileManager defaultManager]) to be threadsafe
    NSString* filePath;
    
    // generate unique file name
    int i = 1;
    do {
        filePath = [NSString stringWithFormat:@"%@/%@%03d.%@", docsPath, CDV_PHOTO_PREFIX, i++, extension];
    } while ([fileMgr fileExistsAtPath:filePath]);

    return filePath;
}

- (BOOL) needsResize:(CDVPictureOptions*)options
{
    return (options.targetSize.height > 0 && options.targetSize.width > 0);
}

- (BOOL) needsEdit:(UIImage*)image options:(CDVPictureOptions*)options
{
    return options.correctOrientation || [self needsResize:options];
}

- (BOOL) needsSavingToPhotoAlbum:(UIImage*)image options:(CDVPictureOptions*)options
{
    /*
     We save to the photo album if:
     - the option is set
     - the image is fetch from the camera OR the image has been edited (no need to duplicate image in the library)
     */
    BOOL isSourceCamera = options.sourceType == UIImagePickerControllerSourceTypeCamera;
    BOOL saveToPhotoAlbum = options.saveToPhotoAlbum && ([self needsEdit:image options:options] || isSourceCamera);
    
    return saveToPhotoAlbum;
}

/*
 Metadata is not needed for:
 - source: gallery
 - destination: NATIVE_URI
 - no edit (not orientation and not resize and not allowEdits)
 
 otherwise, it can be found:
 - source: camera
 => UIImagePickerControllerMediaMetadata
 - source: gallery
 => CGImage thingy
 */

// resultForImage:
//      retrieve image, OK
//      edit image (orientation + resize) and metadata OK
//      if (geoLoc)
//          save on self.{data, metadata}
//          wait for geoLoc
//      else
//          saveAndResult
//
// saveAndResult:
//      saveToPhotoAlbum if needed (options.saveToPhotoAlbum && !(gallery && NATIVE_URI))
//      send back the image URI
- (void)didReceiveImage:(CDVPictureOptions*)options info:(NSDictionary*)info
{
    UIImage* image = [self retrieveImage:info options:options];
    
    /*
     We can send the result immediately if:
     - we fetch the picture from the PhotoLibrary or the SavedPhotoAlbum,
     - we don't do any editing (orientation or resize),
     - we pass down the result as a NATIVE_URI
     */
    BOOL needsEdit = [self needsEdit:image options:options];
    BOOL isSourceCamera = (options.sourceType == UIImagePickerControllerSourceTypeCamera);
    BOOL isDestinationNativeUri = (options.destinationType == DestinationTypeNativeUri);
    BOOL needsMetadata = (needsEdit || isSourceCamera || !isDestinationNativeUri);

    if (!needsMetadata) {
        CDVPluginResult* result;
        result = [self resultForNativeUri:[info valueForKey:UIImagePickerControllerReferenceURL]];
        [self sendResult:result];
        return;
    }
    
    __weak CDVCamera* weakSelf = self;
    CDVCameraReadMetadataCompletionBlock metadataCompletionBlock;
    metadataCompletionBlock = ^(UIImage *image, NSDictionary *metadata, CDVPictureOptions *options){
        if (options.usesGeolocation) {
            // Will process and send the result once the location has updated
            [weakSelf startUpdatingLocation:image metadata:metadata];
        }
        else {
            [weakSelf processImage:image metadata:metadata options:options
                       resultBlock:^(UIImage *resultImage, NSDictionary *resultMetadata, NSURL *resultURL) {
                           CDVPluginResult* result;
                           result = [weakSelf
                            resultForImage:resultImage
                            metadata:resultMetadata
                            url:resultURL
                            options:weakSelf.pickerController.pictureOptions];
                           [weakSelf sendResult:result];
                       } failureBlock:^(NSString *error) {
                           CDVPluginResult* result;
                           result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:error];
                           [weakSelf sendResult:result];
                       }];
        }
    };
    [self retrieveMetadata:image info:info options:options completionBlock:metadataCompletionBlock];
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
    return image;
}

- (NSDictionary*)fixMetadataForEdited:(NSDictionary*)metadata info:(NSDictionary*)info
{
    CGRect cropRect = [[info objectForKey:UIImagePickerControllerCropRect] CGRectValue];
    NSMutableDictionary* mutableMetadata = [metadata mutableCopy];
    
    [mutableMetadata setValue:[NSNumber numberWithFloat:cropRect.size.width] forKey:(NSString*)kCGImagePropertyPixelWidth];
    [mutableMetadata setValue:[NSNumber numberWithFloat:cropRect.size.height] forKey:(NSString*)kCGImagePropertyPixelHeight];
    // orientation: 1 == TopLeft
    // allowsEditing simply allows to crop the image into a square..
    // front facing camera seemingly flips the picture..
    [mutableMetadata setValue:[NSNumber numberWithInt:1] forKey:(NSString*)kCGImagePropertyOrientation];
    
    return mutableMetadata;
}

- (void)retrieveMetadata:(UIImage*)image info:(NSDictionary*)info options:(CDVPictureOptions*)options completionBlock:(CDVCameraReadMetadataCompletionBlock)completionBlock
{
    if (options.sourceType != UIImagePickerControllerSourceTypeCamera) {
        // Gallery pictures don't have metadata available at UIImagePickerControllerMediaMetadata :(
        ALAssetsLibrary* assetslibrary = [[ALAssetsLibrary alloc] init];
        __weak CDVCamera* weakSelf = self;
        __weak NSDictionary* weakInfo = info;
        __weak CDVPictureOptions* weakOptions = options;
        [assetslibrary
         assetForURL:[info valueForKey:UIImagePickerControllerReferenceURL]
         resultBlock:^(ALAsset* asset) {
             ALAssetRepresentation* representation = [asset defaultRepresentation];
             NSDictionary* metadata = [representation metadata];
             if (options.allowsEditing) {
                 metadata = [weakSelf fixMetadataForEdited:metadata info:weakInfo];
             }
             completionBlock(image, metadata, weakOptions);
         }
         failureBlock:^(NSError* error) {
             // Do not fail completely, just we won't have the metadata...
             // we always want a metadata dictionary, even if empty...
             completionBlock(image, @{}, weakOptions);
         }
        ];
        return;
    }
    
    NSDictionary* metadata = [info objectForKey:UIImagePickerControllerMediaMetadata];
    
    if (options.allowsEditing) {
        metadata = [self fixMetadataForEdited:metadata info:info];
    }
    
    completionBlock(image, metadata, options);
}

- (void)startUpdatingLocation:(UIImage*)image metadata:(NSDictionary*)metadata
{
    self.image = image;
    self.metadata = metadata;
    if (IsAtLeastiOSVersion(@"8.0")) {
        [[self locationManager] performSelector:NSSelectorFromString(@"requestWhenInUseAuthorization") withObject:nil afterDelay:0];
    }
    [[self locationManager] startUpdatingLocation];
}

- (void)fixOrientation:(UIImage**)image metadata:(NSDictionary**)metadata
{
    NSMutableDictionary *mutableMetadata = [*metadata mutableCopy];
    
    // Get image width and height before orientation correction...
    NSNumber *pixelWidth = [mutableMetadata valueForKey:(NSString*)kCGImagePropertyPixelWidth];
    NSNumber *pixelHeight = [mutableMetadata valueForKey:(NSString*)kCGImagePropertyPixelHeight];
    // ...as well as orientation
    long oldOrientation = [(NSNumber*)[mutableMetadata valueForKey:(NSString*)kCGImagePropertyOrientation] integerValue];
    
    // Do the orientation correction
    *image = [*image imageCorrectedForCaptureOrientation];
    
    // Reflect orientation correction (1 means default orientation)
    [mutableMetadata setValue:[NSNumber numberWithInt:1] forKey:(__bridge NSString*)kCGImagePropertyOrientation];
    
    BOOL needsDimensionsInverting = (oldOrientation >=5 && oldOrientation <= 8);
    // If orientation correction inverted width and height dimensions, reflect that on metadata
    if (needsDimensionsInverting) {
        if (pixelHeight != nil) {
            [mutableMetadata setValue:pixelHeight forKey:(NSString*)kCGImagePropertyPixelWidth];
        }
        
        if (pixelWidth != nil) {
            [mutableMetadata setValue:pixelWidth forKey:(NSString*)kCGImagePropertyPixelHeight];
        }
    }
    
    *metadata = [NSDictionary dictionaryWithDictionary:mutableMetadata];
}

- (void)resizeImage:(UIImage**)image metadata:(NSDictionary**)metadata size:(CGSize)size
{
    UIImage* scaledImage = [*image imageByScalingNotCroppingForSize:size];
    NSMutableDictionary *mutableMetadata = [*metadata mutableCopy];
    
    // Reflect dimensions change on metadata
    if (scaledImage != nil && mutableMetadata != nil) {
        [mutableMetadata setValue:[NSNumber numberWithFloat:(*image).size.width] forKey:(NSString*)kCGImagePropertyPixelWidth];
        [mutableMetadata setValue:[NSNumber numberWithFloat:(*image).size.height] forKey:(NSString*)kCGImagePropertyPixelHeight];
    }
    
    *metadata = [NSDictionary dictionaryWithDictionary:mutableMetadata];
    
    if (scaledImage != nil) {
        *image = scaledImage;
    }
}

- (void)saveToPhotoAlbum:(UIImage*)image metadata:(NSDictionary*)metadata completionBlock:(ALAssetsLibraryWriteImageCompletionBlock)completionBlock
{
    ALAssetsLibrary* library = [ALAssetsLibrary new];
    [library writeImageToSavedPhotosAlbum:image.CGImage metadata:metadata completionBlock:completionBlock];
}

- (void)processImage:(UIImage*)image metadata:(NSDictionary*)metadata options:(CDVPictureOptions*)options resultBlock:(CDVCameraProcessImageResultBlock)resultBlock failureBlock:(CDVCameraProcessImageFailureBlock)failureBlock
{
    if (options.correctOrientation) {
        [self fixOrientation:&image metadata:&metadata];
    }
    
    if ([self needsResize:options]) {
        [self resizeImage:&image metadata:&metadata size:options.targetSize];
    }
    
    if ([self needsSavingToPhotoAlbum:image options:options]) {
        BOOL isSourceCamera = options.sourceType == UIImagePickerControllerSourceTypeCamera;
        BOOL isDestinationNativeUri = options.destinationType == DestinationTypeNativeUri;
        
        ALAssetsLibraryWriteImageCompletionBlock librarySaveCompletionBlock = nil;
        // if source is camera and destination is NATIVE_URI:
        // we need to return the url of the asset we've just created.. otherwise we can't return a NATIVE_URI
        if (isSourceCamera && isDestinationNativeUri) {
            librarySaveCompletionBlock = ^(NSURL *assetURL, NSError *error) {
                if (error != nil) {
                    NSString* errorString = [NSString stringWithFormat:@"Could not save image to library with error %@", [error localizedDescription]];
                    failureBlock(errorString);
                    return;
                }
                // Apart from a direct call when receiving the image, this is the only place we can send back a NATIVE_URI
                // because the modified image need to be saved in the assets library in order to have a meaningful native URI.
                resultBlock(nil, nil, assetURL);
            };
        }
        
        [self saveToPhotoAlbum:image metadata:metadata completionBlock:librarySaveCompletionBlock];
    
        // if there is a completion block we know we will send the result at some point (ie the completionBlock has fired) so stop here..
        if (librarySaveCompletionBlock != nil) {
            return;
        }
    }
    
    resultBlock(image, metadata, nil);
}

- (NSData*)imageToData:(UIImage*)image metadata:(NSDictionary*)metadata options:(CDVPictureOptions*)options
{
    NSData *imageData = UIImageJPEGRepresentation(image, [options.quality floatValue] / 100.0f);
    
    // Create source image reference
    CGImageSourceRef source;
    source = CGImageSourceCreateWithData((CFDataRef)imageData, NULL);
    if (!source) {
        NSLog(@"***Could not create source destination ***");
        return imageData;
    }
    
    // Get image type
    CFStringRef UTI = CGImageSourceGetType(source);
    
    // Create destination image reference using mutable data
    NSMutableData *mutableDestinationData = [NSMutableData data];
    CGImageDestinationRef destination;
    destination = CGImageDestinationCreateWithData((CFMutableDataRef)mutableDestinationData, UTI, 1, NULL);
    if (!destination) {
        NSLog(@"***Could not create image destination ***");
        return imageData;
    }
    
    CGImageDestinationAddImageFromSource(destination, source, 0, (CFDictionaryRef)metadata);
    
    BOOL success = NO;
    success = CGImageDestinationFinalize(destination);
    if (!success) {
        NSLog(@"***Could not create data from image destination ***");
        return imageData;
    }
    
    // Cleanup
    CFRelease(destination);
    CFRelease(source);
    
    // Return a non-mutable copy of the destination image data
    return [NSData dataWithData:(NSData *)mutableDestinationData];
}

- (NSString*)writeImageToFile:(NSData*)image options:(CDVPictureOptions*)options error:(NSError**)error
{
    NSString* extension = options.encodingType == EncodingTypePNG ? @"png" : @"jpg";
    NSString* filePath = [self tempFilePath:extension];
    if ([image writeToFile:filePath options:NSAtomicWrite error:error]) {
        return filePath;
    }
    return nil;
}

-(CDVPluginResult*)resultForImage:(UIImage*)image metadata:(NSDictionary*)metadata url:(NSURL*)url options:(CDVPictureOptions*)options
{
    CDVPluginResult* result = nil;
    switch (options.destinationType) {
        case DestinationTypeNativeUri:
        {
            result = [self resultForNativeUri:url];
        }
            break;
        case DestinationTypeFileUri:
        {
            result = [self resultForFileUri:image metadata:metadata options:options];
        }
            break;
        case DestinationTypeDataUrl:
        {
            result = [self resultForBase64:image metadata:metadata options:options];
        }
            break;
        default:
        {
            result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"No result for image :("];
        }
            break;
    }
    return result;
}

- (CDVPluginResult*)resultForNativeUri:(NSURL*)url
{
    NSString* nativeUri = [[self urlTransformer:url] absoluteString];
    return [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:nativeUri];
}

- (CDVPluginResult*)resultForFileUri:(UIImage*)image metadata:(NSDictionary*)metadata options:(CDVPictureOptions*)options
{
    CDVPluginResult* result = nil;
    NSData* imageData = [self imageToData:image metadata:metadata options:options];
    if (imageData) {
        NSString* extension = options.encodingType == EncodingTypePNG ? @"png" : @"jpg";
        NSString* filePath = [self tempFilePath:extension];
        NSError* err = nil;
        
        // save file
        if (![imageData writeToFile:filePath options:NSAtomicWrite error:&err]) {
            result = [CDVPluginResult resultWithStatus:CDVCommandStatus_IO_EXCEPTION messageAsString:[err localizedDescription]];
        } else {
            result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:[[self urlTransformer:[NSURL fileURLWithPath:filePath]] absoluteString]];
        }
    }
    else {
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Could not transform image to data"];
    }
    return result;
}

- (CDVPluginResult*)resultForBase64:(UIImage*)image metadata:(NSDictionary*)metadata options:(CDVPictureOptions*)options
{
    CDVPluginResult* result = nil;
    NSData* imageData = [self imageToData:image metadata:metadata options:options];
    if (imageData) {
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:toBase64(imageData)];
    }
    else {
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Could not transform image to data"];
    }
    return result;
}

- (void) sendResult:(CDVPluginResult*)result
{
    if (result) {
        [self.commandDelegate sendPluginResult:result callbackId:self.pickerController.callbackId];
    }
    
    self.hasPendingOperation = NO;
    self.pickerController = nil;
    self.image = nil;
    self.metadata = nil;
}

- (CDVPluginResult*)resultForVideo:(NSDictionary*)info
{
    NSString* moviePath = [[info objectForKey:UIImagePickerControllerMediaURL] absoluteString];
    return [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:moviePath];
}

- (void)imagePickerController:(UIImagePickerController*)picker didFinishPickingMediaWithInfo:(NSDictionary*)info
{
    __weak CDVCameraPicker* cameraPicker = (CDVCameraPicker*)picker;
    __weak CDVCamera* weakSelf = self;
    
    dispatch_block_t invoke = ^(void) {
        __block CDVPluginResult* result = nil;
        
        NSString* mediaType = [info objectForKey:UIImagePickerControllerMediaType];
        if ([mediaType isEqualToString:(NSString*)kUTTypeImage]) {
            [weakSelf didReceiveImage:cameraPicker.pictureOptions info:info];
        }
        else {
            result = [self resultForVideo:info];
            [weakSelf sendResult:result];
        }
    };
    
    if (cameraPicker.pictureOptions.popoverSupported && (cameraPicker.pickerPopoverController != nil)) {
        [cameraPicker.pickerPopoverController dismissPopoverAnimated:YES];
        cameraPicker.pickerPopoverController.delegate = nil;
        cameraPicker.pickerPopoverController = nil;
        invoke();
    } else {
        [[cameraPicker presentingViewController] dismissViewControllerAnimated:YES completion:invoke];
    }
}

// older api calls newer didFinishPickingMediaWithInfo
- (void)imagePickerController:(UIImagePickerController*)picker didFinishPickingImage:(UIImage*)image editingInfo:(NSDictionary*)editingInfo
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
        if (picker.sourceType == UIImagePickerControllerSourceTypeCamera && [AVCaptureDevice authorizationStatusForMediaType:AVMediaTypeVideo] != ALAuthorizationStatusAuthorized) {
            result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"has no access to camera"];
        } else if (picker.sourceType != UIImagePickerControllerSourceTypeCamera && [ALAssetsLibrary authorizationStatus] != ALAuthorizationStatusAuthorized) {
            result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"has no access to assets"];
        } else {
            result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"no image selected"];
        }

        
        [weakSelf.commandDelegate sendPluginResult:result callbackId:cameraPicker.callbackId];
        
        weakSelf.hasPendingOperation = NO;
        weakSelf.pickerController = nil;
    };

    [[cameraPicker presentingViewController] dismissViewControllerAnimated:YES completion:invoke];
}

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

- (void)locationManager:(CLLocationManager*)manager didUpdateToLocation:(CLLocation*)newLocation fromLocation:(CLLocation*)oldLocation
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
    
    NSMutableDictionary* mutableMetadata = [self.metadata mutableCopy];
    
    [mutableMetadata setObject:GPSDictionary forKey:(NSString *)kCGImagePropertyGPSDictionary];
    
    __weak CDVCamera* weakSelf = self;
    [self
     processImage:self.image
     metadata:self.metadata
     options:self.pickerController.pictureOptions
     resultBlock:^(UIImage *resultImage, NSDictionary *resultMetadata, NSURL *resultURL) {
         CDVPluginResult* result;
         result = [weakSelf
                   resultForImage:resultImage
                   metadata:resultMetadata
                   url:resultURL
                   options:weakSelf.pickerController.pictureOptions];
         [weakSelf sendResult:result];
     } failureBlock:^(NSString *error) {
         CDVPluginResult* result;
         result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:error];
         [weakSelf sendResult:result];
     }];
}

- (void)locationManager:(CLLocationManager*)manager didFailWithError:(NSError*)error
{
    if (locationManager == nil) {
        return;
    }

    [self.locationManager stopUpdatingLocation];
    self.locationManager = nil;
    
    __weak CDVCamera* weakSelf = self;
    [self
     processImage:self.image
     metadata:self.metadata
     options:self.pickerController.pictureOptions
     resultBlock:^(UIImage *resultImage, NSDictionary *resultMetadata, NSURL *resultURL) {
         CDVPluginResult* result;
         result = [weakSelf
                   resultForImage:resultImage
                   metadata:resultMetadata
                   url:resultURL
                   options:weakSelf.pickerController.pictureOptions];
         [weakSelf sendResult:result];
     } failureBlock:^(NSString *error) {
         CDVPluginResult* result;
         result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:error];
         [weakSelf sendResult:result];
     }];
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

+ (instancetype) createFromPictureOptions:(CDVPictureOptions*)pictureOptions;
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