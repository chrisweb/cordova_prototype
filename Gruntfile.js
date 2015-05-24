'use strict';

module.exports = function(grunt) {
    
    // RTFM: http://gruntjs.com/sample-gruntfile
    
    // project configuration
    grunt.initConfig({
        
        packageJson: grunt.file.readJSON('package.json'),

        config: {
            'www': 'app/www',
            'node_modules': 'node_modules',
            'sass_source': 'auto'
        },
        
        // js hint
        // ! run this first, if linting fails the script will abort
        // https://github.com/gruntjs/grunt-contrib-jshint
        // ! js hint options: http://www.jshint.com/docs/options/
        // templates directory gets ignored as templates get build by
        // grunt-contrib-jst which creates files that don't follow our rules
        jshint: {
            src: [
                'Gruntfile.js',
                
                // scripts
                '<%= config.www %>/scripts/*.js',
                '<%= config.www %>/scripts/**/*.js'
            ],
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish'),
                ignores: [
                    '<%= config.www %>/scripts/vendor/*.js',
                    '<%= config.www %>/scripts/vendor/**/*.js'
                ]
            }
        },
        
        // require js build generator
        // https://github.com/gruntjs/grunt-contrib-requirejs
        requirejs: {
            // www
            wwwBuild: {
                options: {
                    baseUrl: '<%= config.scripts_path %>',
                    mainConfigFile: '<%= config.scripts_path %>/www/main.js',
                    name: 'www/main',
                    preserveLicenseComments: false,
                    useStrict: false, // remove use strict in production
                    out: '<%= config.scripts_path %>/www/main-build.js',
                    findNestedDependencies: true,
                    optimize: 'uglify2',
                    uglify2: {
                        output: {
                            beautify: false
                        }
                    },
                    done: function(done, output) {
                        var duplicates = require('rjs-build-analysis').duplicates(output);

                        if (duplicates.length > 0) {
                            grunt.log.subhead('Duplicates found in requirejs build:');
                            grunt.log.warn(duplicates);
                            done(new Error('r.js built duplicate modules, please check the excludes option.'));
                        }

                        done();
                    }
                }
            }
        },
        
        // compiles Sass to CSS and generates necessary files if requested
        // nonull warns if file does not exist but does not stop task
        // http://gruntjs.com/configuring-tasks
        // https://github.com/gruntjs/grunt-contrib-watch/issues/183
        sass: {
            bootstrap: {
                options: {
                    unixNewlines: true,
                    trace: true,
                    quiet: false,
                    stopOnError: true,
                    precision: 10,
                    sourcemap: '<%= config.sass_source %>'
                },
                files: [{
                    nonull: true,
                    expand: true,
                    cwd: '<%= config.www %>/stylesheets/sass',
                    src: ['main.scss'],
                    dest: '<%= config.www %>/stylesheets',
                    ext: '.css'
                }]
            }
        },
        
        // copy files
        // https://github.com/gruntjs/grunt-contrib-copy
        copy: {
            vendorJQuery: {
                expand: true,
                cwd: '<%= config.node_modules %>/jquery/dist/',
                src: 'jquery.js',
                dest: '<%= config.www %>/scripts/vendor/jquery/'
            },
            vendorRequire: {
                expand: true,
                cwd: '<%= config.node_modules %>/requirejs/',
                src: 'require.js',
                dest: '<%= config.www %>/scripts/vendor/requirejs/'
            },
            vendorUtilities: {
                expand: true,
                cwd: '<%= config.node_modules %>/chrisweb-utilities.js/',
                src: 'utilities.js',
                dest: '<%= config.www %>/scripts/vendor/chrisweb-utilities/'
            }
        },
        
        // watches files for changes and runs tasks based on the changed files
        watch: {
            sass: {
                files: [
                    '<%= config.www %>/stylesheets/sass/main.scss',
                    '<%= config.www %>/stylesheets/sass/_app.scss'
                ],
                tasks: ['sass']
            },
            watchReload: {
                files: [
                    'Gruntfile.js',
                    '<%= config.www %>/stylesheets/sass/main.scss'
                ],
                options: {
                    reload: true
                }
            }
        }
        
    });
    
    // grunt plugins loading
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    
    // grunt tasks
    grunt.registerTask('default', ['copy', 'jshint', 'sass']);
    
};