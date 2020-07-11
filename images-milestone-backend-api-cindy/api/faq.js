var express = require('express');
var md5 = require('md5');
var mongoose = require('mongoose');
var FAQ = require('../models/faqmodel');
var router = express.Router();


router.post('/savefaq',function(req,res,next){
	var _question=req.body.question;
	var _answer=req.body.answer;
	var _faq=new FAQ({'questions':_question,'answer':_answer});
	_faq.save(function(err,faq)
	{
		if(err){
			res.send('error');
		}
		else
		{
			res.send(faq);
		}
	});
});


router.post('/updatefaq',function(req,res,next){
	var _faqid = req.body._id;
	var _answer = req.body.answer;
	var _question = req.body.question;
	FAQ.esUpdateOne({'_id':_faqid},{$set : {'questions':_question,'answer':_answer}}, function(err, faq) {
        if (err) {
            res.send('error');
        } else {
            res.send('success');
        }})

});

router.get('/listallfaq',function(req,res,next){
  FAQ.esFind({match_all : {}},
	//FAQ.find({},
    function(err,faqlist){
		if (err)
		{
			return res.send(err);
		}
		else
		{
			res.send(faqlist);
		}
	});
});

router.get('/faqdelete/:id',function(req,res,next){
	var _faqid=req.params.id;
	FAQ.esRemoveOne({'_id':_faqid},function(err,faqdel) {
         if (err) {
            res.send('error');
         } else {
            res.send('success');
         }
       });
});


router.get('/faqbyid/:id',function(req,res,next){
	var _faqid=req.params.id;

  FAQ.esFindOne({
      term : { _id: _faqid }
	//FAQ.findOne({'_id':_faqid
  },function(err,item){
		if(err)
		{
			return res.send("error");
		}
		else
		{
			res.send(item);
		}
	});
});

module.exports = router;
