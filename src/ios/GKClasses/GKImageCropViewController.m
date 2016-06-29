//
//  GKImageCropViewController.m
//  GKImagePicker
//
//  Created by Georg Kitz on 6/1/12.
//  Copyright (c) 2012 Aurora Apps. All rights reserved.
//

#import "GKImageCropViewController.h"
#import "GKImageCropView.h"
#import <MobileCoreServices/UTCoreTypes.h>

@interface GKImageCropViewController ()
@property (nonatomic, strong) GKImageCropView *imageCropView;
@end

@implementation GKImageCropViewController
{
    CGFloat         _balkenHoehe;
    UIBarButtonItem *_sichernBtn;
}

#pragma mark -
#pragma mark Getter/Setter

@synthesize derImagePicker, dieBildInfo, delegate, toolbar;
@synthesize imageCropView;

#pragma mark -
#pragma Private Methods

- (void)_actionCancel
{
    [delegate imageCropControllerDidCancel:self withImagePicker:derImagePicker];
}

- (void)_actionUse
{
    NSMutableDictionary *neueBildInfo = [NSMutableDictionary dictionaryWithDictionary:dieBildInfo];
    
    [neueBildInfo setObject:[self.imageCropView croppedImage] forKey:UIImagePickerControllerEditedImage];
    [neueBildInfo setObject:(NSString*)kUTTypeImage forKey:UIImagePickerControllerMediaType];
    [delegate imageCropController:self didFinishWithCroppedImageInfo:neueBildInfo fromImagePicker:derImagePicker];
}

- (void)_setupToolbar
{
    toolbar = [UIToolbar new];
    [toolbar setBarStyle:UIBarStyleBlack];
    [toolbar setTintColor:[UIColor whiteColor]];
    if (UI_USER_INTERFACE_IDIOM() == UIUserInterfaceIdiomPad)
        [toolbar setBarTintColor:[UIColor colorWithRed:0.0 green:0.0 blue:0.0 alpha:0.4]];
    [toolbar setTranslucent:YES];

    UIBarButtonItem *cancel = [[UIBarButtonItem alloc]
                               initWithBarButtonSystemItem:UIBarButtonSystemItemRedo
                               target:self
                               action:@selector(_actionCancel)];

    UIBarButtonItem *flex = [[UIBarButtonItem alloc]
                             initWithBarButtonSystemItem:UIBarButtonSystemItemFlexibleSpace
                             target:nil
                             action:nil];
    
    _sichernBtn = [[UIBarButtonItem alloc]
                   initWithBarButtonSystemItem:UIBarButtonSystemItemSave
                   target:self
                   action:@selector(_actionUse)];

    [toolbar setItems:[NSArray arrayWithObjects:cancel, flex, _sichernBtn, nil]];
    [toolbar sizeToFit];
    _balkenHoehe = [self.toolbar frame].size.height;
}

#pragma mark -
#pragma Super Class Methods

- (BOOL)shouldAutorotate
{
    return NO;
}

- (void)viewDidLoad
{
    [super viewDidLoad];
	// Do any additional setup after loading the view.

    [self _setupToolbar];

    imageCropView = [[GKImageCropView alloc] initWithFrame:self.view.bounds andBarHeight:_balkenHoehe];
    [imageCropView setImageToCrop:[dieBildInfo objectForKey:UIImagePickerControllerOriginalImage]];

    [self.view addSubview:imageCropView];
    [self.view addSubview:toolbar];
}

- (void)viewWillLayoutSubviews
{
    [super viewWillLayoutSubviews];
    
    CGRect rahmen = self.view.bounds;

    self.imageCropView.frame = rahmen;

    // Balken nach unten
    [self.toolbar setFrame:CGRectMake(CGRectGetMinX(rahmen),
                                      CGRectGetMinY(rahmen) + CGRectGetHeight(rahmen) - _balkenHoehe,
                                      CGRectGetWidth(rahmen),
                                      _balkenHoehe)];
}

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

@end
