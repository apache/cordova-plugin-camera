<!--
#
# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
# 
# http://www.apache.org/licenses/LICENSE-2.0
# 
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
#  KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
#
-->
# Release Notes

### 2.3.1 (Dec 07, 2016)
* Fix missing license headers.
* [CB-12086](https://issues.apache.org/jira/browse/CB-12086) Regenerate README.md from template
* Added NSPhotoLibraryUsageDescription parameter to example install command Fixing some usages of NSPhotoLibraryUsageDescriptionentry
* Close #124: I can crop fine with Photos.  We should not have adopted Crop, since it makes no sense on Android.
* Updating compat dependency to 1.1.0 or better
* Close #199.  We save photos to a shared Pictures directory, similar to the behaviour of the Twitter application
* Close #201.  Running out of memory shouldn't be graceful.
* Close #228.  We don't require these permissions on Camera, since we use intents.
* Close #241
* Bumping the CI
* [CB-11625](https://issues.apache.org/jira/browse/CB-11625) Forgot to add CordovaUri.java to plugin.xml
* [CB-11625](https://issues.apache.org/jira/browse/CB-11625) Files Provider does not work with Android 4.4.4 or lower, and I have no idea why.  Working around with CordovaUri
* [CB-11625](https://issues.apache.org/jira/browse/CB-11625) (Android) : Make this work with previous versions of Cordova via cordova-plugin-compat
* BuildConfig from test project crept in source code thanks to Android Studio, removing
* WTF.  Directory, not file.  Not sure why I did that
* [CB-11625](https://issues.apache.org/jira/browse/CB-11625) Managed to get Content Providers to work with a weird mix of Content Providers and non-Content Providers
* Adding provider_paths.xml so this works
* Partially modified plugin.xml
* [CB-11625](https://issues.apache.org/jira/browse/CB-11625) Working on fix to API 24 no longer allowing File URIs to be passed across intents
* [CB-11917](https://issues.apache.org/jira/browse/CB-11917) - Remove pull request template checklist item: "iCLA has been submitted…"
* Closing invalid pull request: close #98
* [CB-11832](https://issues.apache.org/jira/browse/CB-11832) Incremented plugin version.
* [CB-11832](https://issues.apache.org/jira/browse/CB-11832) Updated version and RELEASENOTES.md for release 2.3.0
* [CB-11795](https://issues.apache.org/jira/browse/CB-11795) Add 'protective' entry to cordovaDependencies
* [CB-11661](https://issues.apache.org/jira/browse/CB-11661) (ios) Add mandatory iOS 10 privacy description
* [CB-11661](https://issues.apache.org/jira/browse/CB-11661) (ios) Add mandatory iOS 10 privacy description
* Revert "close #229"
* Removed unneeded file
* close #229
* [CB-11661](https://issues.apache.org/jira/browse/CB-11661) (ios) Add mandatory iOS 10 privacy description
* [CB-11714](https://issues.apache.org/jira/browse/CB-11714) (windows) added more explicit content-type when converting to target data on canvas
* [CB-11295](https://issues.apache.org/jira/browse/CB-11295) Add WP8.1 quirk when choosing image from photoalbum
* [CB-10067](https://issues.apache.org/jira/browse/CB-10067) Update PictureSourceType JSDoc to reflect README update
* [CB-9070](https://issues.apache.org/jira/browse/CB-9070) Update CameraPopoverHandle docs to reflect README update
* Plugin uses Android Log class and not Cordova LOG class
* [CB-11631](https://issues.apache.org/jira/browse/CB-11631) Appium tests: A working fix for a flaky "selection canceled" failure
* [CB-11709](https://issues.apache.org/jira/browse/CB-11709) Tests should use resolveLocalFileSystemURL() instead of deprecated resolveFileSystemURI()
* Closing invalid PR
* [CB-11695](https://issues.apache.org/jira/browse/CB-11695) Increased session creation timeout for Appium tests
* [CB-11631](https://issues.apache.org/jira/browse/CB-11631) Appium tests: A fix for a flaky "selection cancelled" failure
* [CB-11656](https://issues.apache.org/jira/browse/CB-11656) (Android) Appium tests: Fixed side menu opening on some more resolutions
* [CB-11656](https://issues.apache.org/jira/browse/CB-11656) (Android) Appium tests: Fixed side menu opening on certain resolutions
* [CB-11376](https://issues.apache.org/jira/browse/CB-11376) (ios): fix CameraUsesGeolocation error
* [CB-10067](https://issues.apache.org/jira/browse/CB-10067) (ios) clarifications on PictureSourceType
* [CB-11410](https://issues.apache.org/jira/browse/CB-11410) (ios) fix cameraPopoverHandle.setPosition
* [CB-9070.](https://issues.apache.org/jira/browse/CB-9070.) (ios) Fixed CameraPopoverHandle documentation
* [CB-11447](https://issues.apache.org/jira/browse/CB-11447) Respect output format when retrieving images from gallery
* [CB-11447](https://issues.apache.org/jira/browse/CB-11447) Resolve iOS tests failures due to iOS quirks
* [CB-11553](https://issues.apache.org/jira/browse/CB-11553) Pend failing Appium tests on Sauce Labs for the time being (reverted from commit b69571724035f41642f3ee612c5b66e1f0c4386c)
* [CB-11553](https://issues.apache.org/jira/browse/CB-11553) Pend failing Appium tests on Sauce Labs for the time being
* [CB-11498](https://issues.apache.org/jira/browse/CB-11498) [Android] Appium tests should not fail when there is no camera
* Add badges for paramedic builds on Jenkins
* [CB-11296](https://issues.apache.org/jira/browse/CB-11296) Appium: Better element clicking and session error handling
* [CB-11232](https://issues.apache.org/jira/browse/CB-11232) Appium tests: fixed element tapping on iOS 9
* [CB-11183](https://issues.apache.org/jira/browse/CB-11183) Appium tests: Added image verification
* Closing stale PRs. This closes #114, closes #104
* Closing stale PRs. This closes #85, closes #93
* fixed some bad formatting that hid HTML tags and added link to sample
* Closing stale PRs. Close #167
* Closing stale PRs. Close #147
* Set android quality default value to 50 on the java code
* Moving message in PR template to a comment
* Add pull request template. This closes #213
* [CB-11228](https://issues.apache.org/jira/browse/CB-11228) browser: Add classes for styling purposes
* [CB-10139](https://issues.apache.org/jira/browse/CB-10139) browser: Respect target width and height
* Stale PRs: closes #149, closes #148, closes #155, closes #107, closes #71, closes #55, closes #14
* [CB-11227](https://issues.apache.org/jira/browse/CB-11227) browser: Fix incorrect mime type
* [CB-11162](https://issues.apache.org/jira/browse/CB-11162) Appium tests: retry spec on failure
* Reverted indenting done by Android Studio
* Adding missing function
* [CB-4078](https://issues.apache.org/jira/browse/CB-4078) Fix for orientation/scaling on Android 4.4+ devices
* [CB-11165](https://issues.apache.org/jira/browse/CB-11165) removed peer dependency
* [CB-11147](https://issues.apache.org/jira/browse/CB-11147) Appium tests: generate descriptive spec names
* [CB-10996](https://issues.apache.org/jira/browse/CB-10996) Adding front matter to README.md
* [CB-11128](https://issues.apache.org/jira/browse/CB-11128) Appum tests: Fixed some of the flaky failures
* [CB-11003](https://issues.apache.org/jira/browse/CB-11003) Added Sample section to the Camera plugin README
* [CB-11091](https://issues.apache.org/jira/browse/CB-11091) Incremented plugin version.
*  Updated version and RELEASENOTES.md for release 2.2.0
* [CB-10873](https://issues.apache.org/jira/browse/CB-10873)     - Avoid crash due to usage of uninitialized variable when writing geolocation data to image destination     - Properly handle 'CameraUsesGeolocation' option by properly setting geolocation data in EXIF header in all cases
* [CB-10873](https://issues.apache.org/jira/browse/CB-10873) Avoid crash due to usage of uninitialized variable when writing geolocation data to image destination
* [CB-11073](https://issues.apache.org/jira/browse/CB-11073) Appium tests stability improvements
* Replace PermissionHelper.java with cordova-plugin-compat
* Making focus handler work only for windows 10 phone
* [CB-10865](https://issues.apache.org/jira/browse/CB-10865) Run ios native tests on Travis
* [CB-10120](https://issues.apache.org/jira/browse/CB-10120) android: Fixing use of constants and PermissionHelper
* [CB-10120](https://issues.apache.org/jira/browse/CB-10120) android: Fix missing CAMERA permission for Android M
* [CB-10756](https://issues.apache.org/jira/browse/CB-10756) Adding sterner warnings about DATA_URL
* [CB-10460](https://issues.apache.org/jira/browse/CB-10460) getRealPath return null in some cases
* clean RELEASENOTES for bold font
* Appium tests: tweaking some timeouts and default screenshot path
* [CB-10820](https://issues.apache.org/jira/browse/CB-10820) Incremented plugin version.
* [CB-10820](https://issues.apache.org/jira/browse/CB-10820) Updated version and RELEASENOTES.md for release 2.1.1
* [CB-10825](https://issues.apache.org/jira/browse/CB-10825) android: Always request READ permission for gallery source
* added apache license header to appium files
* [CB-10720](https://issues.apache.org/jira/browse/CB-10720) Fixed spelling, capitalization, and other small issues.
* [CB-10414](https://issues.apache.org/jira/browse/CB-10414) Adding focus handler to resume video when user comes back on leaving the app while preview was running
* Appium tests: adjust swipe distance on Android
* [CB-10750](https://issues.apache.org/jira/browse/CB-10750) Appium tests: fail fast if session is irrecoverable
* Adding missing semi colon
* Adding focus handler to make sure filepicker gets launched when app is active
* [CB-10128](https://issues.apache.org/jira/browse/CB-10128) [iOS] Fixed how checks access authorization to camera & library. This closes #146
* [CB-10636](https://issues.apache.org/jira/browse/CB-10636) Add JSHint for plugins
* [CB-10639](https://issues.apache.org/jira/browse/CB-10639) Appium tests: Added some timeouts, Taking a screenshot on failure, Retry taking a picture up to 3 times, Try to restart the Appium session if it's lost
* [CB-10552](https://issues.apache.org/jira/browse/CB-10552) Replacing images in README.md.
* Added a lot of more cases to get the real path
* Fix for [CB-10625](https://issues.apache.org/jira/browse/CB-10625)
* [CB-10619](https://issues.apache.org/jira/browse/CB-10619) Appium tests: Properly switch to webview
* [CB-10397](https://issues.apache.org/jira/browse/CB-10397) Added Appium tests
* [CB-10576](https://issues.apache.org/jira/browse/CB-10576) MobileSpec can't get results for Windows-Store 8.1 Builds
* chore: edit package.json license to match SPDX id
* [CB-10539](https://issues.apache.org/jira/browse/CB-10539) Commenting out the verySmallQvga maxResolution option
* [CB-10541](https://issues.apache.org/jira/browse/CB-10541) Changing default maxResoltion to be highestAvailable for CameraCaptureUI
* [CB-10113](https://issues.apache.org/jira/browse/CB-10113) Browser - Layer camera UI on top of all!
* [CB-10502](https://issues.apache.org/jira/browse/CB-10502) Fix camera plugin exception in Chrome when click capture.
* Adding comments
* Camera tapping fix
* [CB-10368](https://issues.apache.org/jira/browse/CB-10368) Incremented plugin version.
* [CB-10368](https://issues.apache.org/jira/browse/CB-10368) Updated version and RELEASENOTES.md for release 2.1.0
* added .ratignore
* [CB-10319](https://issues.apache.org/jira/browse/CB-10319) android: Adding reflective helper methods for permission requests
* [CB-9189](https://issues.apache.org/jira/browse/CB-9189) android: Implementing save/restore API to handle Activity destruction
* [CB-10241](https://issues.apache.org/jira/browse/CB-10241) - App Crash cause by Camera Plugin ios 7
* [CB-10035](https://issues.apache.org/jira/browse/CB-10035) Incremented plugin version.
* [CB-8940](https://issues.apache.org/jira/browse/CB-8940) Setting z-index values to maximum for UI buttons. This closes #140.
* [CB-10035](https://issues.apache.org/jira/browse/CB-10035) linked issues in RELEASENOTES.md
* [CB-10035](https://issues.apache.org/jira/browse/CB-10035) Updated version and RELEASENOTES.md for release 2.0.0
* removed r prefix from tags
* [CB-10035](https://issues.apache.org/jira/browse/CB-10035) Updated RELEASENOTES to be newest to oldest
* remove unneeded weakness
* [CB-8863](https://issues.apache.org/jira/browse/CB-8863) correct block usage for async calls
* [CB-5479](https://issues.apache.org/jira/browse/CB-5479) android: changed saveToPhotoAlbum to save uncompressed images
* [CB-9169](https://issues.apache.org/jira/browse/CB-9169) android: Fixed filetype for uncompressed images and added quirk
* [CB-9446](https://issues.apache.org/jira/browse/CB-9446) related: Removing CordovaResource library code in favour of the code we're supposed to be deprecating because that at least works.
* [CB-9942](https://issues.apache.org/jira/browse/CB-9942) Normalize line endings in Camera plugin docs
* [CB-9910](https://issues.apache.org/jira/browse/CB-9910) android: Add permission request for some gallery requests
* [CB-7668](https://issues.apache.org/jira/browse/CB-7668) android: Adding a sterner warning for allowedit on Android
* Actually fixing the contribute link.
* Fixing contribute link.
* Using the CordovaResourceApi to fine paths of files in the background thread.  If the file doesn't exist, return the content URI We also do a refactor to bring this in line.  This code got bike-shedded a bit.
* Add engine tag for Cordova-Android 5.0.x
* Fix permission handling
* [CB-9583](https://issues.apache.org/jira/browse/CB-9583) Permissions for Marshmallow
* Closes stale pull requests. Close #91, close #82, close #59, close #20
* Try to use realpath filename instead of default modified.jpg
* change 'case' to else-if. This closes #113
* [CB-6190](https://issues.apache.org/jira/browse/CB-6190) - iOS camera plugin ignores quality parameter
* [CB-9633](https://issues.apache.org/jira/browse/CB-9633) iOS Taking a Picture With Option destinationType:NATIVE_URI Doesn't Show Image
* [CB-9745](https://issues.apache.org/jira/browse/CB-9745) Camera plugin docs should be generated from the source
* [CB-9622](https://issues.apache.org/jira/browse/CB-9622) Windows Phone 8 Camera Option destinationType:NATIVE_URI is a NO-OP
* [CB-9623](https://issues.apache.org/jira/browse/CB-9623) Fixes various issues when encodingType set to png
* [CB-9591](https://issues.apache.org/jira/browse/CB-9591) Retaining aspect ratio when resizing
* [CB-9443](https://issues.apache.org/jira/browse/CB-9443) Pick correct maxResolution This closes #111, closes #56
* [CB-9151](https://issues.apache.org/jira/browse/CB-9151) Trigger captureAction only once
* [CB-9413](https://issues.apache.org/jira/browse/CB-9413) Close RandomAccessStream once copied
* [CB-5661](https://issues.apache.org/jira/browse/CB-5661) Remove outdated iOS quirks about memory
* Closing stale pull request: close #106
* [CB-9349](https://issues.apache.org/jira/browse/CB-9349) Focus control and nice UI
* Closing stale pull request: close #73
* Closing stale pull request: close #77
* remove travis-ci integration
* [CB-9259](https://issues.apache.org/jira/browse/CB-9259) Forgot to add another check on which URI we're using when fixing this thing the first time
* [CB-9247](https://issues.apache.org/jira/browse/CB-9247) - typo
* [CB-9247](https://issues.apache.org/jira/browse/CB-9247) - Added macro to conditionally add NSData+Base64.h
* [CB-9247](https://issues.apache.org/jira/browse/CB-9247) - Fixes compilation errors with cordova-ios 4.x
* Fix returning native url on windows.
* [CB-9192](https://issues.apache.org/jira/browse/CB-9192) Incremented plugin version.
* [CB-9202](https://issues.apache.org/jira/browse/CB-9202) updated repo url to github mirror in package.json
* [CB-9192](https://issues.apache.org/jira/browse/CB-9192) Updated version and RELEASENOTES.md for release 1.2.0
* Closing stale pull request: close #84
* Closing stale pull request: close #66
* [CB-9128](https://issues.apache.org/jira/browse/CB-9128) cordova-plugin-camera documentation translation: cordova-plugin-camera
* Update docs. This closes #100
* attempt to fix npm markdown issue
* [CB-8883](https://issues.apache.org/jira/browse/CB-8883) fix picture rotation issue
* one more alias
* Fixed some nit white-space issues, aliased a little more
* major refactor : readability
* Patch for CB-8498, this closes #64
* [CB-8879](https://issues.apache.org/jira/browse/CB-8879) fix stripe issue with correct aspect ratio
* [CB-8601](https://issues.apache.org/jira/browse/CB-8601) - iOS camera unit tests broken
* [CB-7667](https://issues.apache.org/jira/browse/CB-7667) iOS8: Handle case where camera is not authorized (closes #49)
* add missing license header
* [CB-8959](https://issues.apache.org/jira/browse/CB-8959) Incremented plugin version.
* [CB-8959](https://issues.apache.org/jira/browse/CB-8959) Updated version and RELEASENOTES.md for release 1.1.0
* [CB-8943](https://issues.apache.org/jira/browse/CB-8943) fix PickAndContinue issue on Win10Phone
* [CB-8253](https://issues.apache.org/jira/browse/CB-8253) Fix potential unreleased resources
* [CB-8909](https://issues.apache.org/jira/browse/CB-8909) Remove unused import from File
* [CB-8404](https://issues.apache.org/jira/browse/CB-8404) typo fix cameraproxy.js
* [CB-8404](https://issues.apache.org/jira/browse/CB-8404) Rotate camera feed with device orientation
* [CB-8054](https://issues.apache.org/jira/browse/CB-8054) Support taking pictures from file for WP8
* [CB-8405](https://issues.apache.org/jira/browse/CB-8405) Use z-index instead of z-order
* [CB-8858](https://issues.apache.org/jira/browse/CB-8858) Incremented plugin version.
* [CB-8858](https://issues.apache.org/jira/browse/CB-8858) Updated version in package.json for release 1.0.0
* Revert "CB-8858 Incremented plugin version."
* [CB-8858](https://issues.apache.org/jira/browse/CB-8858) Incremented plugin version.
* [CB-8858](https://issues.apache.org/jira/browse/CB-8858) Updated version and RELEASENOTES.md for release 1.0.0
* [CB-8780](https://issues.apache.org/jira/browse/CB-8780) - Display popover using main thread. Fixes popover slowness (closes #81)
* [CB-8746](https://issues.apache.org/jira/browse/CB-8746) bumped version of file dependency in package.json too
* [CB-8746](https://issues.apache.org/jira/browse/CB-8746) bumped version of file dependency
* [CB-8746](https://issues.apache.org/jira/browse/CB-8746) gave plugin major version bump
* CR fixes
* [CB-8707](https://issues.apache.org/jira/browse/CB-8707) refactoring windows code to improve readability
* [CB-8706](https://issues.apache.org/jira/browse/CB-8706) use filePicker if saveToPhotoAlbum is true
* [CB-8706](https://issues.apache.org/jira/browse/CB-8706) remove unnecessary capabilities from xml
* [CB-8747](https://issues.apache.org/jira/browse/CB-8747) updated dependency, added peer dependency
* [CB-8683](https://issues.apache.org/jira/browse/CB-8683) updated blackberry specific references of org.apache.cordova.camera to cordova-plugin-camera
* [CB-8782](https://issues.apache.org/jira/browse/CB-8782) Updated the docs to talk about the allowEdit quirks, it's not 100% working, but better than it was
* [CB-8782](https://issues.apache.org/jira/browse/CB-8782) Fixed the flow so that we save the cropped image and use it, not the original non-cropped.  Crop only supports G+ Photos Crop, other crops may not work, depending on the OEM
* [CB-8740](https://issues.apache.org/jira/browse/CB-8740) Removing FileHelper call that was failing on Samsung Galaxy S3, now that we have a real path, we only need to update the MediaStore, not pull from it in this case
* [CB-8740](https://issues.apache.org/jira/browse/CB-8740) Partial fix for Save Image to Gallery error found in MobileSpec
* [CB-8683](https://issues.apache.org/jira/browse/CB-8683) changed plugin-id to pacakge-name
* [CB-8653](https://issues.apache.org/jira/browse/CB-8653) properly updated translated docs to use new id
* [CB-8653](https://issues.apache.org/jira/browse/CB-8653) updated translated docs to use new id
* [CB-8351](https://issues.apache.org/jira/browse/CB-8351) Fix custom implementation of integerValueForKey (close #79)
* Fix cordova-paramedic path change, build with TRAVIS_BUILD_DIR, use npm to install paramedic
* docs: added 'Windows' to supported platforms
* [CB-8653](https://issues.apache.org/jira/browse/CB-8653) Updated Readme
* [CB-8659](https://issues.apache.org/jira/browse/CB-8659) ios: 4.0.x Compatibility: Remove use of deprecated headers
* [CB-8646](https://issues.apache.org/jira/browse/CB-8646) Incremented plugin version.
* [CB-8646](https://issues.apache.org/jira/browse/CB-8646) Updated version and RELEASENOTES.md for release 0.3.6
* added missing apache header
* Fix localize key for Videos. This closes #58
* [CB-8235](https://issues.apache.org/jira/browse/CB-8235) android: Fix crash when selecting images from DropBox with spaces in path (close #65)
* add try ... catch for getting image orientation
* [CB-8599](https://issues.apache.org/jira/browse/CB-8599) fix threading issue with cameraPicker (fixes #72)
* [CB-8559](https://issues.apache.org/jira/browse/CB-8559) Integrate TravisCI
* [CB-8438](https://issues.apache.org/jira/browse/CB-8438) cordova-plugin-camera documentation translation: cordova-plugin-camera
* [CB-8538](https://issues.apache.org/jira/browse/CB-8538) Added package.json file
* [CB-8429](https://issues.apache.org/jira/browse/CB-8429) Incremented plugin version.
* [CB-8429](https://issues.apache.org/jira/browse/CB-8429) Updated version and RELEASENOTES.md for release 0.3.5
* [CB-8351](https://issues.apache.org/jira/browse/CB-8351) ios: Stop using now-deprecated [NSData base64EncodedString]
* [CB-8351](https://issues.apache.org/jira/browse/CB-8351) ios: Stop using now-deprecated integerValueForKey: class extension
* [CB-8351](https://issues.apache.org/jira/browse/CB-8351) Unbreak build from previous commit
* [CB-8351](https://issues.apache.org/jira/browse/CB-8351) Use argumentForIndex rather than NSArray extension
* [CB-8032](https://issues.apache.org/jira/browse/CB-8032) - Camera Plugin - Add nativeURL external method support for CDVFileSystem->makeEntryForPath:isDirectory: (closes #57)
* [CB-7938](https://issues.apache.org/jira/browse/CB-7938) - Added XCTest unit tests project, with stubs (adapted from SplashScreen unit test setup) (closes #60)
* [CB-7937](https://issues.apache.org/jira/browse/CB-7937) - Re-factor iOS Camera plugin so that it is testable (closes #52)
* [CB-8110](https://issues.apache.org/jira/browse/CB-8110) Incremented plugin version.
* [CB-8110](https://issues.apache.org/jira/browse/CB-8110) Updated version and RELEASENOTES.md for release 0.3.4
* [CB-7977](https://issues.apache.org/jira/browse/CB-7977) Mention deviceready in plugin docs
* [CB-7979](https://issues.apache.org/jira/browse/CB-7979) Each plugin doc should have a ## Installation section
* Fix memory leak of image data in imagePickerControllerReturnImageResult
* Pass uri to crop instead of pulling the low resolution image out of the intent return (close #43)
* Add orientation support for PNG to Android (closes #45)
* [CB-7700](https://issues.apache.org/jira/browse/CB-7700) cordova-plugin-camera documentation translation: cordova-plugin-camera
*  Incremented plugin version.
*  Updated version and RELEASENOTES.md for release 0.3.3
* [CB-7600](https://issues.apache.org/jira/browse/CB-7600) Adds informative message to error callback in manual test.
* [CB-7571](https://issues.apache.org/jira/browse/CB-7571) Bump version of nested plugin to match parent plugin
* [CB-7571](https://issues.apache.org/jira/browse/CB-7571) Incremented plugin version.
* [CB-7571](https://issues.apache.org/jira/browse/CB-7571) Updated version and RELEASENOTES.md for release 0.3.2
* [CB-7551](https://issues.apache.org/jira/browse/CB-7551) - [Camera][iOS 8] Scaled images show a white line
* [CB-7558](https://issues.apache.org/jira/browse/CB-7558) - hasPendingOperation flag in Camera plugin's takePicture should be reversed to fix memory errors
* [CB-7557](https://issues.apache.org/jira/browse/CB-7557) - Camera plugin tests is missing a File dependency
* [CB-7423](https://issues.apache.org/jira/browse/CB-7423) do cleanup after copyImage manual test
* [CB-7471](https://issues.apache.org/jira/browse/CB-7471) cordova-plugin-camera documentation translation: cordova-plugin-camera
* [CB-7413](https://issues.apache.org/jira/browse/CB-7413) Resolve 'ms-appdata' URIs with File plugin
* Fixed minor bugs with the browser
* [CB-7433](https://issues.apache.org/jira/browse/CB-7433) Adds missing window reference to prevent manual tests failure on Android and iOS
* [CB-7249](https://issues.apache.org/jira/browse/CB-7249) cordova-plugin-camera documentation translation: cordova-plugin-camera
* [CB-4003](https://issues.apache.org/jira/browse/CB-4003) - Add config option to not use location information in Camera plugin (and default to not use it)
* [CB-7461](https://issues.apache.org/jira/browse/CB-7461) - Geolocation fails in Camera plugin in iOS 8
* [CB-7378](https://issues.apache.org/jira/browse/CB-7378) Use single Proxy for both windows8 and windows.
* [CB-7378](https://issues.apache.org/jira/browse/CB-7378) Adds support for windows platform
* [CB-7433](https://issues.apache.org/jira/browse/CB-7433) Fixes manual tests failure on windows
* [CB-6958](https://issues.apache.org/jira/browse/CB-6958) Get the correct default for "quality" in the test
* add documentation for manual tests
* [CB-7249](https://issues.apache.org/jira/browse/CB-7249) cordova-plugin-camera documentation translation: cordova-plugin-camera
* [CB-4003](https://issues.apache.org/jira/browse/CB-4003) - Add config option to not use location information in Camera plugin (and default to not use it)
* [CB-7461](https://issues.apache.org/jira/browse/CB-7461) - Geolocation fails in Camera plugin in iOS 8
* [CB-7433](https://issues.apache.org/jira/browse/CB-7433) Fixes manual tests failure on windows
* [CB-7378](https://issues.apache.org/jira/browse/CB-7378) Use single Proxy for both windows8 and windows.
* [CB-7378](https://issues.apache.org/jira/browse/CB-7378) Adds support for windows platform
* [CB-6958](https://issues.apache.org/jira/browse/CB-6958) Get the correct default for "quality" in the test
* add documentation for manual tests
* Updated docs for browser
* Added support for the browser
* [CB-7286](https://issues.apache.org/jira/browse/CB-7286) [BlackBerry10] Use getUserMedia if camera card is unavailable
* [CB-7180](https://issues.apache.org/jira/browse/CB-7180) - Update Camera plugin to support generic plugin webView UIView (which can be either a UIWebView or WKWebView)
* Renamed test dir, added nested plugin.xml
* [CB-6958](https://issues.apache.org/jira/browse/CB-6958) added manual tests
* [CB-6958.](https://issues.apache.org/jira/browse/CB-6958.) Port camera tests to plugin-test-framework
* [CB-7244](https://issues.apache.org/jira/browse/CB-7244) Incremented plugin version.
* [CB-7244](https://issues.apache.org/jira/browse/CB-7244) Updated version and RELEASENOTES.md for release 0.3.1
* CB-7249cordova-plugin-camera documentation translation: cordova-plugin-camera
* update CameraProxy.js
* [CB-7187](https://issues.apache.org/jira/browse/CB-7187) ios: Add explicit dependency on CoreLocation.framework
* CB-7110cordova-plugin-camera documentation translation: cordova-plugin-camera
* [BlackBerry10] Doc correction - sourceType is supported
* CB-6127lisa7cordova-plugin-consolecordova-plugin-camera documentation translation: cordova-plugin-camera
* [CB-7071](https://issues.apache.org/jira/browse/CB-7071) android: Fix callback firing before CROP intent is sent when allowEdit=true
* Tweak docs to not use []'s for optional arg since that's JS array notation
* [CB-6875](https://issues.apache.org/jira/browse/CB-6875) android: Handle exception when SDCard is not mounted
* ios: Delete postImage (dead code)
* Prevent NPE on processResiultFromGallery when intent comes null
* Remove iOS doc reference to non-existing navigator.fileMgr API
* Docs updated with some default values
* Removes File plugin dependency from windows8 code.
* Use WinJS functionality to resize image instead of File plugin functionality
* [CB-6877](https://issues.apache.org/jira/browse/CB-6877) Incremented plugin version.
* [CB-6877](https://issues.apache.org/jira/browse/CB-6877) Updated version and RELEASENOTES.md for release 0.3.0
* [CB-2083](https://issues.apache.org/jira/browse/CB-2083) documented saveToPhotoAlbum quirk on WP8
* [CB-5895](https://issues.apache.org/jira/browse/CB-5895) documented saveToPhotoAlbum quirk on WP8
* Remove deprecated symbols for iOS < 6
* documentation translation: cordova-plugin-camera
* Lisa testing pulling in plugins for plugin: cordova-plugin-camera
* Lisa testing pulling in plugins for plugin: cordova-plugin-camera
* Lisa testing pulling in plugins for plugin: cordova-plugin-camera
* Lisa testing pulling in plugins for plugin: cordova-plugin-camera
* ubuntu: use application directory for images
* [CB-6795](https://issues.apache.org/jira/browse/CB-6795) Add license
* documentation translation: cordova-plugin-camera
* Lisa testing pulling in plugins for plugin: cordova-plugin-camera
* Lisa testing pulling in plugins for plugin: cordova-plugin-camera
* Little fix in code formatting
* [CB-6613](https://issues.apache.org/jira/browse/CB-6613) Use WinJS functionality to get base64-encoded content of image instead of File plugin functionality
* [CB-6612](https://issues.apache.org/jira/browse/CB-6612) camera.getPicture now always returns encoded JPEG image
* Removed invalid note from [CB-5398](https://issues.apache.org/jira/browse/CB-5398)
* [CB-6576](https://issues.apache.org/jira/browse/CB-6576) - Returns a specific error message when app has no access to library.
* [CB-6491](https://issues.apache.org/jira/browse/CB-6491) add CONTRIBUTING.md
* [CB-6546](https://issues.apache.org/jira/browse/CB-6546) android: Fix a couple bugs with allowEdit pull request
* [CB-6546](https://issues.apache.org/jira/browse/CB-6546) android: Add support for allowEdit Camera option
* [CB-6452](https://issues.apache.org/jira/browse/CB-6452) Incremented plugin version on dev branch.
* [CB-6452](https://issues.apache.org/jira/browse/CB-6452) Updated version and RELEASENOTES.md for release 0.2.9
* [CB-6460](https://issues.apache.org/jira/browse/CB-6460) Update license headers
* [CB-6422](https://issues.apache.org/jira/browse/CB-6422) [windows8] use cordova/exec/proxy
* WP8 When only targetWidth or targetHeight is provided, use it as the only bound
* Remove rotation test value
* cleanup, finalize implementations/consolidations
* combining callbacks, removing lots of dupe code
* Fix camera issues, cropping, memory leaks CB-4027, CB-5102, CB-2737, [CB-2387](https://issues.apache.org/jira/browse/CB-2387)
* [CB-6212](https://issues.apache.org/jira/browse/CB-6212) iOS: fix warnings compiled under arm64 64-bit
* Fix typo error in docs
* [CB-6212](https://issues.apache.org/jira/browse/CB-6212) iOS: fix warnings compiled under arm64 64-bit
* Add rim xml namespaces declaration
* Add NOTICE file
* [CB-6114](https://issues.apache.org/jira/browse/CB-6114) Incremented plugin version on dev branch.
* [CB-6114](https://issues.apache.org/jira/browse/CB-6114) Updated version and RELEASENOTES.md for release 0.2.8
* Add NOTICE file
* [CB-6114](https://issues.apache.org/jira/browse/CB-6114) Updated version and RELEASENOTES.md for release 0.2.8
* [CB-1826](https://issues.apache.org/jira/browse/CB-1826) Android: Guard against content provider not supplying orientation
* [CB-1826](https://issues.apache.org/jira/browse/CB-1826) Catch OOM on gallery image resize
* Refactor onActivityResult
* [CB-5980](https://issues.apache.org/jira/browse/CB-5980) Incremented plugin version on dev branch.
* Lisa testing pulling in plugins for plugin: cordova-plugin-camera
* Lisa testing pulling in plugins for plugin: cordova-plugin-camera
* [CB-5980](https://issues.apache.org/jira/browse/CB-5980) Updated version and RELEASENOTES.md for release 0.2.7
* remove unrequired FFOS file
* reapply new version of FFOS config in plugin.xml
* remove 2nd FFOS platform config in plugin.xml
* typo
* [CB-4919](https://issues.apache.org/jira/browse/CB-4919) firefox os quirks added and supported platforms list is updated
* getPicture via web activities
* Documented quirk for [CB-5335](https://issues.apache.org/jira/browse/CB-5335) + [CB-5206](https://issues.apache.org/jira/browse/CB-5206) for WP7+8
* reference the correct firefoxos implementation
* Delete stale test/ directory
* [BlackBerry10] Add permission to access_shared
* [CB-5719](https://issues.apache.org/jira/browse/CB-5719) Incremented plugin version on dev branch.
* Documented quirk for [CB-5335](https://issues.apache.org/jira/browse/CB-5335) + [CB-5206](https://issues.apache.org/jira/browse/CB-5206) for WP7+8
* [CB-5719](https://issues.apache.org/jira/browse/CB-5719) Updated version and RELEASENOTES.md for release 0.2.6
* [CB-5658](https://issues.apache.org/jira/browse/CB-5658) Update license comment formatting of doc/index.md
* [CB-5658](https://issues.apache.org/jira/browse/CB-5658) Add doc.index.md for Camera plugin
* [CB-5658](https://issues.apache.org/jira/browse/CB-5658) Delete stale snapshot of plugin docs
* [CB-2442](https://issues.apache.org/jira/browse/CB-2442) [CB-2419](https://issues.apache.org/jira/browse/CB-2419) Use Windows.Storage.ApplicationData.current.localFolder, instead of writing to app package.
* [BlackBerry10] Adding platform level permissions
* [CB-5599](https://issues.apache.org/jira/browse/CB-5599) Android: Catch and ignore OutOfMemoryError in getRotatedBitmap()
* [CB-5565](https://issues.apache.org/jira/browse/CB-5565) Incremented plugin version on dev branch.
* [CB-5565](https://issues.apache.org/jira/browse/CB-5565) Updated version and RELEASENOTES.md for release 0.2.5
* fix camera for firefox os
* getPicture via web activities
* [ubuntu] specify policy_group
* add ubuntu platform
* 1. User Agent detection now detects AmazonWebView. 2. Change to use amazon-fireos as the platform if user agent string contains 'cordova-amazon-fireos'
* Added amazon-fireos platform.
* [CB-5188](https://issues.apache.org/jira/browse/CB-5188)
* [CB-5188](https://issues.apache.org/jira/browse/CB-5188) Updated version and RELEASENOTES.md for release 0.2.4
* [CB-5128](https://issues.apache.org/jira/browse/CB-5128) added repo + issue tag to plugin.xml for camera plugin
* [CB-4958](https://issues.apache.org/jira/browse/CB-4958) - iOS - Camera plugin should not show the status bar
* [CB-4919](https://issues.apache.org/jira/browse/CB-4919) updated plugin.xml for FxOS
* [CB-4915](https://issues.apache.org/jira/browse/CB-4915) Incremented plugin version on dev branch.
* [CB-4915](https://issues.apache.org/jira/browse/CB-4915) Updated version and RELEASENOTES.md for release 0.2.3
* [CB-4889](https://issues.apache.org/jira/browse/CB-4889) bumping&resetting version
* [CB-4889](https://issues.apache.org/jira/browse/CB-4889) forgot index.html
* [CB-4889](https://issues.apache.org/jira/browse/CB-4889) renaming core inside cameraProxy
* [Windows8] commandProxy has moved
* [Windows8] commandProxy has moved
* added Camera API for FirefoxOS
* Rename CHANGELOG.md -> RELEASENOTES.md
* [CB-4823](https://issues.apache.org/jira/browse/CB-4823) Fix XCode 5 camera plugin warnings
* Fix compiler warnings
* [CB-4765](https://issues.apache.org/jira/browse/CB-4765) Move ExifHelper.java into Camera Plugin
* [CB-4764](https://issues.apache.org/jira/browse/CB-4764) Remove reference to DirectoryManager from CameraLauncher
* [CB-4763](https://issues.apache.org/jira/browse/CB-4763) Use a copy of FileHelper.java within camera-plugin.
* [CB-4752](https://issues.apache.org/jira/browse/CB-4752) Incremented plugin version on dev branch.
* [CB-4633](https://issues.apache.org/jira/browse/CB-4633) We really should close cursors.  It's just the right thing to do.
* No longer causes a stack trace, but it doesn't cause the error to be called.
* [CB-4889](https://issues.apache.org/jira/browse/CB-4889) renaming org.apache.cordova.core.camera to org.apache.cordova.camera
* No longer causes a stack trace, but it doesn't cause the error to be called.
* [CB-4432](https://issues.apache.org/jira/browse/CB-4432) copyright notice change
* [CB-4752](https://issues.apache.org/jira/browse/CB-4752) Updated version and changelog
* [CB-4656](https://issues.apache.org/jira/browse/CB-4656) Don't add line-breaks to base64-encoded images.
* [CB-4432](https://issues.apache.org/jira/browse/CB-4432) copyright notice change
* [CB-4595](https://issues.apache.org/jira/browse/CB-4595) updated version
* reverted name element to be human readable
* [CB-4417](https://issues.apache.org/jira/browse/CB-4417) Move cordova-plugin-camera to its own Java package.
* updated namespace, name tag and readme
* cleanup whitespace
* [CB-3482](https://issues.apache.org/jira/browse/CB-3482) Allow image metadata to be saved to album on iOS
* [CB-3453](https://issues.apache.org/jira/browse/CB-3453) Save original picture to photo library
* [CB-3482](https://issues.apache.org/jira/browse/CB-3482) Allow image metadata to be saved to album on iOS
* [CB-3453](https://issues.apache.org/jira/browse/CB-3453) Save original picture to photo library
* [plugin.xml] adding android namespace
* [plugin.xml] standardizing license + meta
* [license] adding apache license file
* updating plugin.xml with registry data
* [Windows8] added support for Windows8
* [CB-4366](https://issues.apache.org/jira/browse/CB-4366) Explicit MobileCoreServices.framework dependency should be specified for some core plugins
* [CB-4367](https://issues.apache.org/jira/browse/CB-4367) Explicit AssetsLibrary.framework dependency should be specified for some core plugins
* [CB-4368](https://issues.apache.org/jira/browse/CB-4368) Explicit CoreGraphics.framework dependency should be specified for some core plugins
* [CB-4365](https://issues.apache.org/jira/browse/CB-4365) Explicit CoreLocation.framework dependency should be specified for some core plugins
* [CB-4361](https://issues.apache.org/jira/browse/CB-4361) Camera plugin needs to specify ImageIO.framework dependency in plugin.xml
* [wp] capabilities fix, access to mediaLib for saving photos

### 2.3.0 (Sep 08, 2016)
* [CB-11795](https://issues.apache.org/jira/browse/CB-11795) Add 'protective' entry to cordovaDependencies
* [CB-11661](https://issues.apache.org/jira/browse/CB-11661) Add mandatory **iOS 10** privacy description
* [CB-11714](https://issues.apache.org/jira/browse/CB-11714) **windows** added more explicit content-type when converting to target data on canvas
* [CB-11295](https://issues.apache.org/jira/browse/CB-11295) Add **WP8.1** quirk when choosing image from `photoalbum`
* [CB-10067](https://issues.apache.org/jira/browse/CB-10067) Update `PictureSourceType` JSDoc to reflect `README` update
* [CB-9070](https://issues.apache.org/jira/browse/CB-9070) Update `CameraPopoverHandle` docs to reflect `README` update
* Plugin uses `Android Log class` and not `Cordova LOG class`
* [CB-11631](https://issues.apache.org/jira/browse/CB-11631) Appium tests: A working fix for a flaky `selection canceled` failure
* [CB-11709](https://issues.apache.org/jira/browse/CB-11709) Tests should use `resolveLocalFileSystemURL()` instead of deprecated `resolveFileSystemURI()`
* [CB-11695](https://issues.apache.org/jira/browse/CB-11695) Increased session creation timeout for Appium tests
* [CB-11656](https://issues.apache.org/jira/browse/CB-11656) (**Android**) Appium tests: Fixed side menu opening on some more resolutions
* [CB-11376](https://issues.apache.org/jira/browse/CB-11376) (**ios**): fix `CameraUsesGeolocation` error
* [CB-10067](https://issues.apache.org/jira/browse/CB-10067) (**ios**) clarifications on `PictureSourceType`
* [CB-11410](https://issues.apache.org/jira/browse/CB-11410) (**ios**) fix `cameraPopoverHandle.setPosition`
* [CB-9070](https://issues.apache.org/jira/browse/CB-9070) (**ios**) Fixed `CameraPopoverHandle` documentation
* [CB-11447](https://issues.apache.org/jira/browse/CB-11447) Respect output format when retrieving images from gallery
* [CB-11447](https://issues.apache.org/jira/browse/CB-11447) Resolve **iOS** tests failures due to **iOS** quirks
* [CB-11553](https://issues.apache.org/jira/browse/CB-11553) Pend failing Appium tests on Sauce Labs for the time being (reverted from commit b69571724035f41642f3ee612c5b66e1f0c4386c)
* [CB-11553](https://issues.apache.org/jira/browse/CB-11553) Pend failing Appium tests on Sauce Labs for the time being
* [CB-11498](https://issues.apache.org/jira/browse/CB-11498) [**Android**] Appium tests should not fail when there is no camera
* Add badges for paramedic builds on Jenkins
* [CB-11296](https://issues.apache.org/jira/browse/CB-11296) Appium: Better element clicking and session error handling
* [CB-11232](https://issues.apache.org/jira/browse/CB-11232) Appium tests: fixed element tapping on **iOS 9**
* [CB-11183](https://issues.apache.org/jira/browse/CB-11183) Appium tests: Added image verification
* fixed some bad formatting that hid `HTML` tags and added link to sample
* Set **android** quality default value to 50 on the java code
* Moving message in PR template to a comment
* Add pull request template. This closes #213
* [CB-11228](https://issues.apache.org/jira/browse/CB-11228) **browser**: Add classes for styling purposes
* [CB-10139](https://issues.apache.org/jira/browse/CB-10139) **browser**: Respect target width and height
* [CB-11227](https://issues.apache.org/jira/browse/CB-11227) **browser**: Fix incorrect `mime type`
* [CB-11162](https://issues.apache.org/jira/browse/CB-11162) Appium tests: retry spec on failure
* [CB-4078](https://issues.apache.org/jira/browse/CB-4078) Fix for `orientation/scaling` on **Android 4.4+** devices
* [CB-11165](https://issues.apache.org/jira/browse/CB-11165) removed peer dependency
* [CB-11147](https://issues.apache.org/jira/browse/CB-11147) Appium tests: generate descriptive spec names
* [CB-10996](https://issues.apache.org/jira/browse/CB-10996) Adding front matter to `README.md`
* [CB-11128](https://issues.apache.org/jira/browse/CB-11128) Appum tests: Fixed some of the flaky failures
* [CB-11003](https://issues.apache.org/jira/browse/CB-11003) Added Sample section to the Camera plugin README

### 2.2.0 (Apr 15, 2016)
* [CB-10873](https://issues.apache.org/jira/browse/CB-10873) Avoid crash due to usage of uninitialized variable when writing geolocation data to image destination. Properly handle 'CameraUsesGeolocation' option by properly setting geolocation data in EXIF header in all cases
* [CB-11073](https://issues.apache.org/jira/browse/CB-11073) Appium tests stability improvements
* Replace `PermissionHelper.java` with `cordova-plugin-compat`
* Making focus handler work only for **windows 10** phone
* [CB-10865](https://issues.apache.org/jira/browse/CB-10865) Run **ios** native tests on **Travis**
* [CB-10120](https://issues.apache.org/jira/browse/CB-10120) Fixing use of constants and `PermissionHelper`
* [CB-10120](https://issues.apache.org/jira/browse/CB-10120) Fix missing CAMERA permission for **Android M**
* [CB-10756](https://issues.apache.org/jira/browse/CB-10756) Adding sterner warnings about `DATA_URL`
* [CB-10460](https://issues.apache.org/jira/browse/CB-10460) `getRealPath` return null in some cases

### 2.1.1 (Mar 09, 2016)
* [CB-10825](https://issues.apache.org/jira/browse/CB-10825) **Android** should request READ permission for gallery source
* added apache license header to appium files
* [CB-10720](https://issues.apache.org/jira/browse/CB-10720) Fixed spelling, capitalization, and other small issues.
* [CB-10414](https://issues.apache.org/jira/browse/CB-10414) Adding focus handler to resume video when user comes back on leaving the app while preview was running
* Appium tests: adjust swipe distance on **Android**
* [CB-10750](https://issues.apache.org/jira/browse/CB-10750) Appium tests: fail fast if session is irrecoverable
* Adding missing semi colon
* Adding focus handler to make sure filepicker gets launched when app is active on **Windows**
* [CB-10128](https://issues.apache.org/jira/browse/CB-10128) **iOS** Fixed how checks access authorization to camera & library. This closes #146
* [CB-10636](https://issues.apache.org/jira/browse/CB-10636) Add JSHint for plugins
* [CB-10639](https://issues.apache.org/jira/browse/CB-10639) Appium tests: Added some timeouts, Taking a screenshot on failure, Retry taking a picture up to 3 times, Try to restart the Appium session if it's lost
* [CB-10552](https://issues.apache.org/jira/browse/CB-10552) Replacing images in README.md.
* Added a lot of more cases to get the real path on **Android** 
* [CB-10625](https://issues.apache.org/jira/browse/CB-10625) **Android** getPicture fails when getting a photo from the Photo Library - Google Photos
* [CB-10619](https://issues.apache.org/jira/browse/CB-10619) Appium tests: Properly switch to webview on **Android**
* [CB-10397](https://issues.apache.org/jira/browse/CB-10397) Added Appium tests
* [CB-10576](https://issues.apache.org/jira/browse/CB-10576) MobileSpec can't get results for **Windows**-Store 8.1 Builds
* chore: edit package.json license to match SPDX id
* [CB-10539](https://issues.apache.org/jira/browse/CB-10539) Commenting out the verySmallQvga maxResolution option on **Windows**
* [CB-10541](https://issues.apache.org/jira/browse/CB-10541) Changing default maxResoltion to be highestAvailable for CameraCaptureUI on **Windows**
* [CB-10113](https://issues.apache.org/jira/browse/CB-10113) **Browse** - Layer camera UI on top of all! 
* [CB-10502](https://issues.apache.org/jira/browse/CB-10502) **Browser** - Fix camera plugin exception in Chrome when click capture.
* Adding comments
* Camera tapping fix on **Windows**

### 2.1.0 (Jan 15, 2016)
* added `.ratignore`
* [CB-10319](https://issues.apache.org/jira/browse/CB-10319) **Android** Adding reflective helper methods for permission requests
* [CB-9189](https://issues.apache.org/jira/browse/CB-9189) **Android** Implementing `save/restore` API to handle Activity destruction
* [CB-10241](https://issues.apache.org/jira/browse/CB-10241) App Crash cause by Camera Plugin **iOS 7**
* [CB-8940](https://issues.apache.org/jira/browse/CB-8940) Setting `z-index` values to maximum for UI buttons.

### 2.0.0 (Nov 18, 2015)
* [CB-10035](https://issues.apache.org/jira/browse/CB-10035) Updated `RELEASENOTES` to be newest to oldest
* [CB-8863](https://issues.apache.org/jira/browse/CB-8863) correct block usage for `async` calls
* [CB-5479](https://issues.apache.org/jira/browse/CB-5479) changed `saveToPhotoAlbum` to save uncompressed images for **Android**
* [CB-9169](https://issues.apache.org/jira/browse/CB-9169) Fixed `filetype` for uncompressed images and added quirk for **Android**
* [CB-9446](https://issues.apache.org/jira/browse/CB-9446) Removing `CordovaResource` library code in favour of the code we're supposed to be deprecating because that at least works.
* [CB-9942](https://issues.apache.org/jira/browse/CB-9942) Normalize line endings in Camera plugin docs
* [CB-9910](https://issues.apache.org/jira/browse/CB-9910) Add permission request for some gallery requests for **Android**
* [CB-7668](https://issues.apache.org/jira/browse/CB-7668) Adding a sterner warning for `allowedit` on **Android**
* Fixing contribute link.
* Using the `CordovaResourceApi` to fine paths of files in the background thread.  If the file doesn't exist, return the content `URI`. 
* Add engine tag for **Cordova-Android 5.0.x**
* [CB-9583](https://issues.apache.org/jira/browse/CB-9583): Added support for **Marshmallow** permissions (**Android 6.0**)
* Try to use `realpath` filename instead of default `modified.jpg`
* [CB-6190](https://issues.apache.org/jira/browse/CB-6190) **iOS** camera plugin ignores quality parameter
* [CB-9633](https://issues.apache.org/jira/browse/CB-9633) **iOS** Taking a Picture With Option `destinationType:NATIVE_URI` doesn't show image
* [CB-9745](https://issues.apache.org/jira/browse/CB-9745) Camera plugin docs should be generated from the source
* [CB-9622](https://issues.apache.org/jira/browse/CB-9622) **WP8** Camera Option `destinationType:NATIVE_URI` is a `NO-OP`
* [CB-9623](https://issues.apache.org/jira/browse/CB-9623) Fixes various issues when `encodingType` set to `png`
* [CB-9591](https://issues.apache.org/jira/browse/CB-9591) Retaining aspect ratio when resizing
* [CB-9443](https://issues.apache.org/jira/browse/CB-9443) Pick correct `maxResolution` 
* [CB-9151](https://issues.apache.org/jira/browse/CB-9151) Trigger `captureAction` only once
* [CB-9413](https://issues.apache.org/jira/browse/CB-9413) Close `RandomAccessStream` once copied
* [CB-5661](https://issues.apache.org/jira/browse/CB-5661) Remove outdated **iOS** quirks about memory
* [CB-9349](https://issues.apache.org/jira/browse/CB-9349) Focus control and nice UI
* [CB-9259](https://issues.apache.org/jira/browse/CB-9259) Forgot to add another check on which `URI` we're using when fixing this thing the first time
* [CB-9247](https://issues.apache.org/jira/browse/CB-9247) Added macro to conditionally add `NSData+Base64.h`
* [CB-9247](https://issues.apache.org/jira/browse/CB-9247) Fixes compilation errors with **cordova-ios 4.x**
* Fix returning native url on **Windows**.

### 1.2.0 (Jun 17, 2015)
* Closing stale pull request: close #84
* Closing stale pull request: close #66
* [CB-9128](https://issues.apache.org/jira/browse/CB-9128) cordova-plugin-camera documentation translation: cordova-plugin-camera
* Update docs. This closes #100
* attempt to fix npm markdown issue
* [CB-8883](https://issues.apache.org/jira/browse/CB-8883) fix picture rotation issue
* one more alias
* Fixed some nit white-space issues, aliased a little more
* major refactor : readability
* Patch for [CB-8498](https://issues.apache.org/jira/browse/CB-8498), this closes #64
* [CB-8879](https://issues.apache.org/jira/browse/CB-8879) fix stripe issue with correct aspect ratio
* [CB-8601](https://issues.apache.org/jira/browse/CB-8601) - iOS camera unit tests broken
* [CB-7667](https://issues.apache.org/jira/browse/CB-7667) iOS8: Handle case where camera is not authorized (closes #49)
* add missing license header

### 1.1.0 (May 06, 2015)
* [CB-8943](https://issues.apache.org/jira/browse/CB-8943) fix `PickAndContinue` issue on *Win10Phone*
* [CB-8253](https://issues.apache.org/jira/browse/CB-8253) Fix potential unreleased resources
* [CB-8909](https://issues.apache.org/jira/browse/CB-8909): Remove unused import from File
* [CB-8404](https://issues.apache.org/jira/browse/CB-8404) typo fix `cameraproxy.js`
* [CB-8404](https://issues.apache.org/jira/browse/CB-8404) Rotate camera feed with device orientation
* [CB-8054](https://issues.apache.org/jira/browse/CB-8054) Support taking pictures from file for *WP8*
* [CB-8405](https://issues.apache.org/jira/browse/CB-8405) Use `z-index` instead of `z-order`

### 1.0.0 (Apr 15, 2015)
* [CB-8780](https://issues.apache.org/jira/browse/CB-8780) - Display popover using main thread. Fixes popover slowness (closes #81)
* [CB-8746](https://issues.apache.org/jira/browse/CB-8746) bumped version of file dependency
* [CB-8746](https://issues.apache.org/jira/browse/CB-8746) gave plugin major version bump
* [CB-8707](https://issues.apache.org/jira/browse/CB-8707) refactoring windows code to improve readability
* [CB-8706](https://issues.apache.org/jira/browse/CB-8706) use filePicker if saveToPhotoAlbum is true
* [CB-8706](https://issues.apache.org/jira/browse/CB-8706) remove unnecessary capabilities from xml
* [CB-8747](https://issues.apache.org/jira/browse/CB-8747) updated dependency, added peer dependency
* [CB-8683](https://issues.apache.org/jira/browse/CB-8683) updated blackberry specific references of org.apache.cordova.camera to cordova-plugin-camera
* [CB-8782](https://issues.apache.org/jira/browse/CB-8782): Updated the docs to talk about the allowEdit quirks, it's not 100% working, but better than it was
* [CB-8782](https://issues.apache.org/jira/browse/CB-8782): Fixed the flow so that we save the cropped image and use it, not the original non-cropped.  Crop only supports G+ Photos Crop, other crops may not work, depending on the OEM
* [CB-8740](https://issues.apache.org/jira/browse/CB-8740): Removing FileHelper call that was failing on Samsung Galaxy S3, now that we have a real path, we only need to update the MediaStore, not pull from it in this case
* [CB-8740](https://issues.apache.org/jira/browse/CB-8740): Partial fix for Save Image to Gallery error found in MobileSpec
* [CB-8683](https://issues.apache.org/jira/browse/CB-8683) changed plugin-id to pacakge-name
* [CB-8653](https://issues.apache.org/jira/browse/CB-8653) properly updated translated docs to use new id
* [CB-8653](https://issues.apache.org/jira/browse/CB-8653) updated translated docs to use new id
* [CB-8351](https://issues.apache.org/jira/browse/CB-8351) Fix custom implementation of integerValueForKey (close #79)
* Fix cordova-paramedic path change, build with TRAVIS_BUILD_DIR, use npm to install paramedic
* docs: added 'Windows' to supported platforms
* [CB-8653](https://issues.apache.org/jira/browse/CB-8653) Updated Readme
* [CB-8659](https://issues.apache.org/jira/browse/CB-8659): ios: 4.0.x Compatibility: Remove use of deprecated headers

### 0.3.6 (Mar 10, 2015)
* Fix localize key for Videos. This closes #58
* [CB-8235](https://issues.apache.org/jira/browse/CB-8235) android: Fix crash when selecting images from DropBox with spaces in path (close #65)
* add try ... catch for getting image orientation
* [CB-8599](https://issues.apache.org/jira/browse/CB-8599) fix threading issue with cameraPicker (fixes #72)
* [CB-8559](https://issues.apache.org/jira/browse/CB-8559) Integrate TravisCI
* [CB-8438](https://issues.apache.org/jira/browse/CB-8438) cordova-plugin-camera documentation translation: cordova-plugin-camera
* [CB-8538](https://issues.apache.org/jira/browse/CB-8538) Added package.json file

### 0.3.5 (Feb 04, 2015)
* [CB-8351](https://issues.apache.org/jira/browse/CB-8351) ios: Stop using now-deprecated [NSData base64EncodedString]
* [CB-8351](https://issues.apache.org/jira/browse/CB-8351) ios: Stop using now-deprecated integerValueForKey: class extension
* [CB-8351](https://issues.apache.org/jira/browse/CB-8351) ios: Use argumentForIndex rather than NSArray extension
* [CB-8032](https://issues.apache.org/jira/browse/CB-8032) ios: Add nativeURL external method support for CDVFileSystem->makeEntryForPath:isDirectory:
* [CB-7938](https://issues.apache.org/jira/browse/CB-7938) ios: Added XCTest unit tests project, with stubs (adapted from SplashScreen unit test setup)
* [CB-7937](https://issues.apache.org/jira/browse/CB-7937) ios: Re-factor iOS Camera plugin so that it is testable

### 0.3.4 (Dec 02, 2014)
* [CB-7977](https://issues.apache.org/jira/browse/CB-7977) Mention `deviceready` in plugin docs
* [CB-7979](https://issues.apache.org/jira/browse/CB-7979) Each plugin doc should have a ## Installation section
* Fix memory leak of image data in `imagePickerControllerReturnImageResult`
* Pass uri to crop instead of pulling the low resolution image out of the intent return (close #43)
* Add orientation support for PNG to Android (closes #45)
* [CB-7700](https://issues.apache.org/jira/browse/CB-7700) cordova-plugin-camera documentation translation: cordova-plugin-camera

### 0.3.3 (Oct 03, 2014)
* [CB-7600](https://issues.apache.org/jira/browse/CB-7600) Adds informative message to error callback in manual test.

### 0.3.2 (Sep 17, 2014)
* [CB-7551](https://issues.apache.org/jira/browse/CB-7551) [Camera][iOS 8] Scaled images show a white line
* [CB-7558](https://issues.apache.org/jira/browse/CB-7558) hasPendingOperation flag in Camera plugin's takePicture should be reversed to fix memory errors
* [CB-7557](https://issues.apache.org/jira/browse/CB-7557) Camera plugin tests is missing a File dependency
* [CB-7423](https://issues.apache.org/jira/browse/CB-7423) do cleanup after copyImage manual test
* [CB-7471](https://issues.apache.org/jira/browse/CB-7471) cordova-plugin-camera documentation translation: cordova-plugin-camera
* [CB-7413](https://issues.apache.org/jira/browse/CB-7413) Resolve 'ms-appdata' URIs with File plugin
* Fixed minor bugs with the browser
* [CB-7433](https://issues.apache.org/jira/browse/CB-7433) Adds missing window reference to prevent manual tests failure on Android and iOS
* [CB-7249](https://issues.apache.org/jira/browse/CB-7249) cordova-plugin-camera documentation translation: cordova-plugin-camera
* [CB-4003](https://issues.apache.org/jira/browse/CB-4003) Add config option to not use location information in Camera plugin (and default to not use it)
* [CB-7461](https://issues.apache.org/jira/browse/CB-7461) Geolocation fails in Camera plugin in iOS 8
* [CB-7378](https://issues.apache.org/jira/browse/CB-7378) Use single Proxy for both windows8 and windows.
* [CB-7378](https://issues.apache.org/jira/browse/CB-7378) Adds support for windows platform
* [CB-7433](https://issues.apache.org/jira/browse/CB-7433) Fixes manual tests failure on windows
* [CB-6958](https://issues.apache.org/jira/browse/CB-6958) Get the correct default for "quality" in the test
* add documentation for manual tests
* [CB-7249](https://issues.apache.org/jira/browse/CB-7249) cordova-plugin-camera documentation translation: cordova-plugin-camera
* [CB-4003](https://issues.apache.org/jira/browse/CB-4003) Add config option to not use location information in Camera plugin (and default to not use it)
* [CB-7461](https://issues.apache.org/jira/browse/CB-7461) Geolocation fails in Camera plugin in iOS 8
* [CB-7433](https://issues.apache.org/jira/browse/CB-7433) Fixes manual tests failure on windows
* [CB-7378](https://issues.apache.org/jira/browse/CB-7378) Use single Proxy for both windows8 and windows.
* [CB-7378](https://issues.apache.org/jira/browse/CB-7378) Adds support for windows platform
* [CB-6958](https://issues.apache.org/jira/browse/CB-6958) Get the correct default for "quality" in the test
* add documentation for manual tests
* Updated docs for browser
* Added support for the browser
* [CB-7286](https://issues.apache.org/jira/browse/CB-7286) [BlackBerry10] Use getUserMedia if camera card is unavailable
* [CB-7180](https://issues.apache.org/jira/browse/CB-7180) Update Camera plugin to support generic plugin webView UIView (which can be either a UIWebView or WKWebView)
* Renamed test dir, added nested plugin.xml
* [CB-6958](https://issues.apache.org/jira/browse/CB-6958) added manual tests
* [CB-6958](https://issues.apache.org/jira/browse/CB-6958) Port camera tests to plugin-test-framework

### 0.3.1 (Aug 06, 2014)
* **FFOS** update CameraProxy.js
* [CB-7187](https://issues.apache.org/jira/browse/CB-7187) ios: Add explicit dependency on CoreLocation.framework
* [BlackBerry10] Doc correction - sourceType is supported
* [CB-7071](https://issues.apache.org/jira/browse/CB-7071) android: Fix callback firing before CROP intent is sent when allowEdit=true
* [CB-6875](https://issues.apache.org/jira/browse/CB-6875) android: Handle exception when SDCard is not mounted
* ios: Delete postImage (dead code)
* Prevent NPE on processResiultFromGallery when intent comes null
* Remove iOS doc reference to non-existing navigator.fileMgr API
* Docs updated with some default values
* Removes File plugin dependency from windows8 code.
* Use WinJS functionality to resize image instead of File plugin functionality
* [CB-6127](https://issues.apache.org/jira/browse/CB-6127) Updated translations for docs

### 0.3.0 (Jun 05, 2014)
* [CB-5895](https://issues.apache.org/jira/browse/CB-5895) documented saveToPhotoAlbum quirk on WP8
* Remove deprecated symbols for iOS < 6
* documentation translation: cordova-plugin-camera
* ubuntu: use application directory for images
* [CB-6795](https://issues.apache.org/jira/browse/CB-6795) Add license
* Little fix in code formatting
* [CB-6613](https://issues.apache.org/jira/browse/CB-6613) Use WinJS functionality to get base64-encoded content of image instead of File plugin functionality
* [CB-6612](https://issues.apache.org/jira/browse/CB-6612) camera.getPicture now always returns encoded JPEG image
* Removed invalid note from [CB-5398](https://issues.apache.org/jira/browse/CB-5398)
* [CB-6576](https://issues.apache.org/jira/browse/CB-6576) - Returns a specific error message when app has no access to library.
* [CB-6491](https://issues.apache.org/jira/browse/CB-6491) add CONTRIBUTING.md
* [CB-6546](https://issues.apache.org/jira/browse/CB-6546) android: Fix a couple bugs with allowEdit pull request
* [CB-6546](https://issues.apache.org/jira/browse/CB-6546) android: Add support for allowEdit Camera option

### 0.2.9 (Apr 17, 2014)
* [CB-6460](https://issues.apache.org/jira/browse/CB-6460): Update license headers
* [CB-6422](https://issues.apache.org/jira/browse/CB-6422): [windows8] use cordova/exec/proxy
* [WP8] When only targetWidth or targetHeight is provided, use it as the only bound
* [CB-4027](https://issues.apache.org/jira/browse/CB-4027), [CB-5102](https://issues.apache.org/jira/browse/CB-5102), [CB-2737](https://issues.apache.org/jira/browse/CB-2737), [CB-2387](https://issues.apache.org/jira/browse/CB-2387): [WP] Fix camera issues, cropping, memory leaks
* [CB-6212](https://issues.apache.org/jira/browse/CB-6212): [iOS] fix warnings compiled under arm64 64-bit
* [BlackBerry10] Add rim xml namespaces declaration
* Add NOTICE file

### 0.2.8 (Feb 26, 2014)
* [CB-1826](https://issues.apache.org/jira/browse/CB-1826) Catch OOM on gallery image resize

### 0.2.7 (Feb 05, 2014)
* [CB-4919](https://issues.apache.org/jira/browse/CB-4919) firefox os quirks added and supported platforms list is updated
* getPicture via web activities
* Documented quirk for [CB-5335](https://issues.apache.org/jira/browse/CB-5335) + [CB-5206](https://issues.apache.org/jira/browse/CB-5206) for WP7+8
* reference the correct firefoxos implementation
* [BlackBerry10] Add permission to access_shared

### 0.2.6 (Jan 02, 2014)
* [CB-5658](https://issues.apache.org/jira/browse/CB-5658) Add doc/index.md for Camera plugin
* [CB-2442](https://issues.apache.org/jira/browse/CB-2442) [CB-2419](https://issues.apache.org/jira/browse/CB-2419) Use Windows.Storage.ApplicationData.current.localFolder, instead of writing to app package.
* [BlackBerry10] Adding platform level permissions
* [CB-5599](https://issues.apache.org/jira/browse/CB-5599) Android: Catch and ignore OutOfMemoryError in getRotatedBitmap()

### 0.2.5 (Dec 4, 2013)
* fix camera for firefox os
* getPicture via web activities
* [ubuntu] specify policy_group
* add ubuntu platform
* 1. User Agent detection now detects AmazonWebView. 2. Change to use amazon-fireos as the platform if user agent string contains 'cordova-amazon-fireos'
* Added amazon-fireos platform.

### 0.2.4 (Oct 28, 2013)
* [CB-5128](https://issues.apache.org/jira/browse/CB-5128): added repo + issue tag to plugin.xml for camera plugin
* [CB-4958](https://issues.apache.org/jira/browse/CB-4958) - iOS - Camera plugin should not show the status bar
* [CB-4919](https://issues.apache.org/jira/browse/CB-4919) updated plugin.xml for FxOS
* [CB-4915](https://issues.apache.org/jira/browse/CB-4915) Incremented plugin version on dev branch.

### 0.2.3 (Sept 25, 2013)
* [CB-4889](https://issues.apache.org/jira/browse/CB-4889) bumping&resetting version
* [CB-4889](https://issues.apache.org/jira/browse/CB-4889) forgot index.html
* [CB-4889](https://issues.apache.org/jira/browse/CB-4889) renaming core inside cameraProxy
* [Windows8] commandProxy has moved
* [Windows8] commandProxy has moved
* added Camera API for FirefoxOS
* Rename CHANGELOG.md -> RELEASENOTES.md
* [CB-4823](https://issues.apache.org/jira/browse/CB-4823) Fix XCode 5 camera plugin warnings
* Fix compiler warnings
* [CB-4765](https://issues.apache.org/jira/browse/CB-4765) Move ExifHelper.java into Camera Plugin
* [CB-4764](https://issues.apache.org/jira/browse/CB-4764) Remove reference to DirectoryManager from CameraLauncher
* [CB-4763](https://issues.apache.org/jira/browse/CB-4763) Use a copy of FileHelper.java within camera-plugin.
* [CB-4752](https://issues.apache.org/jira/browse/CB-4752) Incremented plugin version on dev branch.
* [CB-4633](https://issues.apache.org/jira/browse/CB-4633): We really should close cursors.  It's just the right thing to do.
* No longer causes a stack trace, but it doesn't cause the error to be called.
* [CB-4889](https://issues.apache.org/jira/browse/CB-4889) renaming org.apache.cordova.core.camera to org.apache.cordova.camera

### 0.2.1 (Sept 5, 2013)
* [CB-4656](https://issues.apache.org/jira/browse/CB-4656) Don't add line-breaks to base64-encoded images (Fixes type=DataURI)
* [CB-4432](https://issues.apache.org/jira/browse/CB-4432) copyright notice change
