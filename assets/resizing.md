I used the tool [Mobile Icon Resizer](https://github.com/muzzley/mobile-icon-resizer) to generate app icons.

It requires the installation of the following:
- Macports (visit website and download installer: http://www.macports.org/)
- ImageMagick:  `sudo port install ImageMagick`

Command for app icons: `mobile-icon-resizer -i assets/app-icon.png --config assets/app-icon-resize-config.json --platforms=ios`

The launch images unfortunately required manual generation.  I made some json with placeholder for expected image dimensions.  

The configuration is done within the xcode project files in `ios > ModeifyReactNative > Images.xcassets` or in the Xcode application in `ModeifyReactNative > Images.xcassets` and `TARGETS > ModeifyReactNative > General > App Icons and Launch Images` 
