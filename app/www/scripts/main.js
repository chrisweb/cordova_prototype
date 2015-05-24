'use strict';

require.config({
    baseUrl: 'scripts',
    paths: {

        // chrisweb utilities
        'chrisweb.utilities': 'vendor/chrisweb-utilities/utilities',

        // vendor
        'jquery': 'vendor/jquery/jquery',
        'underscore': 'vendor/underscore/underscore'
        
    }
    
});

require([
    'jquery',
    'chrisweb.utilities'
    
], function ($, utilities) {

    // enable html debugging
    utilities.logSpecial = true;

    var app = {
        // Application Constructor
        initialize: function() {
            
            this.bindEvents();
            
        },
        // Bind any events that are required on startup. Common events are:
        // 'load', 'deviceready', 'offline', and 'online'.
        bindEvents: function() {
            
            document.addEventListener('deviceready', this.onDeviceReady, false);
            document.addEventListener('resume', this.onResume, false);
            document.addEventListener('pause', this.onPause, false);
            
        },
        // deviceready Event Handler
        // The scope of 'this' is the event. In order to call the 'receivedEvent'
        // function, we must explicitly call 'app.receivedEvent(...);'
        onDeviceReady: function() {
            
            app.receivedEvent('deviceready');
            
        },
        onResume: function() {
            
            app.receivedEvent('resume');
            
            utilities.log('resume event', 'fontColor:blue');
            
        },
        onPause: function() {
            
            app.receivedEvent('pause');
            
            utilities.log('pause event', 'fontColor:blue');
            
        },
        // on Received Event start the app
        receivedEvent: function(eventName) {
            
            // TODO: handle pause and resume events
            if (eventName === 'deviceready') {
                
                utilities.log(eventName, 'fontColor:green');
                utilities.log(typeof navigator.camera);
                
                var $body = $('body');
                var $appHeader = $body.find('#appHeader');
                var $appFooter = $body.find('#appFooter');
                var $appCore = $body.find('#appCore');
                var $canvasArea = $appCore.find('#canvasArea');
                var context = $canvasArea[0].getContext('2d');
                var appWidth = $body.innerWidth();
                var appHeight = $body.innerHeight();
                
                // add the takePicture button now the device is ready
                $appFooter.append('<button class="takePicture">take photo</button>');
                
                var headerHeight = $appHeader.outerHeight(true);
                var footerHeight = $appFooter.outerHeight(true);
                
                var canvasWidth = appWidth;
                var canvasHeight = appHeight-(headerHeight+footerHeight);
                
                // adjust the canvas height and width to fill the screen
                // keep some space on the bottom for the buttons
                context.canvas.width = canvasWidth;
                context.canvas.height = canvasHeight;
                
                // on take picture click
                $body.on('click', '.takePicture', function() {
                    
                    utilities.log('takePicture click', 'fontColor:blue');
                    
                    var cameraOptions = {
                        quality: 50,
                        destinationType: navigator.camera.DestinationType.FILE_URI,
                        cameraDirection: navigator.camera.Direction.FRONT
                    };
                    
                    navigator.camera.getPicture(
                        function cameraSuccess(imageData) {
                            
                            utilities.log('cameraSuccess', 'fontColor:green');
                            
                            var image = new Image();
                            
                            image.src = imageData;
                            
                            // as soon as the image got loaded paint it on the
                            // canvas element
                            image.onload = function() {
                                
                                utilities.log('image.onload', 'fontColor:green');
                                
                                // calculate the ratio
                                var ratio;
                                
                                if (image.width > appWidth) {
                                    ratio = appWidth / image.width;
                                } else if (image.height > appHeight) {
                                    ratio = appHeight / image.height;
                                } else {
                                    ratio = 1;
                                }
                                
                                // draw the image onto the canvas
                                context.drawImage(image, 0, 0, image.width * ratio, image.height * ratio);
                                
                                // add the filter button
                                $appFooter.append('<button class="applyFilter">Use filter</button>');
                                
                            };
                            
                        },
                        function cameraError(message) {
                            
                            utilities.log('cameraError: ' + message, 'fontColor:red');
                            
                        },
                        cameraOptions
                    );
                    
                });
                
                var filterId = 1;
                var imageDataBackup;
                
                $body.on('click', '.applyFilter', function() {
                    
                    utilities.log(filterId, 'fontColor:blue');
                    
                    var pixelsCount = canvasWidth * canvasHeight;
                    
                    // first time backup the image data
                    if (imageDataBackup === undefined) {
                        
                        imageDataBackup = context.getImageData(0, 0, canvasWidth, canvasHeight);
                        
                    }
                    
                    var imageData = imageDataBackup;

                    // loop through all the pixels
                    for (var i = 0; i < pixelsCount * 4; i += 4) {
                        
                        // black and white filter
                        if (filterId === 1) {

                            // red bytes
                            var red = imageData.data[i];

                            // green bytes
                            var green = imageData.data[i + 1];

                            // blue bytes
                            var blue = imageData.data[i + 2];

                            // fourth bytes are alpha bytes

                            // add the three values and divide by three
                            // make it an integer.
                            var gray = parseInt((red + green + blue) / 3);

                            // assign average to red, green, and blue.
                            imageData.data[i] = gray;
                            imageData.data[i + 1] = gray;
                            imageData.data[i + 2] = gray;
                            
                        }
                        
                        // invert color filter
                        if (filterId === 2) {
                            
                            imageData.data[i] = 255 - imageData.data[i];
                            imageData.data[i + 1] = 255 - imageData.data[i + 1];
                            imageData.data[i + 2] = 255 - imageData.data[i + 2];
                            
                        }
                        
                        // back to default image
                        if (filterId === 3) {
                            
                            // do nothing just use original pixel colors
                            
                        }
                        
                    }
                    
                    filterId++;
                    
                    // reset the id if too high
                    if (filterId > 3) {
                            
                        filterId = 1;
                            
                    }
                    
                    context.putImageData(imageData, 0, 0);
                    
                });
                
            }
            
        }
    };
    
    app.initialize();
    
});