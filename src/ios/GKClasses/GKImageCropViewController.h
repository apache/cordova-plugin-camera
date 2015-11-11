//
//  GKImageCropViewController.h
//  GKImagePicker
//
//  Created by Georg Kitz on 6/1/12.
//  Copyright (c) 2012 Aurora Apps. All rights reserved.
//

#import <UIKit/UIKit.h>

@protocol GKImageCropControllerDelegate;

@interface GKImageCropViewController : UIViewController

@property (nonatomic, strong) UIImagePickerController *derImagePicker; // wird nur durchgereicht
@property (nonatomic, strong) NSDictionary *dieBildInfo;
@property (nonatomic, strong) id<GKImageCropControllerDelegate> delegate;
@property (nonatomic, strong) UIToolbar *toolbar;

@end


@protocol GKImageCropControllerDelegate <NSObject>
@required
- (void)imageCropController:(GKImageCropViewController *)imageCropController didFinishWithCroppedImageInfo:(NSDictionary *)croppedImageInfo
            fromImagePicker:(UIImagePickerController *)picker; // wird nur durchgereicht
- (void)imageCropControllerDidCancel:(GKImageCropViewController *)imageCropController
                     withImagePicker:(UIImagePickerController*)picker; // wird nur durchgereicht
@end
