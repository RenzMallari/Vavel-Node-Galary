var express = require('express');
var md5 = require('md5');
var mongoose = require('mongoose');
var Explorecms = require('../models/explorecmsmodel');
var router = express.Router();


router.get('/getcontentbyid/:id', function(req, res, next) {
    var _editid = req.params.id;
    Explorecms.esFindOne({
      term : { edit: _editid }
    /*Explorecms.findOne({
        "edit": _editid*/
    }, function(err, explorecmses) {
        if (err) return res.send('error');
        if(explorecmses)
        {
         res.send(JSON.stringify(explorecmses));
        }
        else
        {
          res.send('error');
        }
    })
});


router.post('/updatecontent', function(req, res, next) {
    var _exploreid = req.body._id;
    var title = req.body.title;
    var subtitle = req.body.subtitle;
    var usertitle = req.body.usertitle;
    var usercontent = req.body.usercontent;
    var userbuttonvalue = req.body.userbuttonvalue;
    var photographertitle = req.body.photographertitle;
    var photographercontent = req.body.photographercontent;
    var photographerbuttonvalue = req.body.photographerbuttonvalue;
    var belowtitle = req.body.belowtitle;
    var belowuserbuttonvalue = req.body.belowuserbuttonvalue;
    var belowphotographerbuttonvalue = req.body.belowphotographerbuttonvalue;
    var signaturecollectiontitle = req.body.signaturecollectiontitle;
    var signaturecollectionsubtitle = req.body.signaturecollectionsubtitle;

    if(_exploreid=='' || _exploreid==undefined)
    {
      var _explore = new Explorecms({
        'title': title,
        'subtitle': subtitle,
        'usertitle': usertitle,
        'usercontent': usercontent,
        'userbuttonvalue': userbuttonvalue,
        'photographertitle': photographertitle,
        'photographercontent': photographercontent,
        'photographerbuttonvalue': photographerbuttonvalue,
        'belowtitle': belowtitle,
        'belowuserbuttonvalue': belowuserbuttonvalue,
        'belowphotographerbuttonvalue': belowphotographerbuttonvalue,
        'signaturecollectiontitle':signaturecollectiontitle,
        'signaturecollectionsubtitle':signaturecollectionsubtitle,
        'edit':1
      });
     _explore.save(function(err) {
        if (err) res.send('error');
     });
     res.send('success');
   }
   else
   {
      Explorecms.esUpdateOne({
        '_id': _exploreid
      }, {
        $set:
        {
	  'title': title,
          'subtitle': subtitle,
          'usertitle': usertitle,
          'usercontent': usercontent,
          'userbuttonvalue': userbuttonvalue,
          'photographertitle': photographertitle,
          'photographercontent': photographercontent,
          'photographerbuttonvalue': photographerbuttonvalue,
          'belowtitle': belowtitle,
          'belowuserbuttonvalue': belowuserbuttonvalue,
          'belowphotographerbuttonvalue': belowphotographerbuttonvalue,
          'signaturecollectiontitle':signaturecollectiontitle,
          'signaturecollectionsubtitle':signaturecollectionsubtitle,
          'edit':1
        }
      }, function(err, doc) {
        if (err) {
            res.send('error');
        } else {
            res.send('success');
        }
     });
   }
});

module.exports = router;
