var express = require('express');
var md5 = require('md5');
var mongoose = require('mongoose');
var Brandcms = require('../models/brandcmsmodel');
var Brandlist = require('../models/brandlistmodel');
var router = express.Router();


router.get('/getcontentbyid/:id', function(req, res, next) {
    var _editid = req.params.id;
     Brandcms.esFindOne({
      term : { edit: _editid }
    /*Brandcms.findOne({
        "edit": _editid*/
    }, function(err, brandcmses) {
        if (err) return res.send('error');
        if(brandcmses)
        {
         res.send(JSON.stringify(brandcmses));
        }
        else
        {
          res.send('error');
        }
    })
});


router.post('/updatecontent', function(req, res, next) {
    var _cmsid = req.body._id;
    var title = req.body.title;
    var content = req.body.content;

    if(_cmsid=='' || _cmsid==undefined)
    {
      var _cms = new Brandcms({
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
      Brandcms.esUpdateOne({
        '_id': _cmsid
      }, {
         $set: {
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

router.post('/insertbrand',function(req,res,next){
       var _imageid=req.body.imageid;
       var _isactive=req.body.isactive;
       var _brand=new Brandlist({'image':_imageid,'isactive':_isactive});
       _brand.save(function(err,brand)
       {
	    if(err){
	       res.send('error');
	    }
	    else
	    {
	       res.send(brand);
	    }
      });
});

router.post('/updatebrand',function(req,res,next){
        var _brandid=req.body._id;
        var _imageid=req.body.imageid;
        var _image=req.body.image;
        var _isactive=req.body.isactive;
	if(_imageid=='' || _imageid==undefined)
        {

        }
        else
        {
           _image=_imageid;
        }
	Brandlist.esUpdateOne({'_id':_brandid},{$set : {'image':_image,'isactive':_isactive}}, function(err, faq) {
        if (err) {
            res.send('error');
        } else {
            res.send('success');
        }})

});

router.get('/listallbrands',function(req,res,next){

   Brandlist.esFind({
      match_all : {}
	//Brandlist.find({
  },function(err,brandlist){
	if (err)
	{
	   return res.send(err);
	}
	else
	{
	   res.send(brandlist);
	}
    });
});

function shuffle(o){
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

router.get('/listactivebrands',function(req,res,next){

   Brandlist.esFind({
      term : { isactive: true }
	//Brandlist.find({'isactive':true
},function(err,brandlist){
	if (err)
	{
	   return res.send(err);
	}
	else
	{
	   var randombrandlist = shuffle(brandlist);
	   res.send(randombrandlist);
	}
    });
});

router.get('/deletebrand/:id',function(req,res,next){
      var _brandid=req.params.id;
      Brandlist.esRemoveOne({'_id':_brandid},function(err,brand) {
        if(err)
	{
	   res.send('error');
	}
	else
	{
	   res.send('success');
	}
     });
});


module.exports = router;
