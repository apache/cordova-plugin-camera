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

@implementation CustomCameraOverlay

// Entry point method
- (id)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil {
    return [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
}

+ (instancetype) createFromPictureOptions:(CDVPictureOptions*)pictureOptions {
    CustomCameraOverlay* newOverlay = [[CustomCameraOverlay alloc] initWithNibName:@"CustomCameraOverlay" bundle:nil];
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
    
    newOverlay.showsCameraControls = NO;
    newOverlay.cameraOverlayView = newOverlay.view;
    
    return newOverlay;
}

+ (UIView*) getOverlayView {
    UIView *overlay = [[UIView alloc] initWithFrame:[[UIScreen mainScreen] bounds]];
    overlay.backgroundColor = [UIColor clearColor];
    overlay.clipsToBounds = NO;
    
    CGRect buttonFrame = CGRectMake( 10, 80, 100, 30 );
    UIButton *button = [[UIButton alloc] initWithFrame: buttonFrame];
    [button setTitle: @"My Button" forState: UIControlStateNormal];
    [button setTitleColor: [UIColor blueColor] forState: UIControlStateNormal];
    [overlay addSubview: button];
    
    return overlay;
}


// Action method.  This is like an event callback in JavaScript.
-(IBAction) takePhotoButtonPressed:(id)sender forEvent:(UIEvent*)event {
    NSLog(@"You pressed the camera button!");
}
/*

// Delegate method.  UIImagePickerController will call this method as soon as the image captured above is ready to be processed.  This is also like an event callback in JavaScript.
/*
-(void) imagePickerController:(UIImagePickerController *)picker didFinishPickingMediaWithInfo:(NSDictionary *)info {
    
    NSLog(@"Image captured is ready to be processed. (but not doing anything with it right now)");
    // Get a reference to the captured image
    //UIImage* image = [info objectForKey:UIImagePickerControllerOriginalImage];
    
    // Get a file path to save the JPEG
    //NSArray* paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
    //NSString* documentsDirectory = [paths objectAtIndex:0];
    //NSString* filename = @"test.jpg";
    //NSString* imagePath = [documentsDirectory stringByAppendingPathComponent:filename];
    
    // Get the image data (blocking; around 1 second)
    //NSData* imageData = UIImageJPEGRepresentation(image, 0.5);
    
    // Write the data to the file
    //[imageData writeToFile:imagePath atomically:YES];
    
    // Tell the plugin class that we're finished processing the image
    //[self.plugin capturedImageWithPath:imagePath];
}

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view from its nib.
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

/*
#pragma mark - Navigation

// In a storyboard-based application, you will often want to do a little preparation before navigation
- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender {
    // Get the new view controller using [segue destinationViewController].
    // Pass the selected object to the new view controller.
}
*/

@end
