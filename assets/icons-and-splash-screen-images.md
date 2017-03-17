Some extra work in Xcode and Android studio is required to prepare images for App Icons and Splash screens on each platform.

## Images needed

A square image of recommended size 1024x1024 is needed for app icons.  Android appears to allow png images with transparent backgrounds, but most iOS app icons appear to be solid fills.

iOS also shows splash screens with images of various sizes for different devices.  The following sizes are currently being using by this project:

* 320x480
* 640x960
* 640x1136
* 750x1334
* 1242x2208
* 2208x1242

Although a lot of Android apps can include "splash" screens with complex animations, this app currently shows a styled background with an image in order to yield faster app load times.  One of the splash images from the above list could potentially be used for the background image for when the Android app is loading.

Android has a [detailed guide](https://developer.android.com/guide/practices/ui_guidelines/icon_design_status_bar.html) on how to produce notification icons.  They should only include the white color and have a transparent background.

## iOS processing

I used the tool [Mobile Icon Resizer](https://github.com/muzzley/mobile-icon-resizer) to generate app icons.

It requires the installation of the following:
- Macports (visit website and download installer: http://www.macports.org/)
- ImageMagick:  `sudo port install ImageMagick`

Command for app icons: `mobile-icon-resizer -i assets/app-icon.png --config assets/app-icon-resize-config.json --platforms=ios`

The launch images unfortunately required manual generation.  I made some json with placeholder for expected image dimensions.  

The configuration is done within the xcode project files in `ios > ModeifyReactNative > Images.xcassets` or in the Xcode application in `ModeifyReactNative > Images.xcassets` and `TARGETS > ModeifyReactNative > General > App Icons and Launch Images`

## Android Processing

It's best to add images to the Android project via Android Studio.  They can be added by right clicking on the `android > app` folder and selecting `New > Image Asset`.  The splash screen background is part of a theme that has been added to the Main Activity in `AndroidManifest.xml`.  The theme includes only a background setting that is defined in `Android > app > src > main > res > drawable > background_splash.xml`.
