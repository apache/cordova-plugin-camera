//
//  GKResizeableCropOverlayView.h
//  GKImagePicker
//
//  Created by Patrick Thonhauser on 9/21/12.
//  Copyright (c) 2012 Aurora Apps. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "GKCropBorderView.h"

typedef struct {
    int widhtMultiplyer;
    int heightMultiplyer;
    int xMultiplyer;
    int yMultiplyer;
}GKResizeableViewBorderMultiplyer;

@interface GKResizeableCropOverlayView : UIView

@property (nonatomic, assign) CGFloat balkenHoehe;
@property (nonatomic, assign) CGSize cropSize; //size of the cropped image
@property (nonatomic, strong) UIView* contentView;
@property (nonatomic, strong, readonly) GKCropBorderView *cropBorderView;

-(id)initWithFrame:(CGRect)frame andBarHeight:(CGFloat)pBarH;

@end
