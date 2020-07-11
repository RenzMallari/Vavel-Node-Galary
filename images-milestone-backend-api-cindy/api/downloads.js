"use strict"
var express = require('express');

var Albums = require('../models/useralbumsmodel');

var router = express.Router();
var fs = require('fs');
var request = require('request');

const path = require('path')
var moment = require('moment');
var _ = require('lodash');
var ftpClient = require('ftp');
var ftpAccess = require('../config/ftp_access');
var easyimg = require('easyimage');
var paypal = require('./paypal.js');
var Promise = require('bluebird');
var routeCache = require('../components/routeCache');
const Downloads = require('../models/downloadmodel');
var zipFolder = require('zip-folder');

const ImageDownload = require('image-downloader')

var getFileExtension = function (filename) {
    return filename.split('.').pop();
}

var deleteFolderRecursive = function(path) {
    if( fs.existsSync(path) ) {
      fs.readdirSync(path).forEach(function(file,index){
        var curPath = path + "/" + file;
        if(fs.lstatSync(curPath).isDirectory()) { // recurse
          deleteFolderRecursive(curPath);
        } else { // delete file
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(path);
    }
};
router.get('/deletefolder/:subpath', function (req, res, next) {

    var _subpath = req.params.subpath;

    var path = ftpAccess.pathRootImg;
    if (_subpath) path = path + '/' + _subpath

    deleteFolderRecursive(path)
    res.send({
        type: 'success'
    })

})
router.get('/downloadphoto/:photoid/:galleryid/:buyerid', function (req, res, next) {

    var _photoid = req.params.photoid;
    var _galleryid = req.params.galleryid;
    var _buyerid = req.params.buyerid;



    var pathDownload = ftpAccess.pathRootImg + _galleryid + '/';

    if (!fs.existsSync(pathDownload)) {
        fs.mkdirSync(pathDownload);
    }
    if (!fs.existsSync(pathDownload)) {
        fs.mkdirSync(pathDownload);
    }
    var _is_download_exist_photo = 0;



    Downloads.esFindOne({
        "bool": {
            "must": [{
                "term": {
                    "_id": _photoid
                }
            }, {
                "term": {
                    "buyer_id": _buyerid
                }
            }, {
                "term": {
                    "gallery_id": _galleryid
                }
            }, {
                "term": {
                    "status": "1"
                }
            }]
        }
    }, function (err, downloadfind) {
        if (err) {
            console.log('Error getting photo', err);
            return res.send({
                "type": 'error',
                msg: err.message || err,
                err: err
            });
        }
        else {
            console.log('downloadfind photo', downloadfind, pathDownload)
            if (downloadfind) {
                _is_download_exist_photo = 1;
                
                ImageDownload.image({
                    url: downloadfind.downloadlink,
                    dest: pathDownload                 // Save to /path/to/dest/image.jpg
                    }).then((data) => {
                        res.send({
                            "type": 'success',
                            msg: data
                        });
                    })
                    .catch((err) => {
                        console.log(err)
                        res.send({
                            "type": 'error',
                            msg: err.message || err,
                            err: err
                        });
                    })


            } else {
                res.send({
                    "type": "error",
                    "_is_download_exist_photo": _is_download_exist_photo,
                    "msg": "Not found"
                });

            }
        }




    });
})
router.get('/downloadalbum/:galleryid/:buyerid', function (req, res, next) {
    var _galleryid = req.params.galleryid;
    var _buyerid = req.params.buyerid;

    var pathDownload = ftpAccess.pathRootImg + _galleryid + '/'
    // console.log(pathDownload)
    if (!fs.existsSync(pathDownload)) {
        fs.mkdirSync(pathDownload);
    }

    var pathImages = pathDownload + 'images/'

    if (!fs.existsSync(pathImages)) {
        fs.mkdirSync(pathImages);
    }
    
    var _is_download_exist_albums = 0;


    // console.log('Let get the photo', req.params);
    Downloads.esFind({
        "bool": {
            "must": [{
                "term": {
                    "buyer_id": _buyerid
                }
            }, {
                term: {
                    "gallery_id": _galleryid
                }
            }, {
                "term": {
                    "type": "album"
                }
            }, {
                "term": {
                    "status": "1"
                }
            }]
        }
    }, function (err, downloadfind) {
        if (err) {
            console.log('Error getting photo', err);
            return res.send({
                "type": 'error',
                msg: err.message || err,
                err: err
            });
        }
        else {
            // console.log('downloadfind album', downloadfind)
            if (downloadfind && downloadfind.length > 0) {
                _is_download_exist_albums = 1;
                var promise = [];
                promise = downloadfind.map(photo => {
                    return new Promise(function (resolve, reject) {
                        ImageDownload.image({
                            url: photo.downloadlink,
                            dest: pathImages                 // Save to /path/to/dest/image.jpg
                        }).then((data) => {
                                resolve(data)
                            })
                            .catch((err) => {
                                reject(err)
                            })

                    })
                })
                Promise.all(promise).then(data => {
                    // console.log(res)

                    zipFolder(pathImages, pathDownload + _galleryid + ".zip", function (err) {
                        if (err) {
                            console.log('oh no!', err);
                            res.send({
                                "type": 'error',
                                msg: err.message || err,
                                err: err
                            })
                        } else {
                            res.send({
                                "type": 'success',
                                "_is_download_exist_albums": _is_download_exist_albums,
                                "path": pathDownload + _galleryid + ".zip"
                            })
                        }

                    })
                })
                .catch((err) => {
                    console.log('catch err: ', err)

                    // if (fs.existsSync(pathDownload)){
                    //     fs.rmdirSync(pathDownload);
                    // }
                    res.send({
                        "type": 'error',
                        msg: err.message || err,
                        err: err
                    })
                })

            } else {

                res.send({
                    "type": "error",
                    "_is_download_exist_albums": _is_download_exist_albums,
                    "msg": "Not found"
                });

            }
        }
    });


});

module.exports = router;
