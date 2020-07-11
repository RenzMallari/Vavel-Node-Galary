//'use strict';

/**
 * Gallery Service
 * @description it gets and caches user images
 * @param $http - angular $http service
 * @param $q - angular $q service
 * @param $interval - angular $interval service
 * @param myAuth
 * @returns {{getAllUserPhotos: getAllUserPhotos, getUserImages: getUserImages, swap: swap, save: save, images: images}}
 */
function galleryService($http, $q, $interval, myAuth) {

    var galleryName = 'galleryImages';
    var clearTimeout = 2; // minutes

    // clear cache every clearTimeout minutes
    $interval(function() {
        service.swap();
    }, clearTimeout * 60000)

    var service = {

        /**
         * Receive user images
         * @param userId {String} - user id hash
         * @returns {d.promise}
         */
        getAllUserPhotos: function(userId) {
            var cachedImages = [];
            var that = this;
            var d = $q.defer();
            $http({
                method: "GET",
                url: myAuth.baseurl + "album/getalbums/" + userId
            }).success(function(data) {
                var lastimage = null;
                try {
                    data.allalbums.forEach(function(album, key) {
                        album.images.forEach(function(image, ikey) {
                            if (key || ikey) { // first
                                image.next = {
                                    id: lastimage.publicid,
                                    album: lastimage.albumid
                                };
                            }
                            if (lastimage) { // next
                                lastimage.previous = {
                                    id: image.publicid,
                                    album: album._id
                                };
                            }
                            image.albumid = album._id;
                            cachedImages.push(image);
                            lastimage = image;
                        });
                    });
                    var result = that.images();
                    result[userId] = cachedImages;
                    d.resolve(result);
                    that.save(result);
                } catch (e) {
                    d.reject(e);
                }
            });
            return d.promise;
        },

        findById: function(imageId, userId) {
            var d = $q.defer();
            this.getUserImages(userId).then(function(data) {
                var found = null;
                for (var key in data) {
                    var img = data[key];
                    if (imageId == img.publicid) {
                        found = img;
                        break;
                    }
                }
                d.resolve(found);
            }, function(error) {
                d.reject(error);
            });
            return d.promise;
        },

        /**
         * Returns cached images
         * @param userId {String} - user id hash
         * @returns {d.promise}
         */
        getUserImages: function(userId) {
            var d = $q.defer();
            if (this.images()[userId]) {
                d.resolve(this.images()[userId]);
            } else {
                this.getAllUserPhotos(userId).then(function(data) {
                    d.resolve(data[userId]);
                });
            }
            return d.promise;
        },

        /**
         * Remove cached images
         */
        swap: function() {
            if (window.localStorage) {
                window.localStorage.removeItem(galleryName)
            }
        },

        /**
         * Saves/updates cached images
         * @param images {Object}, view {imageId1: image1, imageId2: image2, ...}
         */
        save: function(images) {
            if (window.localStorage) {
                window.localStorage.setItem(galleryName, JSON.stringify(images))
            }
        },

        /**
         * Returns cached images
         * @returns {Storage|{}}
         */
        images: function() {
            return window.localStorage && JSON.parse(window.localStorage.getItem(galleryName)) || {};
        }

    };
    return service;
};
galleryService.$inject = ['$http', '$q', '$interval', 'myAuth'];
angular.module("photographer").factory('galleryService', galleryService);
