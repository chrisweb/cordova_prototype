# cordova_prototype
bautify me photo app (cordova prototype)

## TODOS

* DONE: setup package json to retrieve dependencies (requirejs, twitter bootstrap, grunt, ...)
* DONE: edit config.xml and set default values
* DONE: add grunt file to project
* DONE: use grunt to copy vendor modules from node_modules to phonegaps www
* DONE: use grunt and jshint to lint javascript code
* DONE: setup sass and grunt watch to recreate css each time sass file gets edited
* DONE: set the canvas to full width and fulll height minus the space needed for the header and the footer of the app
* DONE: add the android platform to the project
* DONE: add the camera plugin to the project
* DONE: use camera plugin to take a photo
* DONE: create a black and white filter
* DONE: lock orientation to portrait in config.xml
* DONE: add the splashscreen plugin
* DONE: change the application icon
* DONE: save image to phone photo library
* DONE: add stickers to an image
* DONE: show message (green / red) after each action
* DONE: create the images needed by the splashscreen plugin
* share photo on social networks
* load image from library to edit it

## RESOURCES

phonegap configuration file documentation
http://docs.phonegap.com/en/edge/config_ref_index.md.html

camera plugin options
http://docs.phonegap.com/en/edge/cordova_camera_camera.md.html

splashscreen plugin documentation
http://docs.phonegap.com/en/edge/cordova_splashscreen_splashscreen.md.html

application icon documentation
http://docs.phonegap.com/en/edge/config_ref_images.md.html

## project setup

install io.js or node.js
https://iojs.org

install grunt and grunt cli globally
npm install grunt -g
npm install grunt-cli -g

install ruby
on windows get the windows installer http://rubyinstaller.org/

install sass
gem install sass

install git
for example git for windows https://msysgit.github.io/

install java jdk 1.7.x
http://www.oracle.com/technetwork/java/javase/downloads/index.html

for windows: adndroid sdk requires java, so ensure you have a JAVA_HOME environment variable set
JAVA_HOME should be something like C:\Program Files\Java\jdk1.7.0_79

install stand-alone SDK tools
https://developer.android.com/sdk/installing/index.html

install cordova
npm install cordova -g

checkout the project
https://github.com/chrisweb/cordova_prototype

open your console and go into the root directory of the project where the Gruntfile.js resides and install the dependencies
npm install

if you IDE requires the path of the android sdk set it to something similar to this, this example is for windows
C:\Users\USER_NAME\AppData\Local\Android\android-sdk\SDK Manager.exe

if you are on windows and want to debug an android nexus device then you will need to install the google usb driver
http://developer.android.com/sdk/win-usb.html

in this project the android platform has already been added, to add another platform, open your console and go into the app directory, then type the following command
cordova platform add PLATFORM_NAME

to test the app for android you need to setup the emulator, go into the android SDK folder and launch the AVD manager, then create a virtual device and start it
http://developer.android.com/tools/help/avd-manager.html

if you get this error message "SSL certificate problem: unable to get local issuer certificate" when building the app, when the plugins get retrieved then you probably use the following command to disable ssl checks in git
git config --global http.sslVerify false
! this is not safe, but I didnt find better solution yet, you can enable ssl checks after the checkout using this command
git config --global http.sslVerify true

if on device ready the camera plugin is undefined, re-install the plugins
cordova plugin remove cordova-plugin-camera
cordova plugin add cordova-plugin-camera

if the app does not build correctly try to reinstall the platform and plugins
cordova platform remove android 
cordova platform add android 

cordova plugin remove cordova-plugin-splashscreen
cordova plugin remove cordova-plugin-whitelist
cordova plugin remove cordova-plugin-file
cordova plugin remove cordova-plugin-camera
cordova plugin add cordova-plugin-splashscreen
cordova plugin add cordova-plugin-whitelist
cordova plugin add cordova-plugin-file
cordova plugin add cordova-plugin-camera

to test the app in the emulator use this command
cordova emulate android

deploay the app on a device for testing, execute this command
cordova run android --device

if you try to debug on two different computers but on the same device, you will get this error message while building "INSTALL_FAILED_UPDATE_INCOMPATIBLE"
on your device go to settings > apps and delete the app, then run the command again

to use the remote debugging of chrome
open chrome, go to more tools > inspect devices and there your device should show up, now click on inspect

## keywords

* distort
* manipulate
* image
* effect
* canvas
* photo
* filter
* lens
* share
* selfie
* retouch
* transform
* face
* fun
* frame