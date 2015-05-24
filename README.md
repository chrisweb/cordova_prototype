# cordova_prototype
bautify me photo app (cordova prototype)

distort
add text
add  over photo
add filter
add frame

distort canvas
manipulate

effect
canvas
photo
image
filter
lens
share
selfie
Retouch
transform
face

facetune app

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
* create the images needed by the splashscreen plugin
* save image to phone photo library
* load image from library to edit it
* change the application icon

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


C:\Users\USER_NAME\AppData\Local\Android\android-sdk\SDK Manager.exe