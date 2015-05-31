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
        // alert timeout id
        timeoutId: null,
        // initial filter id
        filterId: 1,
        // initial sticker id
        stickerId: 1,
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
                    
                    this.showAlert('application error camera is undefined', 'error');
                    
                }
                
                // retrieve an instance of the filesystem
                window.requestFileSystem(window.LocalFileSystem.PERSISTENT, 0, this.filesystemSuccess.bind(this), this.filesystemError.bind(this));
                
                var $body = $('body');
                var $appHeader = $body.find('#appHeader');
                var $appFooter = $body.find('#appFooter');
                var $appCore = $body.find('#appCore');
                var $visibleCanvasArea = $appCore.find('#visibleCanvasArea');
                var $backupCanvasArea = $appCore.find('#backupCanvasArea');
                
                this.context = $visibleCanvasArea[0].getContext('2d');
                this.backupContext = $backupCanvasArea[0].getContext('2d');
                this.appWidth = $body.innerWidth();
                this.appHeight = $body.innerHeight();
                
                // add the takePicture button now the device is ready
                $appFooter.append('<button type="button" class="takePicture btn btn-default btn-lg"><span class="glyphicon glyphicon-camera" aria-hidden="true"></span></button>');
                
                var headerHeight = $appHeader.outerHeight(true);
                var footerHeight = $appFooter.outerHeight(true);
                
                this.canvasWidth = this.appWidth;
                this.canvasHeight = this.appHeight-(headerHeight+footerHeight);
                
                // adjust the canvas height and width to fill the screen
                // keep some space on the bottom for the buttons
                this.context.canvas.width = this.canvasWidth;
                this.context.canvas.height = this.canvasHeight;
                
                this.backupContext.canvas.width = this.canvasWidth;
                this.backupContext.canvas.height = this.canvasHeight;
                
                // buttons click event listeners
                $body.on('click', '.takePicture', this.takePicture.bind(this));
                $body.on('click', '.applyFilter', this.applyFilter.bind(this));
                $body.on('click', '.addStickers', this.addStickers.bind(this));
                $body.on('click', '.saveImage', this.saveImage.bind(this));
                $body.on('click', '.undoChanges', this.undoChanges.bind(this));
                
            }
            
        },
        takePicture: function() {
                    
            utilities.log('takePicture click', 'fontColor:blue');

            var cameraOptions = {
                quality: 50,
                destinationType: navigator.camera.DestinationType.FILE_URI,
                cameraDirection: navigator.camera.Direction.FRONT
            };

            var that = this;

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
                        
                        if (image.width > that.appWidth) {
                            ratio = that.appWidth / image.width;
                        } else if (image.height > that.appHeight) {
                            ratio = that.appHeight / image.height;
                        } else {
                            ratio = 1;
                        }
                        
                        // draw the image onto the canvas
                        that.context.drawImage(image, 0, 0, image.width * ratio, image.height * ratio);
                        
                        // draw the backup image onto the hidden canvas
                        that.backupContext.drawImage(image, 0, 0, image.width * ratio, image.height * ratio);
                        
                        var $body = $('body');
                        var $appFooter = $body.find('#appFooter');
                        
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

        },
        applyFilter: function(increment) {
            
            // only if increment is undefined or true
            if (increment !== false) {
            
                this.filterId++;
                
                // reset the sticker counter
                this.stickerId = 1;
                
            }
            
            // reset the id if too high
            if (this.filterId > 8) {
                
                this.filterId = 1;
                
            }
            
            utilities.log('filtering: ' + this.filterId, 'fontColor:blue');
            
            var pixelsCount = this.canvasWidth * this.canvasHeight;
            
            // get the original "backupped" image data
            var imageData = this.backupContext.getImageData(0, 0, this.canvasWidth, this.canvasHeight);
            
            // no filter
            if (this.filterId === 1) {
                
                // do nothing just use original pixel colors
                
                // show the success alert
                this.showAlert('removed filters', 'success');
                
            }
            
            // invert color filter
            if (this.filterId === 2) {
                
                // the matrix for inverted colors
                var invertedcolorsMatrix = [
                   -1,  0,  0, 0, 255,
                    0, -1,  0, 0, 255,
                    0,  0, -1, 0, 255,
                    0,  0,  0, 1,   0
                ];
                
                // apply the matrix
                imageData = this.applyFilterMatrix(imageData, invertedcolorsMatrix);
                
                // show the success alert
                this.showAlert('inverted colors filter', 'success');
                
            }
            
            // sepia filter
            if (this.filterId === 3) {
                
                // the matrix for sepia
                var sepiaMatrix = [
                    0.393, 0.769, 0.189, 0, 0,
                    0.349, 0.686, 0.168, 0, 0,
                    0.272, 0.534, 0.131, 0, 0,
                    0,     0,     0,     1, 0
                ];
                
                // apply the matrix
                imageData = this.applyFilterMatrix(imageData, sepiaMatrix);
                
                // show the success alert
                this.showAlert('sepia filter', 'success');
                
            }
            
            // red filter
            if (this.filterId === 4) {
                
                // the matrix for sepia
                var redMatrix = [
                    0.333, 0.333, 0.333, 0, 0,
                    0    , 0    , 0    , 0, 0,
                    0    , 0    , 0    , 0, 0,
                    0,     0,     0,     1, 0
                ];
                
                // apply the matrix
                imageData = this.applyFilterMatrix(imageData, redMatrix);
                
                // show the success alert
                this.showAlert('red filter', 'success');
                
            }
            
            // green filter
            if (this.filterId === 5) {
                
                // the matrix for sepia
                var greenMatrix = [
                    0    , 0    , 0    , 0, 0,
                    0.333, 0.333, 0.333, 0, 0,
                    0    , 0    , 0    , 0, 0,
                    0,     0,     0,     1, 0
                ];
                
                // apply the matrix
                imageData = this.applyFilterMatrix(imageData, greenMatrix);
                
                // show the success alert
                this.showAlert('green filter', 'success');
                
            }
            
            // blue filter
            if (this.filterId === 6) {
                
                // the matrix for sepia
                var blueMatrix = [
                    0    , 0    , 0    , 0, 0,
                    0    , 0    , 0    , 0, 0,
                    0.333, 0.333, 0.333, 0, 0,
                    0,     0,     0,     1, 0
                ];
                
                // apply the matrix
                imageData = this.applyFilterMatrix(imageData, blueMatrix);
                
                // show the success alert
                this.showAlert('blue filter', 'success');
                
            }
            
            // black and white filter
            if (this.filterId === 7) {
                
                // the matrix for black and white
                var blackandwhiteMatrix = [
                    0.333, 0.333, 0.333, 0, 0,
                    0.333, 0.333, 0.333, 0, 0,
                    0.333, 0.333, 0.333, 0, 0,
                    0,     0,     0,     1, 0
                ];
                
                // apply the matrix
                imageData = this.applyFilterMatrix(imageData, blackandwhiteMatrix);

                // show the success alert
                this.showAlert('black and white filter', 'success');

            }
            
            // fancy filter
            if (this.filterId === 8) {
                
                // the matrix for sepia
                var fancyMatrix = [
                    1,  1,  1, 0, 0,
                    1,  1, -1, 0, 0,
                   -1, -1, -1, 0, 0,
                    0,  0,  0, 1, 0
                ];
                
                // apply the matrix
                imageData = this.applyFilterMatrix(imageData, fancyMatrix);
                
                // show the success alert
                this.showAlert('fancy filter', 'success');
                
            }

            // put image onto canvas
            this.context.putImageData(imageData, 0, 0);

        },
        addStickers: function() {
            
            this.stickerId++;
            
            if (this.stickerId > 4) {

                this.stickerId = 1;

            }
            
            // get the original image
            var imageData = this.backupContext.getImageData(0, 0, this.canvasWidth, this.canvasHeight);
            
            // reset the image
            this.context.putImageData(imageData, 0, 0);
            
            // apply the filter if any got added previously
            this.applyFilter.call(this, false);
            
            // default no sticker
            if (this.stickerId === 1) {
                
                // do nothing just use original image

                // show the success alert
                this.showAlert('no sticker', 'success');
                
            }
            
            if (this.stickerId === 2) {
                
                this.addStickerMustache();

            }
            
            if (this.stickerId === 3) {
                
                this.addStickerGlasses();
                
            }
            
            if (this.stickerId === 4) {
                
                this.addStickerMustache();
                this.addStickerGlasses();
                
            }

        },
        addStickerMustache: function() {
            
            // create a new image object
            var stickerImage = new Image();
            
            var that = this;
            
            // the stiker path
            stickerImage.src = 'stickers/mustache.png';

            // excute when image finished loading
            stickerImage.onload = function() {

                // calculate the ratio based on the canvas size
                // to be able to scale the sticker image
                var ratio;

                if (stickerImage.width > that.appWidth) {
                    ratio = that.appWidth / stickerImage.width;
                } else if (stickerImage.height > that.appHeight) {
                    ratio = that.appHeight / stickerImage.height;
                } else {
                    ratio = 1;
                }

                // calculate the sticker dimensions
                var stickerWidth = stickerImage.width*ratio;
                var stickerHeight = stickerImage.height*ratio;

                // calculate the sticker position on the canvas
                var positionX = (that.canvasWidth-stickerWidth)/2;
                var positionY = (that.canvasHeight-stickerHeight)/1.2;

                // add the sunglasses image to the canvas
                that.context.drawImage(stickerImage, positionX, positionY, stickerWidth, stickerHeight);
                
                // show the success alert
                that.showAlert('mustache sticker added', 'success');

            };
            
        },
        addStickerGlasses: function() {
            
            // create a new image object
            var stickerImage = new Image();
            
            var that = this;
            
            // the stiker path
            stickerImage.src = 'stickers/glasses.png';

            // excute when image finished loading
            stickerImage.onload = function() {

                // calculate the ratio based on the canvas size
                // to be able to scale the sticker image
                var ratio;

                if (stickerImage.width > that.appWidth) {
                    ratio = that.appWidth / stickerImage.width;
                } else if (stickerImage.height > that.appHeight) {
                    ratio = that.appHeight / stickerImage.height;
                } else {
                    ratio = 1;
                }

                // calculate the sticker dimensions
                var stickerWidth = stickerImage.width*ratio;
                var stickerHeight = stickerImage.height*ratio;

                // calculate the sticker position on the canvas
                var positionX = (that.canvasWidth-stickerWidth)/2;
                var positionY = (that.canvasHeight-stickerHeight)/2.1;

                // add the sunglasses image to the canvas
                that.context.drawImage(stickerImage, positionX, positionY, stickerWidth, stickerHeight);

                // show the success alert
                that.showAlert('glasses sticker added', 'success');

            };
            
        },
        saveImage: function() {
                    
            this.filesystem.root.getFile(
                'beautifyme_' + utilities.generateUUID() + '.png',
                {
                    create: true,
                    exclusive: false
                },
                this.createFileSuccess.bind(this),
                this.createFileError.bind(this)
            );

        },
        undoChanges: function() {
                    
            // reset the this.filterId
            this.filterId = 1;
            
            // get the original "backupped" image data
            var imageData = this.backupContext.getImageData(0, 0, this.canvasWidth, this.canvasHeight);

            // put image onto canvas
            this.context.putImageData(imageData, 0, 0);

            this.showAlert('image reset', 'success');

        },
        applyFilterMatrix: function(imageData, filterMatrix) {
            
            var i;
            var pixelsCount = imageData.data.length;
            
            for (i = 0; i < pixelsCount; i += 4) {
                
                var red = imageData.data[i];
                var green = imageData.data[i + 1];
                var blue = imageData.data[i + 2]; 
                var alpha = imageData.data[i + 3];

                imageData.data[i]   = red * filterMatrix[0] + green * filterMatrix[1] + blue * filterMatrix[2] + alpha * filterMatrix[3] + filterMatrix[4];
                imageData.data[i+1] = red * filterMatrix[5] + green * filterMatrix[6] + blue * filterMatrix[7] + alpha * filterMatrix[8] + filterMatrix[9];
                imageData.data[i+2] = red * filterMatrix[10]+ green * filterMatrix[11]+ blue * filterMatrix[12]+ alpha * filterMatrix[13]+ filterMatrix[14];
                imageData.data[i+3] = red * filterMatrix[15]+ green * filterMatrix[16]+ blue * filterMatrix[17]+ alpha * filterMatrix[18]+ filterMatrix[19];
                
            }
            
            return imageData;
            
        },
        filesystemSuccess: function(filesystem) {
            
            utilities.log(filesystem.name);
            
            this.filesystem = filesystem;
            
        },
        filesystemError: function(error) {
            
            this.showAlert('getting filesystem failed', 'error');
            
            utilities.log(error);
            
        },
        createFileSuccess: function(filePointer) {
            
            filePointer.createWriter(this.fileWriterSuccess.bind(this), this.fileWriterError.bind(this));
            
        },
        createFileError: function(error) {
            
            this.showAlert('creating file failed', 'error');
            
            utilities.log(error);
            
        },
        fileWriterSuccess: function(writer) {
            
            var $body = $('body');
            var $appCore = $body.find('#appCore');
            var $visibleCanvasArea = $appCore.find('#visibleCanvasArea');
            
            var photoDataUrl = $visibleCanvasArea[0].toDataURL('image/png');
            
            var photoString = photoDataUrl.replace('data:image/png;base64,', '');
            
            // solution from http://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript/16245768#16245768
            var sliceSize = 512;

            // https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/atob
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
            
            var that = this;
            
            writer.onwriteend = function() {
                
                that.showAlert('image saved', 'success');
                
            };
            
        },
        fileWriterError: function(error) {
            
            this.showAlert('creating writer failed', 'error');
            
            utilities.log(error);
            
        },
        showAlert: function(message, type) {
            
            var $body = $('body');
            var $alert = $body.find('.alert');
            
            // remove all previously added "alert style" classes
            $alert.removeClass('alert-success');
            $alert.removeClass('alert-danger');
            
            // set the alert message
            $alert.text(message);
            
            // choose the "alert style" class based on the type
            if (type === undefined || type === 'success') {
                
                $alert.addClass('alert-success');
                
            } else {
                
                $alert.addClass('alert-danger');
                
            }
            
            // show the alert
            $alert.removeClass('hidden');
            
            clearTimeout(this.timeoutId);
            
            // hide it after two seconds
            this.timeoutId = setTimeout(function() {
                $alert.addClass('hidden');
            }, 2000);
            
        }
        
    };
    
    app.initialize();
    
});