//
//  GKImageCropView.m
//  GKImagePicker
//
//  Created by Georg Kitz on 6/1/12.
//  Copyright (c) 2012 Aurora Apps. All rights reserved.
//

#import "GKImageCropView.h"
#import "GKResizeableCropOverlayView.h"

#import <QuartzCore/QuartzCore.h>

#define rad(angle) ((angle) / 180.0 * M_PI)

static CGRect GKScaleRect(CGRect rect, CGFloat scale)
{
	return CGRectMake(rect.origin.x * scale, rect.origin.y * scale, rect.size.width * scale, rect.size.height * scale);
}

@interface ScrollView : UIScrollView
@end

@implementation ScrollView

- (void)layoutSubviews{
    [super layoutSubviews];

    UIView *zoomView = [self.delegate viewForZoomingInScrollView:self];
    
    CGSize boundsSize = self.bounds.size;
    CGRect frameToCenter = zoomView.frame;
    
    // center horizontally
    if (frameToCenter.size.width < boundsSize.width)
        frameToCenter.origin.x = (boundsSize.width - frameToCenter.size.width) / 2;
    else
        frameToCenter.origin.x = 0;
    
    // center vertically
    if (frameToCenter.size.height < boundsSize.height)
        frameToCenter.origin.y = (boundsSize.height - frameToCenter.size.height) / 2;
    else
        frameToCenter.origin.y = 0;
    
    zoomView.frame = frameToCenter;
}

@end

@interface GKImageCropView ()<UIScrollViewDelegate>
@property (nonatomic, strong) UIScrollView *scrollView;
@property (nonatomic, strong) UIImageView *imageView;
@property (nonatomic, strong) GKResizeableCropOverlayView *cropOverlayView;
@property (nonatomic, assign) CGFloat xOffset;
@property (nonatomic, assign) CGFloat yOffset;
@end

@implementation GKImageCropView

#pragma mark -
#pragma Getter/Setter

@synthesize balkenHoehe;
@synthesize scrollView, imageView, cropOverlayView, xOffset, yOffset;

- (void)setImageToCrop:(UIImage *)imageToCrop{
    self.imageView.image = imageToCrop;
}

- (UIImage *)imageToCrop{
    return self.imageView.image;
}

#pragma mark -
#pragma Public Methods

- (UIImage *)croppedImage{
    //Calculate rect that needs to be cropped
    CGRect visibleRect = [self _calcVisibleRectForResizeableCropArea];

    //transform visible rect to image orientation
    CGAffineTransform rectTransform = [self _orientationTransformedRectOfImage:self.imageToCrop];
    visibleRect = CGRectApplyAffineTransform(visibleRect, rectTransform);

    //finally crop image
    CGImageRef imageRef = CGImageCreateWithImageInRect([self.imageToCrop CGImage], visibleRect);
    UIImage *imgWOri = [UIImage imageWithCGImage:imageRef scale:self.imageToCrop.scale orientation:self.imageToCrop.imageOrientation];
    CGImageRelease(imageRef);

    // make it upright without orientation (i.e. orientation 0)
    // as an image taken in portrait but cropped to landscape would occur compressed vertically
    UIGraphicsBeginImageContext(imgWOri.size);
    [imgWOri drawAtPoint:CGPointMake(0, 0)]; // already respects orientation, so that's enough
    UIImage *result = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();

    return result;
}

- (CGRect)_calcVisibleRectForResizeableCropArea{
    GKResizeableCropOverlayView* resizeableView = (GKResizeableCropOverlayView*)self.cropOverlayView;

    //first of all, get the size scale by taking a look at the real image dimensions. Here it doesn't matter if you take
    //the width or the hight of the image, because it will always be scaled in the exact same proportion of the real image
    CGFloat sizeScale = self.imageView.image.size.width / self.imageView.frame.size.width;
    sizeScale *= self.scrollView.zoomScale;

    //then get the postion of the cropping rect inside the image
    CGRect visibleRect = [resizeableView.contentView convertRect:resizeableView.contentView.bounds toView:imageView];
    return visibleRect = GKScaleRect(visibleRect, sizeScale);
}

- (CGAffineTransform)_orientationTransformedRectOfImage:(UIImage *)img
{
	CGAffineTransform rectTransform;
	switch (img.imageOrientation)
	{
		case UIImageOrientationLeft:
			rectTransform = CGAffineTransformTranslate(CGAffineTransformMakeRotation(rad(90)), 0, -img.size.height);
			break;
		case UIImageOrientationRight:
			rectTransform = CGAffineTransformTranslate(CGAffineTransformMakeRotation(rad(-90)), -img.size.width, 0);
			break;
		case UIImageOrientationDown:
			rectTransform = CGAffineTransformTranslate(CGAffineTransformMakeRotation(rad(-180)), -img.size.width, -img.size.height);
			break;
		default:
			rectTransform = CGAffineTransformIdentity;
	};
	
	return CGAffineTransformScale(rectTransform, img.scale, img.scale);
}

#pragma mark -
#pragma Override Methods

- (id)initWithFrame:(CGRect)frame andBarHeight:(CGFloat)pBarH
{
    self = [super initWithFrame:frame];
    if (self)
    {
        balkenHoehe = pBarH;

        self.userInteractionEnabled = YES;
        self.backgroundColor = [UIColor blackColor];
        
        scrollView = [[ScrollView alloc] initWithFrame:self.bounds];
        scrollView.showsHorizontalScrollIndicator = NO;
        scrollView.showsVerticalScrollIndicator = NO;
        scrollView.delegate = self;
        scrollView.clipsToBounds = NO;
        scrollView.decelerationRate = 0.0;
        scrollView.backgroundColor = [UIColor clearColor];
        [self addSubview:scrollView];

        imageView = [[UIImageView alloc] initWithFrame:self.scrollView.frame];
        imageView.backgroundColor = [UIColor blackColor];
        [scrollView addSubview:imageView];

        scrollView.minimumZoomScale = CGRectGetWidth(self.scrollView.frame) / CGRectGetWidth(self.imageView.frame);
        scrollView.maximumZoomScale = 20.0;
        [scrollView setZoomScale:1.0];

        cropOverlayView = [[GKResizeableCropOverlayView alloc] initWithFrame:self.bounds andBarHeight:balkenHoehe];
        [self addSubview:cropOverlayView];
    }
    return self;
}


- (UIView *)hitTest:(CGPoint)point withEvent:(UIEvent *)event{
    GKResizeableCropOverlayView* resizeableCropView = (GKResizeableCropOverlayView*)self.cropOverlayView;
    
    CGRect outerFrame = CGRectInset(resizeableCropView.cropBorderView.frame, -10 , -10);
    if (CGRectContainsPoint(outerFrame, point)){
        
        if (resizeableCropView.cropBorderView.frame.size.width < 60 || resizeableCropView.cropBorderView.frame.size.height < 60 )
            return [super hitTest:point withEvent:event];
        
        CGRect innerTouchFrame = CGRectInset(resizeableCropView.cropBorderView.frame, 30, 30);
        if (CGRectContainsPoint(innerTouchFrame, point))
            return self.scrollView;
        
        CGRect outBorderTouchFrame = CGRectInset(resizeableCropView.cropBorderView.frame, -10, -10);
        if (CGRectContainsPoint(outBorderTouchFrame, point))
            return [super hitTest:point withEvent:event];
        
        return [super hitTest:point withEvent:event];
    }
    return self.scrollView;
}

- (void)layoutSubviews{
    [super layoutSubviews];

    CGSize size = self.cropOverlayView.cropSize;
    self.xOffset = floor((CGRectGetWidth(self.bounds) - size.width) * 0.5);
    self.yOffset = floor((CGRectGetHeight(self.bounds) - self.balkenHoehe - size.height) * 0.5); //fixed

    CGFloat faktoredWidth  = size.width
    ,       faktoredHeight = size.height;
    CGFloat faktor1        = self.imageToCrop.size.height / size.height
    ,       faktor2        = self.imageToCrop.size.width / size.width;

    if (faktor1 > faktor2)
        faktoredWidth = self.imageToCrop.size.width / faktor1;
    else
        faktoredHeight = self.imageToCrop.size.height / faktor2;
    
    self.cropOverlayView.frame = self.bounds;
    self.scrollView.frame = CGRectMake(xOffset, yOffset, size.width, size.height);
    self.scrollView.contentSize = CGSizeMake(size.width, size.height);
    self.imageView.frame = CGRectMake(0, 0, faktoredWidth, faktoredHeight);
}

#pragma mark -
#pragma UIScrollViewDelegate Methods

- (UIView *)viewForZoomingInScrollView:(UIScrollView *)scrollView{
    return self.imageView;
}

@end
