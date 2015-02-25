//
//  CustomCameraOverlay.m
//  RapidFireCamera
//
//  Created by Chris Guevara on 2/23/15.
//
//

#import "CustomCameraOverlay.h"
#import "CDVCamera.h"

@interface CustomCameraOverlay ()

@end

@implementation CustomCameraOverlay


// Action method.  This is like an event callback in JavaScript.
-(IBAction) takePhotoButtonPressed:(id)sender forEvent:(UIEvent*)event {
    //NSLog(@"You pressed the camera button!");
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
