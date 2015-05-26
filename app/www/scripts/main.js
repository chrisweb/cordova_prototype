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
    utilities.logSpecial = false;

    var app = {
        // cordova filesystem
        filesystem: null,
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
                
                // when building with netbeans there is a problem with
                // the camera plugin, sometimes it does not get installed
                // which results in the camera object to be undefined
                // !build using the command line and everything is fine
                if (typeof navigator.camera === 'undefined') {
                    
                    window.alert('application error camera is undefined');
                    
                }
                
                // retrieve an instance of the filesystem
                window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, this.filesystemSuccess.bind(this), this.filesystemError);
                
                var $body = $('body');
                var $appHeader = $body.find('#appHeader');
                var $appFooter = $body.find('#appFooter');
                var $appCore = $body.find('#appCore');
                var $visibleCanvasArea = $appCore.find('#visibleCanvasArea');
                var context = $visibleCanvasArea[0].getContext('2d');
                var $backupCanvasArea = $appCore.find('#backupCanvasArea');
                var backupContext = $backupCanvasArea[0].getContext('2d');
                var appWidth = $body.innerWidth();
                var appHeight = $body.innerHeight();
                
                // add the takePicture button now the device is ready
                $appFooter.append('<button type="button" class="takePicture btn btn-default btn-lg"><span class="glyphicon glyphicon-camera" aria-hidden="true"></span></button>');
                
                var headerHeight = $appHeader.outerHeight(true);
                var footerHeight = $appFooter.outerHeight(true);
                
                var canvasWidth = appWidth;
                var canvasHeight = appHeight-(headerHeight+footerHeight);
                
                // adjust the canvas height and width to fill the screen
                // keep some space on the bottom for the buttons
                context.canvas.width = canvasWidth;
                context.canvas.height = canvasHeight;
                
                backupContext.canvas.width = canvasWidth;
                backupContext.canvas.height = canvasHeight;
                
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
                                
                                // draw the backup image onto the hidden canvas
                                backupContext.drawImage(image, 0, 0, image.width * ratio, image.height * ratio);
                                
                                // check if the buttons already got added
                                if ($appFooter.find('.applyFilter').length === 0) {
                                
                                    // add the "image manipulation" and "action" buttons
                                    $appFooter.append('<button type="button" class="applyFilter btn btn-default btn-lg"><span class="glyphicon glyphicon-tint" aria-hidden="true"></span></button>');
                                    $appFooter.append('<button type="button" class="addStickers btn btn-default btn-lg"><span class="glyphicon glyphicon-sunglasses" aria-hidden="true"></span></button>');
                                    $appFooter.append('<button type="button" class="saveImage btn btn-default btn-lg"><span class="glyphicon glyphicon-floppy-save" aria-hidden="true"></span></button>');
                                    $appFooter.append('<button type="button" class="undoChanges btn btn-default btn-lg"><span class="glyphicon glyphicon-erase" aria-hidden="true"></span></button>');
                                
                                }
                                
                            };
                            
                        },
                        function cameraError(message) {
                            
                            utilities.log('cameraError: ' + message, 'fontColor:red');
                            
                        },
                        cameraOptions
                    );
                    
                });
                
                var filterId = 1;
                
                $body.on('click', '.applyFilter', function() {
                    
                    utilities.log(filterId, 'fontColor:blue');
                    
                    var pixelsCount = canvasWidth * canvasHeight;
                    
                    // get the original "backupped" image data
                    var imageData = backupContext.getImageData(0, 0, canvasWidth, canvasHeight);

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
                    
                    // put image onto canvas
                    context.putImageData(imageData, 0, 0);
                    
                });
                
                $body.on('click', '.addStickers', function() {
                    
                    
                    
                });
                
                var that = this;
                
                $body.on('click', '.saveImage', function() {
                    
                    that.filesystem.root.getFile(
                        'beautifyme_' + utilities.generateUUID() + '.png',
                        {
                            create: true,
                            exclusive: false
                        },
                        that.createFileSuccess.bind(that),
                        that.createFileError
                    );
                    
                });
                
                $body.on('click', '.undoChanges', function() {
                    
                    // reset the filterId
                    filterId = 1;
                    
                    // get the original "backupped" image data
                    var imageData = backupContext.getImageData(0, 0, canvasWidth, canvasHeight);
                    
                    // put image onto canvas
                    context.putImageData(imageData, 0, 0);
                    
                });
                
            }
            
        },
        filesystemSuccess: function(filesystem) {
            
            this.filesystem = filesystem;
            
        },
        filesystemError: function(error) {
            
            window.alert('getting filesystem failed');
            
            utilities.log(error);
            
        },
        createFileSuccess: function(filePointer) {
            
            filePointer.createWriter(this.fileWriterSuccess, this.fileWriterError);
            
        },
        createFileError: function(error) {
            
            window.alert('creating file failed');
            
            utilities.log(error);
            
        },
        fileWriterSuccess: function(writer) {
            
            var $body = $('body');
            var $appCore = $body.find('#appCore');
            var $visibleCanvasArea = $appCore.find('#visibleCanvasArea');
            
            var photoDataUrl = $visibleCanvasArea[0].toDataURL('image/png');
            
            var photoString = photoDataUrl.replace('data:image/png;base64,', '');
            
            // https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/atob
            //var photoBlob = new Blob([window.atob(photoString)],  {type: 'image/png', encoding: 'utf-8'});
            
            // solution from http://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript/16245768#16245768
            var sliceSize = 512;

            var byteCharacters = atob(photoString);
            var byteArrays = [];

            for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                var slice = byteCharacters.slice(offset, offset + sliceSize);

                var byteNumbers = new Array(slice.length);
                for (var i = 0; i < slice.length; i++) {
                    byteNumbers[i] = slice.charCodeAt(i);
                }

                var byteArray = new Uint8Array(byteNumbers);

                byteArrays.push(byteArray);
            }

            var photoBlob = new Blob(byteArrays, {type: 'image/png', encoding: 'utf-8'});
            
            writer.write(photoBlob);
            
        },
        fileWriterError: function(error) {
            
            window.alert('creating writer failed');
            
            utilities.log(error);
            
        }
        
    };
    
    app.initialize();
    
});