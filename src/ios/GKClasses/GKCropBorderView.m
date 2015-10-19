//
//  PTCropBorderView.m
//  GKImagePicker
//
//  Created by Patrick Thonhauser on 9/21/12.
//  Copyright (c) 2012 Aurora Apps. All rights reserved.
//

#import "GKCropBorderView.h"

#define kNumberOfBorderHandles 8

@implementation GKCropBorderView

@synthesize handleDiameter;

- (id)initWithFrame:(CGRect)frame
{
    self = [super initWithFrame:frame];
    if (self) {
        self.backgroundColor = [UIColor clearColor];
    }
    return self;
}

#pragma mark -
#pragma drawing
// Only override drawRect: if you perform custom drawing.
// An empty implementation adversely affects performance during animation.
- (void)drawRect:(CGRect)rect
{
    // Drawing code
    
    CGContextRef ctx = UIGraphicsGetCurrentContext();
    
    CGContextSetStrokeColorWithColor(ctx, [UIColor colorWithRed:1. green:1. blue:1. alpha:0.5].CGColor);
    CGContextSetLineWidth(ctx, 1.5f);
    CGContextAddRect(ctx, CGRectMake(handleDiameter / 2, handleDiameter / 2, rect.size.width - handleDiameter, rect.size.height - handleDiameter));
    CGContextStrokePath(ctx);
    
    NSMutableArray* handleRectArray = [self copyAllNeededHandleRects];
    for (NSValue* value in handleRectArray){
        CGRect currentHandleRect = [value CGRectValue];
        
        CGContextSetRGBFillColor(ctx, 1., 1., 1., 0.95);
        CGContextFillEllipseInRect(ctx, currentHandleRect);
    }
}

#pragma mark -
#pragma private
-(NSMutableArray*)copyAllNeededHandleRects{
    
    NSMutableArray* a = [NSMutableArray new];
    //starting with the upper left corner and then following clockwise
    CGRect currentRect = CGRectMake(0, 0, handleDiameter, handleDiameter);
    [a addObject:[NSValue valueWithCGRect:currentRect]];
    
    currentRect = CGRectMake(self.frame.size.width / 2 - handleDiameter / 2, 0, handleDiameter, handleDiameter);
    [a addObject:[NSValue valueWithCGRect:currentRect]];
    
    currentRect = CGRectMake(self.frame.size.width - handleDiameter, 0 , handleDiameter, handleDiameter);
    [a addObject:[NSValue valueWithCGRect:currentRect]];
    //upper row done
    currentRect = CGRectMake(self.frame.size.width - handleDiameter, self.frame.size.height / 2 - handleDiameter / 2, handleDiameter, handleDiameter);
    [a addObject:[NSValue valueWithCGRect:currentRect]];
    
    currentRect = CGRectMake(self.frame.size.width - handleDiameter, self.frame.size.height - handleDiameter, handleDiameter, handleDiameter);
    [a addObject:[NSValue valueWithCGRect:currentRect]];
    
    currentRect = CGRectMake(self.frame.size.width / 2 - handleDiameter / 2, self.frame.size.height - handleDiameter, handleDiameter, handleDiameter);
    [a addObject:[NSValue valueWithCGRect:currentRect]];
    
    currentRect = CGRectMake(0, self.frame.size.height - handleDiameter, handleDiameter, handleDiameter);
    [a addObject:[NSValue valueWithCGRect:currentRect]];
    //now back up again
    currentRect = CGRectMake(0, self.frame.size.height / 2 - handleDiameter / 2, handleDiameter, handleDiameter);
    [a addObject:[NSValue valueWithCGRect:currentRect]];
    
    return a;
}
@end
