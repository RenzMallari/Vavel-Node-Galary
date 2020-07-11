module.exports = function (grunt) {
    var pkg = require('./package.json'), // package file
        i;

    grunt.template.addDelimiters('config', '<%asdf', 'asdf%>');

    grunt.initConfig({
        "watch": {
            scripts: {
                files: 'public/js/app/**/**.js',
                tasks: ['concat']
            }
        },
        "cssmin": {
            "options": {
                "report": "gzip"
            },
            "dist": {
                "files": {
                    "public/css/index.min.css": ["public/css/jquery-ui.css", "public/css/application.css", "public/css/d.css", "public/css/override.css", "public/css/main.css", "public/css/dropzone.css", "public/css/jquery.inputfile.css", "public/css/font-awesome.css", "public/css/ng-tags-input.min.css", "public/css/dropzone-fileupload.css", "public/masonary/css/normalize.css", "public/masonary/css/main.css"]
                }
            }
        },
        "uglify": {
            "angular": {
                "options": {
                    "report": "gzip"
                },
                "files": {
                    "public/dist/js/angularapp.min.js": [
                        "public/min-safe/angular.js",
                        "public/min-safe/util-module.js",
                        //    "public/min-safe/frontendapp.js",
                        "public/min-safe/messageModule.js",
                        "public/min-safe/auth-front-module.js"
                    ]
                }
            },
            "app": {
                "options": {
                    "report": "gzip",
                    sourceMap: true,
                },
                "files": {
                    "public/dist/js/index.min.js": [
                        "public/js/cloudinary/blueimp-file-upload/js/vendor/jquery.ui.widget.js",
                        "public/js/cloudinary/blueimp-file-upload/js/jquery.iframe-transport.js",
                        "public/js/cloudinary/blueimp-file-upload/js/jquery.fileupload.js",
                        "public/js/cloudinary/cloudinary_js/js/jquery.cloudinary.js",
                        "public/js/cloudinary/angular/angular-sanitize.js",
                        "public/js/cloudinary/angular-animate/angular-animate.js",
                        "public/js/cloudinary/angular-route/angular-route.js",
                        "public/js/cloudinary/angular-resource/angular-resource.js",
                        "public/js/cloudinary/cloudinary_ng/js/angular.cloudinary.js",
                        "public/js/angular-cookies.js",
                        "public/js/cloudinary/config.js",
                        "public/js/cloudinary/services.js",
                        "public/js/app/customdropzone.js",
                        "public/angular-facebook/lib/angular-facebook.js",
                        "public/js/ng-tags-input.min.js",
                        "public/js/angular-loading-bar.js",
                        "public/js/dirPagination.js",
                        "public/js/jquery.lazyloadxt.js",
                        "public/js/dropzone-fileupload.js",
                        "public/masonary/js/masonry.js",
                        //"public/js/bootstrap.min.js",
                        "public/js/jquery.dataTables.min.js",
                        "public/js/jquery-ui-1.10.4.custom.min.js",
                        "public/js/dataTables.bootstrap-1.10.10.min.js",
                        "public/js/aaaextra.js",
                        "public/js/jquery-migrate-1.2.1.min.js",
                        "public/js/jquery-ui.js",
                        // "public/js/bootstrap.min.js",
                        //    "public/js/jquery.cookie.js",
                        // "public/js/dataTables.bootstrap-1.10.10.min.js",
                        // "public/js/jquery-migrate-1.2.1.min.js",
                        // "public/js/jquery-ui-1.10.4.custom.min.js"
                        "public/js/download2.js.js",
                        "public/js/money.min.js"
                    ]
                }
            }
        },
        ngAnnotate: {
            options: {
                singleQuotes: true
            },
            app: {
                files: {
                    './public/min-safe/angular.js': ['public/js/cloudinary/angular/angular.js'],
                    './public/min-safe/util-module.js': ['public/js/app/util-module.js'],
                    // './public/min-safe/frontendapp.js': ['public/js/app/frontendapp.js'],
                    './public/min-safe/messageModule.js': ['public/js/app/messageModule.js'],
                    './public/min-safe/auth-front-module.js': ['public/js/app/auth-front-module.js']
                }
            }
        },
        "concat": {
            "options": {
                "stripBanners": true,
                "process": true,
                "sourceMap": true
            },
            "app": {
                "src": [
                    "public/dist/js/angularapp.min.js",
                    "public/js/app/frontendapp.js",
                    "public/js/app/constSetting.js",
                    "public/js/app/controllers/**.js",
                    "public/js/app/service/paymentService.js",
                    "public/js/app/service/recaptchaService.js",
                    "public/js/app/service/configService.js",
                    "public/js/app/service/localService.js",
                    "public/js/app/service/albumService.js",
                    "public/js/app/service/collectionService.js",
                    "public/js/app/directive/img-box/img-box.js",
                    "public/js/app/directive/img-update/img-update.js",
                    "public/js/app/directive/album-update/album-update.js",
                    "public/js/app/directive/album-add/album-add.js",
                    "public/js/app/directive/colaction-add/colaction-add.js",
                    "public/js/app/directive/collaction-update/collaction-update.js",
                    "public/js/app/directive/googleplace/googleplace.js",
                    "public/js/app/directive/datepicker/datepicker.js",
                    "public/js/app/directive/image-wall/image-wall.js",
                    "public/js/app/directive/brick-wall/brick-wall.js",
                    "public/js/app/directive/related-photos/directive.js",
                    "public/js/app/service/galleryService.js",
                    "public/js/app/service/gapiService.js",
                    "public/js/app/service/envService.js",
                    "public/js/app/service/headerService.js",
                    "public/js/app/directive/keypress/directive.js",
                    "public/dist/js/index.min.js",
                    "public/bower_components/lodash/dist/lodash.min.js",
                    "public/bower_components/ngmap/build/scripts/ng-map.min.js",
                    "public/bower_components/angular-google-analytics/dist/angular-google-analytics.js",
                    "public/js/download2.js.js",
                    "public/js/angular-recaptcha.min.js"
                ],
                "dest": "public/dist/js/combined.js"
            }
        }
    });

    for (i in pkg.devDependencies) { //iterate through the development dependencies
        if (pkg.devDependencies.hasOwnProperty(i)) { //avoid iteration over inherited object members
            if (i.substr(0, 6) == 'grunt-') { //only load development dependencies that being with "grunt-""
                grunt.loadNpmTasks(i); //load all grunt tasks
            }
        }
    }
    grunt.registerTask('dev', ['cssmin', 'ngAnnotate', 'uglify', 'concat:app']);
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.registerTask('watch', ['cssmin', 'ngAnnotate', 'uglify', 'concat:app', 'watch']);
    //
};
