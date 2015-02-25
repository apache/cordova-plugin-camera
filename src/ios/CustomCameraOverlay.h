//
//  CustomCameraOverlay.h
//  RapidFireCamera
//
//  Created by Chris Guevara on 2/23/15.
//
//

#import <UIKit/UIKit.h>
#import "CDVCamera.h"

@interface CustomCameraOverlay : CDVCameraPicker
/*
-(IBAction) takePhotoButtonPressed:(id)sender forEvent:(UIEvent*)event;
*/
+ (instancetype) createFromPictureOptions:(CDVPictureOptions*)options;
+ (instancetype) createFromPictureOptions:(CDVPictureOptions*)pictureOptions refToPlugin:(CDVCamera*)pluginRef;
@property (strong) CDVCamera* plugin;

@end
