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

#define CDV_PHOTO_PREFIX @"cdv_photo_"

static NSSet* org_apache_cordova_validArrowDirections;

@interface CDVCamera ()

@property (readwrite, assign) BOOL hasPendingOperation;

@end

@implementation CDVCamera

+ (void)initialize
{
    org_apache_cordova_validArrowDirections = [[NSSet alloc] initWithObjects:[NSNumber numberWithInt:UIPopoverArrowDirectionUp], [NSNumber numberWithInt:UIPopoverArrowDirectionDown], [NSNumber numberWithInt:UIPopoverArrowDirectionLeft], [NSNumber numberWithInt:UIPopoverArrowDirectionRight], [NSNumber numberWithInt:UIPopoverArrowDirectionAny], nil];
}

@synthesize hasPendingOperation, pickerController, locationManager;


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

/*  takePicture arguments:
 * INDEX   ARGUMENT
 *  0       quality
 *  1       destination type
 *  2       source type
 *  3       targetWidth
 *  4       targetHeight
 *  5       encodingType
 *  6       mediaType
 *  7       allowsEdit
 *  8       correctOrientation
 *  9       saveToPhotoAlbum
 *  10      popoverOptions
 *  11      cameraDirection
 */
- (void)takePicture:(CDVInvokedUrlCommand*)command
{
    NSString* callbackId = command.callbackId;
    NSArray* arguments = command.arguments;

    self.hasPendingOperation = YES;

    NSString* sourceTypeString = [arguments objectAtIndex:2];
    UIImagePickerControllerSourceType sourceType = UIImagePickerControllerSourceTypeCamera; // default
    if (sourceTypeString != nil) {
        sourceType = (UIImagePickerControllerSourceType)[sourceTypeString intValue];
    }

    bool hasCamera = [UIImagePickerController isSourceTypeAvailable:sourceType];
    if (!hasCamera) {
        NSLog(@"Camera.getPicture: source type %lu not available.", (unsigned long)sourceType);
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"no camera available"];
        [self.commandDelegate sendPluginResult:result callbackId:callbackId];
        return;
    }

    bool allowEdit = [[arguments objectAtIndex:7] boolValue];
    NSNumber* targetWidth = [arguments objectAtIndex:3];
    NSNumber* targetHeight = [arguments objectAtIndex:4];
    NSNumber* mediaValue = [arguments objectAtIndex:6];
    CDVMediaType mediaType = (mediaValue) ? [mediaValue intValue] : MediaTypePicture;

    CGSize targetSize = CGSizeMake(0, 0);
    if ((targetWidth != nil) && (targetHeight != nil)) {
        targetSize = CGSizeMake([targetWidth floatValue], [targetHeight floatValue]);
    }

    // If a popover is already open, close it; we only want one at a time.
    if (([[self pickerController] popoverController] != nil) && [[[self pickerController] popoverController] isPopoverVisible]) {
        [[[self pickerController] popoverController] dismissPopoverAnimated:YES];
        [[[self pickerController] popoverController] setDelegate:nil];
        [[self pickerController] setPopoverController:nil];
    }

    CDVCameraPicker* cameraPicker = [[CDVCameraPicker alloc] init];
    self.pickerController = cameraPicker;

    cameraPicker.delegate = self;
    cameraPicker.sourceType = sourceType;
    cameraPicker.allowsEditing = allowEdit; // THIS IS ALL IT TAKES FOR CROPPING - jm
    cameraPicker.callbackId = callbackId;
    cameraPicker.targetSize = targetSize;
    cameraPicker.cropToSize = NO;
    // we need to capture this state for memory warnings that dealloc this object
    cameraPicker.webView = self.webView;
    cameraPicker.popoverSupported = [self popoverSupported];
    cameraPicker.usesGeolocation = [self usesGeolocation];

    cameraPicker.correctOrientation = [[arguments objectAtIndex:8] boolValue];
    cameraPicker.saveToPhotoAlbum = [[arguments objectAtIndex:9] boolValue];

    cameraPicker.encodingType = ([arguments objectAtIndex:5]) ? [[arguments objectAtIndex:5] intValue] : EncodingTypeJPEG;

    cameraPicker.quality = ([arguments objectAtIndex:0]) ? [[arguments objectAtIndex:0] intValue] : 50;
    cameraPicker.returnType = ([arguments objectAtIndex:1]) ? [[arguments objectAtIndex:1] intValue] : DestinationTypeFileUri;

    if (sourceType == UIImagePickerControllerSourceTypeCamera) {
        // We only allow taking pictures (no video) in this API.
        cameraPicker.mediaTypes = [NSArray arrayWithObjects:(NSString*)kUTTypeImage, nil];

        // We can only set the camera device if we're actually using the camera.
        NSNumber* cameraDirection = [command argumentAtIndex:11 withDefault:[NSNumber numberWithInteger:UIImagePickerControllerCameraDeviceRear]];
        cameraPicker.cameraDevice = (UIImagePickerControllerCameraDevice)[cameraDirection intValue];
    } else if (mediaType == MediaTypeAll) {
        cameraPicker.mediaTypes = [UIImagePickerController availableMediaTypesForSourceType:sourceType];
    } else {
        NSArray* mediaArray = [NSArray arrayWithObjects:(NSString*)(mediaType == MediaTypeVideo ? kUTTypeMovie : kUTTypeImage), nil];
        cameraPicker.mediaTypes = mediaArray;
    }

    if ([self popoverSupported] && (sourceType != UIImagePickerControllerSourceTypeCamera)) {
        if (cameraPicker.popoverController == nil) {
            cameraPicker.popoverController = [[NSClassFromString(@"UIPopoverController")alloc] initWithContentViewController:cameraPicker];
        }
        NSDictionary* options = [command.arguments objectAtIndex:10 withDefault:nil];
        [self displayPopover:options];
    } else {
        [self.viewController presentViewController:cameraPicker animated:YES completion:nil];
    }
    self.hasPendingOperation = NO;
}

- (void)repositionPopover:(CDVInvokedUrlCommand*)command
{
    NSDictionary* options = [command.arguments objectAtIndex:0 withDefault:nil];

    [self displayPopover:options];
}

- (void)displayPopover:(NSDictionary*)options
{
    NSInteger x = 0;
    NSInteger y = 32;
    NSInteger width = 320;
    NSInteger height = 480;
    UIPopoverArrowDirection arrowDirection = UIPopoverArrowDirectionAny;

    if (options) {
        x = [options integerValueForKey:@"x" defaultValue:0];
        y = [options integerValueForKey:@"y" defaultValue:32];
        width = [options integerValueForKey:@"width" defaultValue:320];
        height = [options integerValueForKey:@"height" defaultValue:480];
        arrowDirection = [options integerValueForKey:@"arrowDir" defaultValue:UIPopoverArrowDirectionAny];
        if (![org_apache_cordova_validArrowDirections containsObject:[NSNumber numberWithUnsignedInteger:arrowDirection]]) {
            arrowDirection = UIPopoverArrowDirectionAny;
        }
    }

    [[[self pickerController] popoverController] setDelegate:self];
    [[[self pickerController] popoverController] presentPopoverFromRect:CGRectMake(x, y, width, height)
                                                                 inView:[self.webView superview]
                                               permittedArrowDirections:arrowDirection
                                                               animated:YES];
}

- (void)navigationController:(UINavigationController *)navigationController willShowViewController:(UIViewController *)viewController animated:(BOOL)animated
{
    if([navigationController isKindOfClass:[UIImagePickerController class]]){
        UIImagePickerController * cameraPicker = (UIImagePickerController*)navigationController;
        
        if(![cameraPicker.mediaTypes containsObject:(NSString*) kUTTypeImage]){
            [viewController.navigationItem setTitle:NSLocalizedString(@"Videos title", nil)];
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
    // [ self imagePickerControllerDidCancel:self.pickerController ];	'
    UIPopoverController* pc = (UIPopoverController*)popoverController;

    [pc dismissPopoverAnimated:YES];
    pc.delegate = nil;
    if (self.pickerController && self.pickerController.callbackId && self.pickerController.popoverController) {
        self.pickerController.popoverController = nil;
        NSString* callbackId = self.pickerController.callbackId;
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"no image selected"];   // error callback expects string ATM
        [self.commandDelegate sendPluginResult:result callbackId:callbackId];
    }
    self.hasPendingOperation = NO;
}

- (void)imagePickerController:(UIImagePickerController*)picker didFinishPickingMediaWithInfo:(NSDictionary*)info
{
    CDVCameraPicker* cameraPicker = (CDVCameraPicker*)picker;

    if (cameraPicker.popoverSupported && (cameraPicker.popoverController != nil)) {
        [cameraPicker.popoverController dismissPopoverAnimated:YES];
        cameraPicker.popoverController.delegate = nil;
        cameraPicker.popoverController = nil;
    } else {
        [[cameraPicker presentingViewController] dismissViewControllerAnimated:YES completion:nil];
    }

    CDVPluginResult* result = nil;

    NSString* mediaType = [info objectForKey:UIImagePickerControllerMediaType];
    // IMAGE TYPE
    if ([mediaType isEqualToString:(NSString*)kUTTypeImage]) {
        if (cameraPicker.returnType == DestinationTypeNativeUri) {
            NSString* nativeUri = [(NSURL*)[info objectForKey:UIImagePickerControllerReferenceURL] absoluteString];
            result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:nativeUri];
        } else {
            // get the image
            UIImage* image = nil;
            if (cameraPicker.allowsEditing && [info objectForKey:UIImagePickerControllerEditedImage]) {
                image = [info objectForKey:UIImagePickerControllerEditedImage];
            } else {
                image = [info objectForKey:UIImagePickerControllerOriginalImage];
            }

            if (cameraPicker.correctOrientation) {
                image = [self imageCorrectedForCaptureOrientation:image];
            }

            UIImage* scaledImage = nil;

            if ((cameraPicker.targetSize.width > 0) && (cameraPicker.targetSize.height > 0)) {
                // if cropToSize, resize image and crop to target size, otherwise resize to fit target without cropping
                if (cameraPicker.cropToSize) {
                    scaledImage = [self imageByScalingAndCroppingForSize:image toSize:cameraPicker.targetSize];
                } else {
                    scaledImage = [self imageByScalingNotCroppingForSize:image toSize:cameraPicker.targetSize];
                }
            }

            NSData* data = nil;
            // returnedImage is the image that is returned to caller and (optionally) saved to photo album
            UIImage* returnedImage = (scaledImage == nil ? image : scaledImage);

            if (cameraPicker.encodingType == EncodingTypePNG) {
                data = UIImagePNGRepresentation(returnedImage);
            } else if ((cameraPicker.allowsEditing==false) && (cameraPicker.targetSize.width <= 0) && (cameraPicker.targetSize.height <= 0) && (cameraPicker.correctOrientation==false)){
                // use image unedited as requested , don't resize
                data = UIImageJPEGRepresentation(returnedImage, 1.0);
            } else {
                data = UIImageJPEGRepresentation(returnedImage, cameraPicker.quality / 100.0f);
                
                if (cameraPicker.usesGeolocation) {
                    NSDictionary *controllerMetadata = [info objectForKey:@"UIImagePickerControllerMediaMetadata"];
                    if (controllerMetadata) {
                        self.data = data;
                        self.metadata = [[NSMutableDictionary alloc] init];
                        
                        NSMutableDictionary *EXIFDictionary = [[controllerMetadata objectForKey:(NSString *)kCGImagePropertyExifDictionary]mutableCopy];
                        if (EXIFDictionary)	[self.metadata setObject:EXIFDictionary forKey:(NSString *)kCGImagePropertyExifDictionary];
                        
                        if (IsAtLeastiOSVersion(@"8.0")) {
                            [[self locationManager] performSelector:NSSelectorFromString(@"requestWhenInUseAuthorization") withObject:nil afterDelay:0];
                        }
                        [[self locationManager] startUpdatingLocation];
                        return;
                    }
                }
            }
            
            if (cameraPicker.saveToPhotoAlbum) {
                ALAssetsLibrary *library = [ALAssetsLibrary new];
                [library writeImageToSavedPhotosAlbum:returnedImage.CGImage orientation:(ALAssetOrientation)(returnedImage.imageOrientation) completionBlock:nil];
            }

            if (cameraPicker.returnType == DestinationTypeFileUri) {
                // write to temp directory and return URI
                // get the temp directory path
                NSString* docsPath = [NSTemporaryDirectory()stringByStandardizingPath];
                NSError* err = nil;
                NSFileManager* fileMgr = [[NSFileManager alloc] init]; // recommended by apple (vs [NSFileManager defaultManager]) to be threadsafe
                // generate unique file name
                NSString* filePath;

                int i = 1;
                do {
                    filePath = [NSString stringWithFormat:@"%@/%@%03d.%@", docsPath, CDV_PHOTO_PREFIX, i++, cameraPicker.encodingType == EncodingTypePNG ? @"png":@"jpg"];
                } while ([fileMgr fileExistsAtPath:filePath]);

                // save file
                if (![data writeToFile:filePath options:NSAtomicWrite error:&err]) {
                    result = [CDVPluginResult resultWithStatus:CDVCommandStatus_IO_EXCEPTION messageAsString:[err localizedDescription]];
                } else {
                    result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:[[NSURL fileURLWithPath:filePath] absoluteString]];
                }
            } else {
                result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:[data base64EncodedString]];
            }
        }
    }
    // NOT IMAGE TYPE (MOVIE)
    else {
        NSString* moviePath = [[info objectForKey:UIImagePickerControllerMediaURL] absoluteString];
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:moviePath];
    }

    if (result) {
        [self.commandDelegate sendPluginResult:result callbackId:cameraPicker.callbackId];
    }

    self.hasPendingOperation = NO;
    self.pickerController = nil;
}

// older api calls newer didFinishPickingMediaWithInfo
- (void)imagePickerController:(UIImagePickerController*)picker didFinishPickingImage:(UIImage*)image editingInfo:(NSDictionary*)editingInfo
{
    NSDictionary* imageInfo = [NSDictionary dictionaryWithObject:image forKey:UIImagePickerControllerOriginalImage];

    [self imagePickerController:picker didFinishPickingMediaWithInfo:imageInfo];
}

- (void)imagePickerControllerDidCancel:(UIImagePickerController*)picker
{
    CDVCameraPicker* cameraPicker = (CDVCameraPicker*)picker;

    [[cameraPicker presentingViewController] dismissViewControllerAnimated:YES completion:nil];

    CDVPluginResult* result;
    if ([ALAssetsLibrary authorizationStatus] == ALAuthorizationStatusAuthorized) {
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"no image selected"];   // error callback expects string ATM
    } else {
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"has no access to assets"];   // error callback expects string ATM
    }
    
    [self.commandDelegate sendPluginResult:result callbackId:cameraPicker.callbackId];

    self.hasPendingOperation = NO;
    self.pickerController = nil;
}

- (UIImage*)imageByScalingAndCroppingForSize:(UIImage*)anImage toSize:(CGSize)targetSize
{
    UIImage* sourceImage = anImage;
    UIImage* newImage = nil;
    CGSize imageSize = sourceImage.size;
    CGFloat width = imageSize.width;
    CGFloat height = imageSize.height;
    CGFloat targetWidth = targetSize.width;
    CGFloat targetHeight = targetSize.height;
    CGFloat scaleFactor = 0.0;
    CGFloat scaledWidth = targetWidth;
    CGFloat scaledHeight = targetHeight;
    CGPoint thumbnailPoint = CGPointMake(0.0, 0.0);

    if (CGSizeEqualToSize(imageSize, targetSize) == NO) {
        CGFloat widthFactor = targetWidth / width;
        CGFloat heightFactor = targetHeight / height;

        if (widthFactor > heightFactor) {
            scaleFactor = widthFactor; // scale to fit height
        } else {
            scaleFactor = heightFactor; // scale to fit width
        }
        scaledWidth = width * scaleFactor;
        scaledHeight = height * scaleFactor;

        // center the image
        if (widthFactor > heightFactor) {
            thumbnailPoint.y = (targetHeight - scaledHeight) * 0.5;
        } else if (widthFactor < heightFactor) {
            thumbnailPoint.x = (targetWidth - scaledWidth) * 0.5;
        }
    }

    UIGraphicsBeginImageContext(targetSize); // this will crop

    CGRect thumbnailRect = CGRectZero;
    thumbnailRect.origin = thumbnailPoint;
    thumbnailRect.size.width = scaledWidth;
    thumbnailRect.size.height = scaledHeight;

    [sourceImage drawInRect:thumbnailRect];

    newImage = UIGraphicsGetImageFromCurrentImageContext();
    if (newImage == nil) {
        NSLog(@"could not scale image");
    }

    // pop the context to get back to the default
    UIGraphicsEndImageContext();
    return newImage;
}

- (UIImage*)imageCorrectedForCaptureOrientation:(UIImage*)anImage
{
    float rotation_radians = 0;
    bool perpendicular = false;

    switch ([anImage imageOrientation]) {
        case UIImageOrientationUp :
            rotation_radians = 0.0;
            break;

        case UIImageOrientationDown:
            rotation_radians = M_PI; // don't be scared of radians, if you're reading this, you're good at math
            break;

        case UIImageOrientationRight:
            rotation_radians = M_PI_2;
            perpendicular = true;
            break;

        case UIImageOrientationLeft:
            rotation_radians = -M_PI_2;
            perpendicular = true;
            break;

        default:
            break;
    }

    UIGraphicsBeginImageContext(CGSizeMake(anImage.size.width, anImage.size.height));
    CGContextRef context = UIGraphicsGetCurrentContext();

    // Rotate around the center point
    CGContextTranslateCTM(context, anImage.size.width / 2, anImage.size.height / 2);
    CGContextRotateCTM(context, rotation_radians);

    CGContextScaleCTM(context, 1.0, -1.0);
    float width = perpendicular ? anImage.size.height : anImage.size.width;
    float height = perpendicular ? anImage.size.width : anImage.size.height;
    CGContextDrawImage(context, CGRectMake(-width / 2, -height / 2, width, height), [anImage CGImage]);

    // Move the origin back since the rotation might've change it (if its 90 degrees)
    if (perpendicular) {
        CGContextTranslateCTM(context, -anImage.size.height / 2, -anImage.size.width / 2);
    }

    UIImage* newImage = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();
    return newImage;
}

- (UIImage*)imageByScalingNotCroppingForSize:(UIImage*)anImage toSize:(CGSize)frameSize
{
    UIImage* sourceImage = anImage;
    UIImage* newImage = nil;
    CGSize imageSize = sourceImage.size;
    CGFloat width = imageSize.width;
    CGFloat height = imageSize.height;
    CGFloat targetWidth = frameSize.width;
    CGFloat targetHeight = frameSize.height;
    CGFloat scaleFactor = 0.0;
    CGSize scaledSize = frameSize;

    if (CGSizeEqualToSize(imageSize, frameSize) == NO) {
        CGFloat widthFactor = targetWidth / width;
        CGFloat heightFactor = targetHeight / height;

        // opposite comparison to imageByScalingAndCroppingForSize in order to contain the image within the given bounds
        if (widthFactor > heightFactor) {
            scaleFactor = heightFactor; // scale to fit height
        } else {
            scaleFactor = widthFactor; // scale to fit width
        }
        scaledSize = CGSizeMake(MIN(width * scaleFactor, targetWidth), MIN(height * scaleFactor, targetHeight));
    }

    // If the pixels are floats, it causes a white line in iOS8 and probably other versions too
    scaledSize.width = (int)scaledSize.width;
    scaledSize.height = (int)scaledSize.height;
    
    UIGraphicsBeginImageContext(scaledSize); // this will resize

    [sourceImage drawInRect:CGRectMake(0, 0, scaledSize.width, scaledSize.height)];

    newImage = UIGraphicsGetImageFromCurrentImageContext();
    if (newImage == nil) {
        NSLog(@"could not scale image");
    }

    // pop the context to get back to the default
    UIGraphicsEndImageContext();
    return newImage;
}

- (CLLocationManager *)locationManager {
    
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
	if (locationManager != nil) {
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
}

- (void)locationManager:(CLLocationManager *)manager didFailWithError:(NSError *)error {
	if (locationManager != nil) {
		[self.locationManager stopUpdatingLocation];
		self.locationManager = nil;
        
		[self imagePickerControllerReturnImageResult];
	}
}

- (void)imagePickerControllerReturnImageResult
{
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
    
    if (self.pickerController.saveToPhotoAlbum) {
        ALAssetsLibrary *library = [ALAssetsLibrary new];
        [library writeImageDataToSavedPhotosAlbum:self.data metadata:self.metadata completionBlock:nil];
    }
    
    if (self.pickerController.returnType == DestinationTypeFileUri) {
        // write to temp directory and return URI
        // get the temp directory path
        NSString* docsPath = [NSTemporaryDirectory()stringByStandardizingPath];
        NSError* err = nil;
        NSFileManager* fileMgr = [[NSFileManager alloc] init]; // recommended by apple (vs [NSFileManager defaultManager]) to be threadsafe
        // generate unique file name
        NSString* filePath;
        
        int i = 1;
        do {
            filePath = [NSString stringWithFormat:@"%@/%@%03d.%@", docsPath, CDV_PHOTO_PREFIX, i++, self.pickerController.encodingType == EncodingTypePNG ? @"png":@"jpg"];
        } while ([fileMgr fileExistsAtPath:filePath]);
        
        // save file
        if (![self.data writeToFile:filePath options:NSAtomicWrite error:&err]) {
            result = [CDVPluginResult resultWithStatus:CDVCommandStatus_IO_EXCEPTION messageAsString:[err localizedDescription]];
        }
        else {
            result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:[[NSURL fileURLWithPath:filePath] absoluteString]];
        }
    }
    else {
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:[self.data base64EncodedString]];
    }
    if (result) {
        [self.commandDelegate sendPluginResult:result callbackId:self.pickerController.callbackId];
    }
    
    if (result) {
        [self.commandDelegate sendPluginResult:result callbackId:self.pickerController.callbackId];
    }
    
    self.hasPendingOperation = NO;
    self.pickerController = nil;
    self.data = nil;
    self.metadata = nil;
}

@end

@implementation CDVCameraPicker

@synthesize quality, postUrl;
@synthesize returnType;
@synthesize callbackId;
@synthesize popoverController;
@synthesize targetSize;
@synthesize correctOrientation;
@synthesize saveToPhotoAlbum;
@synthesize encodingType;
@synthesize cropToSize;
@synthesize webView;
@synthesize popoverSupported;

- (BOOL)prefersStatusBarHidden {
    return YES;
}

- (UIViewController*)childViewControllerForStatusBarHidden {
    return nil;
}
    
- (void)viewWillAppear:(BOOL)animated {
    SEL sel = NSSelectorFromString(@"setNeedsStatusBarAppearanceUpdate");
    if ([self respondsToSelector:sel]) {
        [self performSelector:sel withObject:nil afterDelay:0];
    }
    
    [super viewWillAppear:animated];
}

@end
