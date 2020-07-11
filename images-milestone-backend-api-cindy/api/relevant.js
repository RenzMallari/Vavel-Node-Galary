var express = require('express');
var async = require('async');
var md5 = require('md5');
var mongoose = require('mongoose');
var Relevant = require('../models/relevantmodel');
var router = express.Router();

router.post('/addkeywords', function (req, res, next) {
    var _relevant = new Relevant({
        'userid': 'dsdfsdf',
	'keyword':res.body.keyword
    });

    _relevant.save(function(err,gallery) {
        if (err) res.send({"type":"error","msg":err});
        else
        {
            res.send({"type":"success","msg":'Successfully Uploaded'});
        }
     });

});

module.exports = router;
