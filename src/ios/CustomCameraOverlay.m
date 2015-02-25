//
//  CustomCameraOverlay.m
//  RapidFireCamera
//
//  Created by Chris Guevara on 2/23/15.
//
//

#import "CustomCameraOverlay.h"
#import "CDVCamera.h"
#import <MobileCoreServices/UTCoreTypes.h>
#import <AssetsLibrary/AssetsLibrary.h>

@implementation CustomCameraOverlay

@synthesize plugin;

// Entry point method
- (id)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil {
    return [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
}

+ (instancetype) createFromPictureOptions:(CDVPictureOptions*)pictureOptions {
    CustomCameraOverlay* newOverlay = [[CustomCameraOverlay alloc] init];
    newOverlay.pictureOptions = pictureOptions;
    newOverlay.sourceType = pictureOptions.sourceType;
    newOverlay.allowsEditing = pictureOptions.allowsEditing;
    
    if (newOverlay.sourceType == UIImagePickerControllerSourceTypeCamera) {
        // We only allow taking pictures (no video) in this API.
        newOverlay.mediaTypes = @[(NSString*)kUTTypeImage];
        // We can only set the camera device if we're actually using the camera.
        newOverlay.cameraDevice = pictureOptions.cameraDirection;
        
    } else if (pictureOptions.mediaType == MediaTypeAll) {
        newOverlay.mediaTypes = [UIImagePickerController availableMediaTypesForSourceType:newOverlay.sourceType];
    } else {
        NSArray* mediaArray = @[(NSString*)(pictureOptions.mediaType == MediaTypeVideo ? kUTTypeMovie : kUTTypeImage)];
        newOverlay.mediaTypes = mediaArray;
    }
    // Set the frames to be full screen
    //CGRect screenFrame = [[UIScreen mainScreen] bounds];
    //newOverlay.view.frame = screenFrame;
    
    newOverlay.showsCameraControls = NO;
    newOverlay.cameraOverlayView = [newOverlay getOverlayView];
    
    return newOverlay;
}

+ (instancetype) createFromPictureOptions:(CDVPictureOptions*)pictureOptions refToPlugin:(CDVCamera*)pluginRef {
    
    CustomCameraOverlay* newOverlay = [CustomCameraOverlay createFromPictureOptions:pictureOptions];
    newOverlay.plugin = pluginRef;
    return newOverlay;
}


- (UIView*) getOverlayView {
    UIView *overlay = [[UIView alloc] initWithFrame:[[UIScreen mainScreen] bounds]];
    overlay.backgroundColor = [UIColor clearColor];
    overlay.clipsToBounds = NO;

    [overlay addSubview: [self triggerButton]];
    [overlay addSubview: [self closeButton]];
    return overlay;
}


- (UIButton *) triggerButton
{
    UIButton* _triggerButton = [UIButton buttonWithType:UIButtonTypeCustom];
    [_triggerButton setBackgroundColor:[UIColor whiteColor]];
    [_triggerButton setTitle: @"Take Photo" forState: UIControlStateNormal];
    [_triggerButton setTitleColor: [UIColor blueColor] forState: UIControlStateNormal];
    
    // Images take too long to appear on screen. Need to find a way to preload them.
    //[_triggerButton setImage:[UIImage imageNamed:@"trigger"] forState:UIControlStateNormal];
    //[_triggerButton setImage:[UIImage imageNamed:@"trigger"] forState:UIControlStateSelected];
    
    [_triggerButton setFrame:(CGRect){ 10, 80, 100, 30 }];
    [_triggerButton addTarget:self action:@selector(triggerAction:) forControlEvents:UIControlEventTouchUpInside];
    
    return _triggerButton;
}

- (IBAction) triggerAction:(id)sender {
    [self takePicture];
}


- (UIButton *) closeButton
{
    UIButton* _closeButton = _closeButton = [UIButton buttonWithType:UIButtonTypeCustom];
    
    [_closeButton setBackgroundColor:[UIColor whiteColor]];
    //[_closeButton setImage:[[UIImage imageNamed:@"close"] tintImageWithColor:self.tintColor] forState:UIControlStateNormal];
    //[_closeButton setFrame:(CGRect){ 25,  CGRectGetMidY(self.bottomContainerBar.bounds) - 15, 30, 30 }];
    [_closeButton setFrame:(CGRect){ 10, 200, 100, 30 }];
    [_closeButton setTitle: @"Done" forState: UIControlStateNormal];
    [_closeButton setTitleColor: [UIColor blackColor] forState: UIControlStateNormal];
    [_closeButton addTarget:self action:@selector(closeAction:) forControlEvents:UIControlEventTouchUpInside];
    
    return _closeButton;
}

- (IBAction) closeAction:(id)sender {
    // Call Take Picture
    [self.plugin imagePickerControllerDidCancel:self];
}

@end
