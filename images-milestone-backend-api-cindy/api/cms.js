var express = require('express');
var md5 = require('md5');
var mongoose = require('mongoose');
var Cms = require('../models/cmsesmodel');
var router = express.Router();


router.get('/getallpages', function(req, res, next) {
    Cms.esFind({match_all : {}},
    //Cms.find(
        function(err, page) {
        if (err) return res.send('error');
        res.send(page);
    });
});

router.get('/getpagebyid/:id', function(req, res, next) {
    var _pageid = req.params.id;

     Cms.esFindOne({
      term : { _id: _pageid }
    }, function(err, page) {
        if (err) return res.send('error');
        res.send(page);
    })
});


router.get('/getcontentbypagename/:keyword',function(req,res,next){
	var _keyword = req.params.keyword;

     Cms.esFindOne({
      term : { pagename: _keyword }
	   /*Cms.findOne({"pagename":_keyword*/
   },function(err,page){
	   if(err) return res.send('error');
	   res.send(page);
	});
});

router.post('/insertpages', function(req, res, next) {
    var pagename = req.body.pagename;
    var pagecontent = req.body.pagecontent;
    var pagetitle = req.body.pagetitle;

    var _cms = new Cms({
        'pagename': pagename,
	'pagecontent': pagecontent,
        'pagetitle': pagetitle
    });
    _cms.save(function(err) {
        if (err) res.send('error');
    });
    res.send('success');
});

router.post('/updatepages', function(req, res, next) {
    var _pageid = req.body._id;
    var pagename = req.body.pagename;
    var pagecontent = req.body.pagecontent;
    var pagetitle = req.body.pagetitle;
    Cms.esUpdateOne({
        '_id': _pageid
      }, {
        $set: {
            'pagename': pagename,
            'pagecontent': pagecontent,
            'pagetitle': pagetitle
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
