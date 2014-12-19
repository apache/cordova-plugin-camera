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

#import <UIKit/UIKit.h>
#import <XCTest/XCTest.h>
#import "CDVCamera.h"
#import "UIImage+CropScaleOrientation.h"
#import <Cordova/NSArray+Comparisons.h>
#import <Cordova/NSData+Base64.h>
#import <Cordova/NSDictionary+Extensions.h>
#import <MobileCoreServices/UTCoreTypes.h>


@interface CameraTest : XCTestCase

@property (nonatomic, strong) CDVCamera* plugin;

@end

@interface CDVCamera ()

// expose private interface
- (NSData*)processImage:(UIImage*)image info:(NSDictionary*)info options:(CDVPictureOptions*)options;
- (UIImage*)retrieveImage:(NSDictionary*)info options:(CDVPictureOptions*)options;
- (CDVPluginResult*)resultForImage:(CDVPictureOptions*)options info:(NSDictionary*)info;
- (CDVPluginResult*)resultForVideo:(NSDictionary*)info;

@end

@implementation CameraTest

- (void)setUp {
    [super setUp];
    // Put setup code here. This method is called before the invocation of each test method in the class.
    
    self.plugin = [[CDVCamera alloc] init];
}

- (void)tearDown {
    // Put teardown code here. This method is called after the invocation of each test method in the class.
    [super tearDown];
}

- (void) testPictureOptionsCreate
{
    NSArray* args;
    CDVPictureOptions* options;
    NSDictionary* popoverOptions;
    
    // No arguments, check whether the defaults are set
    args = @[];
    options = [CDVPictureOptions createFromTakePictureArguments:args];
    
    XCTAssertEqual(options.quality, @(50));
    XCTAssertEqual(options.destinationType, (int)DestinationTypeFileUri);
    XCTAssertEqual(options.sourceType, (int)UIImagePickerControllerSourceTypeCamera);
    XCTAssertEqual(options.targetSize.width, 0);
    XCTAssertEqual(options.targetSize.height, 0);
    XCTAssertEqual(options.encodingType, (int)EncodingTypeJPEG);
    XCTAssertEqual(options.mediaType, (int)MediaTypePicture);
    XCTAssertEqual(options.allowsEditing, NO);
    XCTAssertEqual(options.correctOrientation, NO);
    XCTAssertEqual(options.saveToPhotoAlbum, NO);
    XCTAssertEqualObjects(options.popoverOptions, nil);
    XCTAssertEqual(options.cameraDirection, (int)UIImagePickerControllerCameraDeviceRear);
    XCTAssertEqual(options.popoverSupported, NO);
    XCTAssertEqual(options.usesGeolocation, NO);
    
    // Set each argument, check whether they are set. different from defaults
    popoverOptions = @{ @"x" : @1, @"y" : @2, @"width" : @3, @"height" : @4 };
    
    args = @[
             @(49),
             @(DestinationTypeDataUrl),
             @(UIImagePickerControllerSourceTypePhotoLibrary),
             @(120),
             @(240),
             @(EncodingTypePNG),
             @(MediaTypeVideo),
             @YES,
             @YES,
             @YES,
             popoverOptions,
             @(UIImagePickerControllerCameraDeviceFront),
             ];
    options = [CDVPictureOptions createFromTakePictureArguments:args];
    
    XCTAssertEqual(options.quality, @(49));
    XCTAssertEqual(options.destinationType, (int)DestinationTypeDataUrl);
    XCTAssertEqual(options.sourceType, (int)UIImagePickerControllerSourceTypePhotoLibrary);
    XCTAssertEqual(options.targetSize.width, 120);
    XCTAssertEqual(options.targetSize.height, 240);
    XCTAssertEqual(options.encodingType, (int)EncodingTypePNG);
    XCTAssertEqual(options.mediaType, (int)MediaTypeVideo);
    XCTAssertEqual(options.allowsEditing, YES);
    XCTAssertEqual(options.correctOrientation, YES);
    XCTAssertEqual(options.saveToPhotoAlbum, YES);
    XCTAssertEqualObjects(options.popoverOptions, popoverOptions);
    XCTAssertEqual(options.cameraDirection, (int)UIImagePickerControllerCameraDeviceFront);
    XCTAssertEqual(options.popoverSupported, NO);
    XCTAssertEqual(options.usesGeolocation, NO);
}

- (void) testCameraPickerCreate
{
    NSDictionary* popoverOptions;
    NSArray* args;
    CDVPictureOptions* pictureOptions;
    CDVCameraPicker* picker;
    
    // Souce is Camera, and image type
    
    popoverOptions = @{ @"x" : @1, @"y" : @2, @"width" : @3, @"height" : @4 };
    args = @[
             @(49),
             @(DestinationTypeDataUrl),
             @(UIImagePickerControllerSourceTypeCamera),
             @(120),
             @(240),
             @(EncodingTypePNG),
             @(MediaTypeAll),
             @YES,
             @YES,
             @YES,
             popoverOptions,
             @(UIImagePickerControllerCameraDeviceFront),
             ];
    pictureOptions = [CDVPictureOptions createFromTakePictureArguments:args];
    
    if ([UIImagePickerController isSourceTypeAvailable:pictureOptions.sourceType]) {
        picker = [CDVCameraPicker createFromPictureOptions:pictureOptions];
        
        XCTAssertEqualObjects(picker.pictureOptions, pictureOptions);

        XCTAssertEqual(picker.sourceType, pictureOptions.sourceType);
        XCTAssertEqual(picker.allowsEditing, pictureOptions.allowsEditing);
        XCTAssertEqualObjects(picker.mediaTypes, @[(NSString*)kUTTypeImage]);
        XCTAssertEqual(picker.cameraDevice, pictureOptions.cameraDirection);
    }

    // Souce is not Camera, and all media types

    args = @[
          @(49),
          @(DestinationTypeDataUrl),
          @(UIImagePickerControllerSourceTypePhotoLibrary),
          @(120),
          @(240),
          @(EncodingTypePNG),
          @(MediaTypeAll),
          @YES,
          @YES,
          @YES,
          popoverOptions,
          @(UIImagePickerControllerCameraDeviceFront),
          ];
    pictureOptions = [CDVPictureOptions createFromTakePictureArguments:args];

    if ([UIImagePickerController isSourceTypeAvailable:pictureOptions.sourceType]) {
        picker = [CDVCameraPicker createFromPictureOptions:pictureOptions];

         XCTAssertEqualObjects(picker.pictureOptions, pictureOptions);
         
         XCTAssertEqual(picker.sourceType, pictureOptions.sourceType);
         XCTAssertEqual(picker.allowsEditing, pictureOptions.allowsEditing);
         XCTAssertEqualObjects(picker.mediaTypes, [UIImagePickerController availableMediaTypesForSourceType:picker.sourceType]);
    }
    
    // Souce is not Camera, and either Image or Movie media type

    args = @[
             @(49),
             @(DestinationTypeDataUrl),
             @(UIImagePickerControllerSourceTypePhotoLibrary),
             @(120),
             @(240),
             @(EncodingTypePNG),
             @(MediaTypeVideo),
             @YES,
             @YES,
             @YES,
             popoverOptions,
             @(UIImagePickerControllerCameraDeviceFront),
             ];
    pictureOptions = [CDVPictureOptions createFromTakePictureArguments:args];
    
    if ([UIImagePickerController isSourceTypeAvailable:pictureOptions.sourceType]) {
        picker = [CDVCameraPicker createFromPictureOptions:pictureOptions];
        
        XCTAssertEqualObjects(picker.pictureOptions, pictureOptions);
        
        XCTAssertEqual(picker.sourceType, pictureOptions.sourceType);
        XCTAssertEqual(picker.allowsEditing, pictureOptions.allowsEditing);
        XCTAssertEqualObjects(picker.mediaTypes, @[(NSString*)kUTTypeMovie]);
    }
}

- (UIImage*) createImage:(CGRect)rect orientation:(UIImageOrientation)imageOrientation {
    UIGraphicsBeginImageContext(rect.size);
    CGContextRef context = UIGraphicsGetCurrentContext();
    
    CGContextSetFillColorWithColor(context, [[UIColor greenColor] CGColor]);
    CGContextFillRect(context, rect);
    
    CGImageRef result = CGBitmapContextCreateImage(UIGraphicsGetCurrentContext());
    UIImage* image = [UIImage imageWithCGImage:result scale:1.0f orientation:imageOrientation];
    
    UIGraphicsEndImageContext();
    
    return image;
}

- (void) testImageScaleCropForSize {
    
    UIImage *sourceImagePortrait, *sourceImageLandscape, *targetImage;
    CGSize targetSize = CGSizeZero;
    
    sourceImagePortrait = [self createImage:CGRectMake(0, 0, 2448, 3264) orientation:UIImageOrientationUp];
    sourceImageLandscape = [self createImage:CGRectMake(0, 0, 3264, 2448) orientation:UIImageOrientationUp];
    
    // test 640x480
    
    targetSize = CGSizeMake(640, 480);

    targetImage = [sourceImagePortrait imageByScalingAndCroppingForSize:targetSize];
    XCTAssertEqual(targetImage.size.width, targetSize.width);
    XCTAssertEqual(targetImage.size.height, targetSize.height);

    targetImage = [sourceImageLandscape imageByScalingAndCroppingForSize:targetSize];
    XCTAssertEqual(targetImage.size.width, targetSize.width);
    XCTAssertEqual(targetImage.size.height, targetSize.height);


    // test 800x600
    
    targetSize = CGSizeMake(800, 600);
    
    targetImage = [sourceImagePortrait imageByScalingAndCroppingForSize:targetSize];
    XCTAssertEqual(targetImage.size.width, targetSize.width);
    XCTAssertEqual(targetImage.size.height, targetSize.height);
    
    targetImage = [sourceImageLandscape imageByScalingAndCroppingForSize:targetSize];
    XCTAssertEqual(targetImage.size.width, targetSize.width);
    XCTAssertEqual(targetImage.size.height, targetSize.height);
    
    // test 1024x768
    
    targetSize = CGSizeMake(1024, 768);
    
    targetImage = [sourceImagePortrait imageByScalingAndCroppingForSize:targetSize];
    XCTAssertEqual(targetImage.size.width, targetSize.width);
    XCTAssertEqual(targetImage.size.height, targetSize.height);

    targetImage = [sourceImageLandscape imageByScalingAndCroppingForSize:targetSize];
    XCTAssertEqual(targetImage.size.width, targetSize.width);
    XCTAssertEqual(targetImage.size.height, targetSize.height);
}

- (void) testImageScaleNoCropForSize {
    UIImage *sourceImagePortrait, *sourceImageLandscape, *targetImage;
    CGSize targetSize = CGSizeZero;
    
    sourceImagePortrait = [self createImage:CGRectMake(0, 0, 2448, 3264) orientation:UIImageOrientationUp];
    sourceImageLandscape = [self createImage:CGRectMake(0, 0, 3264, 2448) orientation:UIImageOrientationUp];
    
    // test 640x480
    
    targetSize = CGSizeMake(640, 480);
    
    targetImage = [sourceImagePortrait imageByScalingNotCroppingForSize:targetSize];
    XCTAssertEqual(targetImage.size.width, targetSize.width);
    XCTAssertEqual(targetImage.size.height, targetSize.height);
    
    targetImage = [sourceImageLandscape imageByScalingNotCroppingForSize:targetSize];
    XCTAssertEqual(targetImage.size.width, targetSize.width);
    XCTAssertEqual(targetImage.size.height, targetSize.height);
    
    
    // test 800x600
    
    targetSize = CGSizeMake(800, 600);
    
    targetImage = [sourceImagePortrait imageByScalingNotCroppingForSize:targetSize];
    XCTAssertEqual(targetImage.size.width, targetSize.width);
    XCTAssertEqual(targetImage.size.height, targetSize.height);
    
    targetImage = [sourceImageLandscape imageByScalingNotCroppingForSize:targetSize];
    XCTAssertEqual(targetImage.size.width, targetSize.width);
    XCTAssertEqual(targetImage.size.height, targetSize.height);
    
    // test 1024x768
    
    targetSize = CGSizeMake(1024, 768);
    
    targetImage = [sourceImagePortrait imageByScalingNotCroppingForSize:targetSize];
    XCTAssertEqual(targetImage.size.width, targetSize.width);
    XCTAssertEqual(targetImage.size.height, targetSize.height);
    
    targetImage = [sourceImageLandscape imageByScalingNotCroppingForSize:targetSize];
    XCTAssertEqual(targetImage.size.width, targetSize.width);
    XCTAssertEqual(targetImage.size.height, targetSize.height);
}

- (void) testImageCorrectedForOrientation {
    UIImage *sourceImagePortrait, *sourceImageLandscape, *targetImage;
    CGSize targetSize = CGSizeZero;
    
    sourceImagePortrait = [self createImage:CGRectMake(0, 0, 2448, 3264) orientation:UIImageOrientationDown];
    sourceImageLandscape = [self createImage:CGRectMake(0, 0, 3264, 2448) orientation:UIImageOrientationDown];
    
    // PORTRAIT - image size should be unchanged

    targetSize = CGSizeMake(2448, 3264);
    
    targetImage = [sourceImagePortrait imageCorrectedForCaptureOrientation:UIImageOrientationUp];
    XCTAssertEqual(targetImage.size.width, targetSize.width);
    XCTAssertEqual(targetImage.size.height, targetSize.height);
    XCTAssertEqual(targetImage.imageOrientation, UIImageOrientationUp);

    targetImage = [sourceImagePortrait imageCorrectedForCaptureOrientation:UIImageOrientationDown];
    XCTAssertEqual(targetImage.size.width, targetSize.width);
    XCTAssertEqual(targetImage.size.height, targetSize.height);
    XCTAssertEqual(targetImage.imageOrientation, UIImageOrientationUp);

    targetImage = [sourceImagePortrait imageCorrectedForCaptureOrientation:UIImageOrientationRight];
    XCTAssertEqual(targetImage.size.width, targetSize.width);
    XCTAssertEqual(targetImage.size.height, targetSize.height);
    XCTAssertEqual(targetImage.imageOrientation, UIImageOrientationUp);

    targetImage = [sourceImagePortrait imageCorrectedForCaptureOrientation:UIImageOrientationLeft];
    XCTAssertEqual(targetImage.size.width, targetSize.width);
    XCTAssertEqual(targetImage.size.height, targetSize.height);
    XCTAssertEqual(targetImage.imageOrientation, UIImageOrientationUp);

    // LANDSCAPE - image size should be unchanged
    
    targetSize = CGSizeMake(3264, 2448);
    
    targetImage = [sourceImageLandscape imageCorrectedForCaptureOrientation:UIImageOrientationUp];
    XCTAssertEqual(targetImage.size.width, targetSize.width);
    XCTAssertEqual(targetImage.size.height, targetSize.height);

    targetImage = [sourceImageLandscape imageCorrectedForCaptureOrientation:UIImageOrientationDown];
    XCTAssertEqual(targetImage.size.width, targetSize.width);
    XCTAssertEqual(targetImage.size.height, targetSize.height);

    targetImage = [sourceImageLandscape imageCorrectedForCaptureOrientation:UIImageOrientationRight];
    XCTAssertEqual(targetImage.size.width, targetSize.width);
    XCTAssertEqual(targetImage.size.height, targetSize.height);
    
    targetImage = [sourceImageLandscape imageCorrectedForCaptureOrientation:UIImageOrientationLeft];
    XCTAssertEqual(targetImage.size.width, targetSize.width);
    XCTAssertEqual(targetImage.size.height, targetSize.height);
}



@end
