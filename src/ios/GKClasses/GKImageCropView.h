//
//  GKImageCropView.h
//  GKImagePicker
//
//  Created by Georg Kitz on 6/1/12.
//  Copyright (c) 2012 Aurora Apps. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface GKImageCropView : UIView

@property (nonatomic, assign) CGFloat balkenHoehe;
@property (nonatomic, strong) UIImage *imageToCrop;

- (id)initWithFrame:(CGRect)frame andBarHeight:(CGFloat)pBarH;
- (UIImage *)croppedImage;

@end
