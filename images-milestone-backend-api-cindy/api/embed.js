"use strict"
var express = require('express');
var UserGalleriers = require('../models/usergalleriesmodel');
var Albums = require('../models/useralbumsmodel');
var User = require('../models/usersmodel');

var routeCache = require('../components/routeCache');

require('../events/collectionEvent');

require('../events/albumEvent');
var router = express.Router();

router.get('/:galleryid/:id', function(req, res, next) {
    var _id = req.params.id;
    var _galleryid = req.params.galleryid;
    let link = `https://images.vavel.com/details/${_galleryid}/${_id}`
    
    UserGalleriers.findOne({
        "imagepublicid": _id
    }, function(err, usergallery) {
        if (err) {
            res.render('embed', {notFound: true})
            // res.send({
            //     "type": "error",
            //     "msg": err.message,
            //     "error": err,
            // });
        } else if (usergallery) {
            User.findOne({
                "_id": usergallery.userid
            }, function(error, user) {
                if(error) {
                    res.render('embed', {notFound: true})
                    // res.send({
                    //     "type": "error",
                    //     "msg": error.message,
                    //     "error": error,
                    // });
                }
                else {
                    usergallery.link = link
                    usergallery.url_image = 'https://stock.vavel.com/s/photoImages/bunch/h5_' + usergallery.publicid + '.' + img.fileExtension
                    res.render('embed', usergallery)
                }

            });
        } else {
            Albums.findOne({
                "_id": _galleryid,
                "images.publicid": _id
            }, function(err, useralbum) {
                if (err) {
                    console.log('Error:', err);
                    res.render('embed', {notFound: true})
                    // console.log('Error getting album:', err);
                    // res.send({
                    //     "type": "error",
                    //     "msg": err
                    // });
                } else if (useralbum) {
                    // console.log('Found useralbum:', useralbum);
                    useralbum.images.forEach(function(img, ind) {
                        if (_id == img.publicid) {
                            User.findOne({
                                "_id": useralbum.userid
                            }, function(error, user) {
                                if(err) {
                                    res.render('embed', {notFound: true})
                                }
                                else {
                                    
                                    img.url_image = 'https://stock.vavel.com/s/photoImages/bunch/h5_' + img.publicid + '.' + img.fileExtension
                                    
                                    var albmdet = {
                                        '_id': _galleryid,
                                        'imagepublicid': img.publicid,
                                        'caption': img.caption,
                                        'tags': img.tags,
                                        'comments': img.comments,
                                        'imagewidth': img.imagewidth,
                                        'imageheight': img.imageheight,
                                        'userid': img.userid,
                                        'fileExtension': img.fileExtension,
                                        'commerciallicense': useralbum.commerciallicense,
                                        'editoriallicense': useralbum.editoriallicense,
                                        'albumaddress': useralbum.albumaddress,
                                        'price': img.price,
                                        'images': useralbum.images,
                                        'soldout': img.soldout,
                                        'sellonetime': img.sellonetime,
                                        'album': useralbum,
                                        'name': useralbum.name,
                                        'url_image': img.url_image,
                                        'link': link
                                    };
                                    res.render('embed', albmdet)
                                }
                                // res.send({
                                //     "type": "success",
                                //     "msg": albmdet,
                                //     "user": user
                                // });

                            });
                        }
                    });
                } else {
                    // res.send({
                    //     "type": "error",
                    //     "msg": 'Not Found'
                    // });

                    res.render('embed', {notFound: true})
                }
            });
        }
    });
})

module.exports = router;