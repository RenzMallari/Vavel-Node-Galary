var express = require('express');
var async = require('async');
var md5 = require('md5');
var mongoose = require('mongoose');
var Contactus=require('../models/contactusmodel');
var Contactuscms=require('../models/contactuscmsmodel');
var router = express.Router();
var nodemailer = require("nodemailer");
var smtpTransport = nodemailer.createTransport("SMTP",{
   service: "Gmail",
   auth: {
       user: "noreply@vavel.com",
       pass: "c0c0l0c0*85"
   }
});

router.post('/contactus',function(req,res,next){
	var _email=req.body.email;
	var _subject=req.body.subject;
	var _descriptions=req.body.descriptions;
	var _contactus=new Contactus({"email":_email,"subject":_subject,"descriptions":_descriptions,"isreply":false,"attachments":""});
	_contactus.save(function(err,contactus){
		if(err)
		{
			return res.send({"type":"error","msg":err});
		}
		else
		{
			var mailOptions={
				from:_email,
					to:"info@vavel.com",
					generateTextFromHTML: true,
					subject:_subject,
					text:_descriptions
			}
				smtpTransport.sendMail(mailOptions,function(err,response){
					if(err)
					{
						res.send({"type":"error","msg":err});
					}
					smtpTransport.close();
				});

				res.send({"type":"success","msg":contactus})
		}
	});

});

router.post('/replymail',function(req,res,next){
	var _id=req.body._id;
	var _email=req.body.email;
	var _subject='Fwd:'+req.body.subject;
	var _descriptions=req.body.descriptions;
	Contactus.esUpdateOne({"_id":_id},{$set:{"isreply":true}},function(err,replymail){

		if(err)
		{
			return res.send({"type":"error","msg":err});
		}
		else
		{
			var mailOptions={
				from:"info@vavel.com",
					to:_email,
					generateTextFromHTML: true,
					subject:_subject,
					text:_descriptions
			}
				smtpTransport.sendMail(mailOptions,function(err,response){
					if(err)
					{
						res.send({"type":"error","msg":err});
					}
					smtpTransport.close();
				});
				res.send({"type":"success","msg":replymail})
		}
	});
});


router.get('/listallcontact',function(req,res,next){

     Contactus.esFind({
      match_all : {}},
	//Contactus.find(
    function(err,contactlist){
		if (err)
		{
			return res.send(err);
		}
		else
		{
			res.send(contactlist);
		}

	});
});

router.get('/getsendmailbyid/:id',function(req,res,next){
	var _contactid = req.params.id;
   Contactus.esFindOne({
      term : { _id: _contactid }
	//Contactus.findOne({"_id":_contactid
  },function(err,contact){
		if(err)
		{
			return res.send("error");
		}
		else
		{
			res.send(contact);
		}
	});
});

router.get('/getcontentbyid/:id', function(req, res, next) {
    var _editid = req.params.id;
   Contactuscms.esFindOne({
      term : { edit: _editid }
    /*Contactuscms.findOne({
        "edit": _editid*/
    }, function(err, contacts) {
        if (err) return res.send('error');
        res.send(JSON.stringify(contacts));
    })
});

router.post('/updatecontent', function(req, res, next) {
    var _contactid = req.body._id;
    var title = req.body.title;
    var subtitle = req.body.subtitle;
    var formtitle = req.body.formtitle;
    var formbelowtext = req.body.formbelowtext;

    /*var _contactcms = new Contactuscms({
        'title': title,
        'subtitle': subtitle,
        'formtitle': formtitle,
        'formbelowtext':formbelowtext,
        'edit':1
    });
    _contactcms.save(function(err) {
        if (err) res.send('error');
    });
    res.send('success');*/

  Contactuscms.esUpdateOne({
        '_id': _contactid
    }, {
        $set:
        {
		'title': title,
	        'subtitle': subtitle,
                'formtitle': formtitle,
                'formbelowtext':formbelowtext,
                'edit':1
        }
     }, function(err, doc) {
        if (err) {
            res.send('error');
        } else {
            res.send('success');
        }
    });
});

router.get('/deletcontact/:id', function(req, res, next) {
    var _contactid = req.params.id;
    Contactus.esRemoveOne({'_id':_contactid},function(err,subs) {
        if (err) {
            res.send('error');
        } else {
            res.send('success');
        }
    });
});

module.exports = router;
