var express = require('express');
var md5 = require('md5');
var mongoose = require('mongoose');
var Language = require('../models/languagesmodel');
var router = express.Router();


router.get('/getalllanguages', function(req, res, next) {

    Language.esFind({
     "bool" : {
            "must" : [
              {"term" : { "isdeleted" : false  }},
              {"term" : { "isactive" : true  }}
            ]
          }
    /*Language.find({
        "isactive": true,
        "isdeleted": false*/
    }, function(err, language) {
        if (err) return res.send('error');
        res.send(language);
    });
});

router.get('/getlanguagebyid/:id', function(req, res, next) {
    var _languageid = req.params.id;
    Language.esFindOne({
      term : { _id: _languageid }
    /*Language.findOne({
        "_id": _languageid*/
    }, function(err, settings) {
        if (err) return res.send('error');
        res.send(settings);
    })
});

router.get('/insertlanguage/:languagename/:languageshostname', function(req, res, next) {

    console.log("avik");
	var languagename = req.params.languagename;
	var languageshostname = req.params.languageshostname;

    var _settings = new Language({
		'languagename': languagename,
		'languageshostname': languageshostname
    });


    _settings.save(function(err) {
        if (err) res.send('error');
    });
    console.log('success');
    res.send('success');

});

router.get('/updatelanguage/:id/:languagename/:languageshostname', function(req, res, next) {

    var _languageid = req.params.id;
	var languagename = req.params.languagename;
	var languageshostname = req.params.languageshostname;


    Language.esUpdateOne({
        '_id': _languageid
    }, {
        $set: {
		//'roleid': roleid,
		'languagename': languagename,
		'languageshostname': languageshostname
        }
    }, function(err, doc) {
        if (err) {
            res.send('error');
        } else {
            res.send('success');
        }

    });

});
router.get('/deletelanguage/:id', function(req, res, next) {
    var _languageid = req.params.id;
    Language.esUpdateOne({
        '_id': _languageid
    }, {
        $set: {
            'isdeleted': true
        }
    }, function(err, doc) {
        if (err) {
            res.send('error');
        } else {
            res.send('success');
        }

    });

});



module.exports = router;
