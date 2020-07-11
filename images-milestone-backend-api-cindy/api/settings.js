var express = require('express');
var md5 = require('md5');
var mongoose = require('mongoose');
var Settings = require('../models/settingsmodel');
var router = express.Router();
var easyimg = require('easyimage');
var fs = require('fs');
var request = require('request');

var ftpClient = require('ftp');
var ftpAccess = require('../config/ftp_access');

router.get('/getsettingsbyid/:id', function (req, res, next) {
    var _editid = req.params.id;


    Settings.esFindOne({
        term: { edit: _editid }
        /*Settings.findOne({
            "edit": _editid*/
    }, function (err, settings) {
        if (err) return res.send('error');
        res.send(JSON.stringify(settings));
    })
});

router.post('/updatesettings', function (req, res, next) {
    var _settingsid = req.body._id;
    var adminpercentage = req.body.adminpercentage;
    var adminpercentageperimage = req.body.adminpercentageperimage;
    var adminemail = req.body.adminemail;
    var adminpaypalid = req.body.adminpaypalid;
    var adminphonenumber = req.body.adminphonenumber;
    var image = req.body.image;
    var imageid = req.body.imageid;
    var facebook = req.body.facebook;
    var twitter = req.body.twitter;
    var instagram = req.body.instagram;
    var contactno = req.body.contactno;
    var contactemail = req.body.contactemail;
    var copyright = req.body.copyright;
    var noscriptcontent = req.body.noscriptcontent;

    if (imageid == '' || imageid == undefined) {

    }
    else {
        image = imageid;
    }

    Settings.esUpdateOne({
        '_id': _settingsid
    }, {
        $set:
        {
            'adminpercentage': adminpercentage,
            'adminpercentageperimage': adminpercentageperimage,
            'adminemail': adminemail,
            'adminpaypalid': adminpaypalid,
            'adminphonenumber': adminphonenumber,
            'image': image,
            'facebook': facebook,
            'twitter': twitter,
            'instagram': instagram,
            'contactno': contactno,
            'contactemail': contactemail,
            'copyright': copyright,
            'noscriptcontent': noscriptcontent,
            'edit': 1
        }
    }, function (err, doc) {
        if (err) {
            res.send('error');
        } else {
            res.send('success');
        }
    });
});
module.exports = router;
