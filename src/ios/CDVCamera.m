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
#import <Cordova/NSArray+Comparisons.h>
#import <Cordova/NSData+Base64.h>
#import <Cordova/NSDictionary+Extensions.h>
#import <ImageIO/CGImageProperties.h>
#import <AssetsLibrary/ALAssetRepresentation.h>
#import <AssetsLibrary/AssetsLibrary.h>
#import <ImageIO/CGImageSource.h>
#import <ImageIO/CGImageProperties.h>
#import <ImageIO/CGImageDestination.h>
#import <MobileCoreServices/UTCoreTypes.h>
#import <objc/message.h>

#define CDV_PHOTO_PREFIX @"cdv_photo_"

static NSSet* org_apache_cordova_validArrowDirections;

static NSString* toBase64(NSData* data) {
    SEL s1 = NSSelectorFromString(@"cdv_base64EncodedString");
    SEL s2 = NSSelectorFromString(@"base64EncodedString");
    SEL realSel = [data respondsToSelector:s1] ? s1 : s2;
    NSString* (*func)(id, SEL) = (void *)[data methodForSelector:realSel];
    return func(data, realSel);
}

@implementation CDVPictureOptions

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
    pictureOptions.saveToPhotoAlbum = [[command argumentAtIndex:9 withDefault:@(NO)] boolValue];
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
        pictureOptions.popoverSupported = [self popoverSupported];
        pictureOptions.usesGeolocation = [self usesGeolocation];
        pictureOptions.cropToSize = NO;
        
        BOOL hasCamera = [UIImagePickerController isSourceTypeAvailable:pictureOptions.sourceType];
        if (!hasCamera) {
            NSLog(@"Camera.getPicture: source type %lu not available.", (unsigned long)pictureOptions.sourceType);
            CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"No camera available"];
            [weakSelf.commandDelegate sendPluginResult:result callbackId:command.callbackId];
            return;
        }
        
        // If a popover is already open, close it; we only want one at a time.
        if (([[weakSelf pickerController] pickerPopoverController] != nil) && [[[weakSelf pickerController] pickerPopoverController] isPopoverVisible]) {
            [[[weakSelf pickerController] pickerPopoverController] dismissPopoverAnimated:YES];
            [[[weakSelf pickerController] pickerPopoverController] setDelegate:nil];
            [[weakSelf pickerController] setPickerPopoverController:nil];
        }
        
        CDVCameraPicker* cameraPicker = [CDVCameraPicker createFromPictureOptions:pictureOptions];
        weakSelf.pickerController = cameraPicker;
        
        cameraPicker.delegate = weakSelf;
        cameraPicker.callbackId = command.callbackId;
        // we need to capture this state for memory warnings that dealloc this object
        cameraPicker.webView = weakSelf.webView;
        
        if ([weakSelf popoverSupported] && (pictureOptions.sourceType != UIImagePickerControllerSourceTypeCamera)) {
            if (cameraPicker.pickerPopoverController == nil) {
                cameraPicker.pickerPopoverController = [[NSClassFromString(@"UIPopoverController") alloc] initWithContentViewController:cameraPicker];
            }
            [weakSelf displayPopover:pictureOptions.popoverOptions];
            weakSelf.hasPendingOperation = NO;

        } else {
            dispatch_async(dispatch_get_main_queue(), ^{
                [weakSelf.viewController presentViewController:cameraPicker animated:YES completion:^{
                    weakSelf.hasPendingOperation = NO;
                }];
            });
        }
    }];
}

- (void)repositionPopover:(CDVInvokedUrlCommand*)command
{
    NSDictionary* options = [command argumentAtIndex:0 withDefault:nil];

    [self displayPopover:options];
}

- (NSInteger)integerValueForKey:(NSDictionary*)dict key:(NSString*)key defaultValue:(NSInteger)defaultValue
{
    NSInteger value = defaultValue;

    NSNumber* val = [self valueForKey:key];  // value is an NSNumber

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

- (NSData*)processImage:(UIImage*)image info:(NSDictionary*)info options:(CDVPictureOptions*)options
{
    NSData* data = nil;
    
    switch (options.encodingType) {
        case EncodingTypePNG:
            data = UIImagePNGRepresentation(image);
            break;
        case EncodingTypeJPEG:
        {
            if ((options.allowsEditing == NO) && (options.targetSize.width <= 0) && (options.targetSize.height <= 0) && (options.correctOrientation == NO)){
                // use image unedited as requested , don't resize
                data = UIImageJPEGRepresentation(image, 1.0);
            } else {
                if (options.usesGeolocation) {
                    NSDictionary* controllerMetadata = [info objectForKey:@"UIImagePickerControllerMediaMetadata"];
                    if (controllerMetadata) {
                        self.data = data;
                        self.metadata = [[NSMutableDictionary alloc] init];
                        
                        NSMutableDictionary* EXIFDictionary = [[controllerMetadata objectForKey:(NSString*)kCGImagePropertyExifDictionary]mutableCopy];
                        if (EXIFDictionary)	{
                            [self.metadata setObject:EXIFDictionary forKey:(NSString*)kCGImagePropertyExifDictionary];
                        }
                        
                        if (IsAtLeastiOSVersion(@"8.0")) {
                            [[self locationManager] performSelector:NSSelectorFromString(@"requestWhenInUseAuthorization") withObject:nil afterDelay:0];
                        }
                        [[self locationManager] startUpdatingLocation];
                    }
                } else {
                    data = UIImageJPEGRepresentation(image, [options.quality floatValue] / 100.0f);
                }
            }
        }
            break;
        default:
            break;
    };
    
    return data;
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

- (CDVPluginResult*)resultForImage:(CDVPictureOptions*)options info:(NSDictionary*)info
{
    CDVPluginResult* result = nil;
    BOOL saveToPhotoAlbum = options.saveToPhotoAlbum;
    UIImage* image = nil;

    switch (options.destinationType) {
        case DestinationTypeNativeUri:
        {
            NSURL* url = (NSURL*)[info objectForKey:UIImagePickerControllerReferenceURL];
            NSString* nativeUri = [[self urlTransformer:url] absoluteString];
            result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:nativeUri];
            saveToPhotoAlbum = NO;
        }
            break;
        case DestinationTypeFileUri:
        {
            image = [self retrieveImage:info options:options];
            NSData* data = [self processImage:image info:info options:options];
            if (data) {
                
                NSString* extension = options.encodingType == EncodingTypePNG? @"png" : @"jpg";
                NSString* filePath = [self tempFilePath:extension];
                NSError* err = nil;
                
                // save file
                if (![data writeToFile:filePath options:NSAtomicWrite error:&err]) {
                    result = [CDVPluginResult resultWithStatus:CDVCommandStatus_IO_EXCEPTION messageAsString:[err localizedDescription]];
                } else {
                    result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:[[self urlTransformer:[NSURL fileURLWithPath:filePath]] absoluteString]];
                }
            }
        }
            break;
        case DestinationTypeDataUrl:
        {
            image = [self retrieveImage:info options:options];
            NSData* data = [self processImage:image info:info options:options];
            
            if (data)  {
                result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:toBase64(data)];
            }
        }
            break;
        default:
            break;
    };
    
    if (saveToPhotoAlbum && image) {
        ALAssetsLibrary* library = [ALAssetsLibrary new];
        [library writeImageToSavedPhotosAlbum:image.CGImage orientation:(ALAssetOrientation)(image.imageOrientation) completionBlock:nil];
    }
    
    return result;
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
            result = [self resultForImage:cameraPicker.pictureOptions info:info];
        }
        else {
            result = [self resultForVideo:info];
        }
        
        if (result) {
            [weakSelf.commandDelegate sendPluginResult:result callbackId:cameraPicker.callbackId];
            weakSelf.hasPendingOperation = NO;
            weakSelf.pickerController = nil;
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
        if ([ALAssetsLibrary authorizationStatus] == ALAuthorizationStatusAuthorized) {
            result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"no image selected"];
        } else {
            result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"has no access to assets"];
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
    
    [self.metadata setObject:GPSDictionary forKey:(NSString *)kCGImagePropertyGPSDictionary];
    [self imagePickerControllerReturnImageResult];
}

- (void)locationManager:(CLLocationManager*)manager didFailWithError:(NSError*)error
{
    if (locationManager == nil) {
        return;
    }

    [self.locationManager stopUpdatingLocation];
    self.locationManager = nil;
    
    [self imagePickerControllerReturnImageResult];
}

- (void)imagePickerControllerReturnImageResult
{
    CDVPictureOptions* options = self.pickerController.pictureOptions;
    CDVPluginResult* result = nil;
    
    if (self.metadata) {
        CGImageSourceRef sourceImage = CGImageSourceCreateWithData((__bridge CFDataRef)self.data, NULL);
        CFStringRef sourceType = CGImageSourceGetType(sourceImage);
        
        CGImageDestinationRef destinationImage = CGImageDestinationCreateWithData((__bridge CFMutableDataRef)self.data, sourceType, 1, NULL);
        CGImageDestinationAddImageFromSource(destinationImage, sourceImage, 0, (__bridge CFDictionaryRef)self.metadata);
        CGImageDestinationFinalize(destinationImage);
        
        CFRelease(sourceImage);
        CFRelease(destinationImage);
    }
    
    switch (options.destinationType) {
        case DestinationTypeFileUri:
        {
            NSError* err = nil;
            NSString* extension = self.pickerController.pictureOptions.encodingType == EncodingTypePNG ? @"png":@"jpg";
            NSString* filePath = [self tempFilePath:extension];
            
            // save file
            if (![self.data writeToFile:filePath options:NSAtomicWrite error:&err]) {
                result = [CDVPluginResult resultWithStatus:CDVCommandStatus_IO_EXCEPTION messageAsString:[err localizedDescription]];
            }
            else {
                result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:[[self urlTransformer:[NSURL fileURLWithPath:filePath]] absoluteString]];
            }
        }
            break;
        case DestinationTypeDataUrl:
        {
            result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:toBase64(self.data)];
        }
            break;
        case DestinationTypeNativeUri:
        default:
            break;
    };
    
    if (result) {
        [self.commandDelegate sendPluginResult:result callbackId:self.pickerController.callbackId];
    }
    
    self.hasPendingOperation = NO;
    self.pickerController = nil;
    self.data = nil;
    self.metadata = nil;
    
    if (options.saveToPhotoAlbum) {
        ALAssetsLibrary *library = [ALAssetsLibrary new];
        [library writeImageDataToSavedPhotosAlbum:self.data metadata:self.metadata completionBlock:nil];
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
