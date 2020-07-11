'use strict';
/**
 * Related photos directive
 * @example <related-photos title="'Related photos'" user-id="'56e174b00540638e436b6d8e'" except-photo-id="'56e6e534b28d1b65266fb918'" link="'/details/:albumid/:imageid'" count="9"></related-photos>
 * @param galleryService
 * @param configService
 * @returns {{restrict: string, scope: {title: string, userId: string, exceptPhotoId: string, link: string, count: string}, link: link, templateUrl: string}}
 */
function relatedPhotos(galleryService, configService) {
    return {
        restrict: 'E',
        scope: {
            title: '=', // Title for block
            userId: '=', // author id
            exceptPhotoId: '=', // except current photo
            galleryId: '=', // gallery id
            link: '=', // link template
            count: '@' // count of photos
        },
        link: function(scope) {
            scope.config = configService;
            scope.$watch('userId', function(n, o) {
                if (n && n != o) {
                    galleryService.getUserImages(n).then(function(images) {
                        var i = scope.count;

                        var album = images.filter(img => img.albumid == scope.galleryId && img.publicid != scope.exceptPhotoId);

                        scope.relatedPhotos = [];
                        var keys = random(album);
                        for (var key in keys) {
                            var image = album[keys[key]];
                            image.link = scope.link.replace(':imageid', image.publicid).replace(':albumid', image.albumid);
                            scope.relatedPhotos.push(image);
                        }
                    });
                }
            })

            function random(obj) {
                var keys = Object.keys(obj);
                shuffle(keys);
                keys = keys.slice(0, scope.count);
                return keys;
            }

            function shuffle(a) {
                var j, x, i;
                for (i = a.length; i; i -= 1) {
                    j = Math.floor(Math.random() * i);
                    x = a[i - 1];
                    a[i - 1] = a[j];
                    a[j] = x;
                }
            }
        },
        templateUrl: '/js/app/directive/related-photos/template.html',
    };
}
relatedPhotos.$inject = ['galleryService', 'configService'];
angular.module('photographer').directive('relatedPhotos', relatedPhotos);
