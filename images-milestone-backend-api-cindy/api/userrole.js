var express = require('express');
var md5 = require('md5');
var mongoose = require('mongoose');
var Userroles = require('../models/userrolesmodel');
var router = express.Router();

router.get('/getallroles', function(req, res, next) {
    Userroles.esFind({
      "bool" : {
            "must" : [
              {"term" : { "isdeleted" : false  }},
              {"term" : { "isactive" : true  }}
            ]
          }
    /*Userroles.find({
        "isactive": true,
        "isdeleted": false*/
    }, function(err, usrrole) {
        if (err) return res.send('error');
        res.send(usrrole);
    });
});

router.get('/getrolebyid/:id', function(req, res, next) {
    var _roleid = req.params.id;

    Userroles.esFindOne({
      term : { _id: _roleid }
    /*Userroles.findOne({
        "_id": _roleid*/
    }, function(err, usrrole) {
        if (err) return res.send('error');
        res.send(usrrole);
    })
});


router.post('/insertrole', function(req, res, next) {

    console.log("avik");
    var rolename = req.body.rolename;
   var _userrole = new Userroles({
        'rolename': rolename,

    });


    _userrole.save(function(err) {
        if (err) res.send('error');
    });
    console.log('success');
    res.send('success');

});


router.post('/updaterole', function(req, res, next) {

    var _roleid = req.body._id;
	var rolename = req.body.rolename;


    Userroles.esUpdateOne({
        '_id': _roleid
    }, {
        $set: {
		'rolename': rolename
        }
    }, function(err, doc) {
        if (err) {
            res.send('error');
        } else {
            res.send('success');
        }

    });

});
router.get('/deleterole/:id', function(req, res, next) {
    var _roleid = req.params.id;
    Userroles.esUpdateOne({
        '_id': _roleid
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
