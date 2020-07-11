var express = require('express');
var md5 = require('md5');
var mongoose = require('mongoose');
var Purchasecms = require('../models/purchasecmsmodel');
var router = express.Router();


router.get('/getcontentbyid/:id', function(req, res, next) {
    var _editid = req.params.id;

    Purchasecms.esFindOne({
      term : { edit: _editid }
    /*Purchasecms.findOne({
        "edit": _editid*/
    }, function(err, purchasecmses) {
        if (err) return res.send('error');
        if(purchasecmses)
        {
         res.send(JSON.stringify(purchasecmses));
        }
        else
        {
          res.send('error');
        }
    })
});


router.post('/updatecontent', function(req, res, next) {
    var _purchasecmsid = req.body._id;
    var title = req.body.title;
    var content = req.body.content;

    if(_purchasecmsid=='' || _purchasecmsid==undefined)
    {
      var _cms = new Purchasecms({
         'title': title,
         'content': content,
         'edit':1
      });
     _cms.save(function(err) {
        if (err) res.send('error');
     });
     res.send('success');
   }
   else
   {
      Purchasecms.esUpdateOne({
        '_id': _purchasecmsid
      }, {
        $set:
        {
	  'title': title,
          'content': content,
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
