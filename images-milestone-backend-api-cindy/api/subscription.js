var express = require('express');
var md5 = require('md5');
var mongoose = require('mongoose');
var Subscription = require('../models/subscriptionsmodel');
var Subscriptionfaq = require('../models/subscriptionfaqmodel');
var Subscriptioncms = require('../models/subscriptioncmsmodel');
var router = express.Router();


router.get('/getallsubscriptions', function(req, res, next) {

    Subscription.esFind({match_all : {}},
    //Subscription.find({},
        function(err, subscriptions) {
        if (err) return res.send('error');
        res.send(subscriptions);
    });
});

router.get('/getallsubscriptionslist', function(req, res, next) {

    Subscription.esFind({
          "term" : { "isactive" : true  }
    //Subscription.find({'isactive':true
    }, function(err, subscriptions) {
        if (err) return res.send('error');
        res.send(subscriptions);
    });
});

router.get('/getallsubscriptionfaqs', function(req, res, next) {

    Subscriptionfaq.esFind({match_all : {}},
    //Subscriptionfaq.find({},
    function(err, subscriptionfaqs) {
        if (err) return res.send('error');
        res.send(subscriptionfaqs);
    });
});


router.get('/getsubscriptionbyid/:id', function(req, res, next) {
    var _subscriptionid = req.params.id;

    Subscription.esFindOne({
      term : { _id: _subscriptionid }
    /*Subscription.findOne({
        "_id": _subscriptionid*/
    }, function(err, page) {
        if (err) return res.send('error');
        res.send(page);
    })
});
router.get('/getsubscriptionfaqbyid/:id', function(req, res, next) {
    var _faqid = req.params.id;

    Subscriptionfaq.esFindOne({
      term : { _id: _faqid }
    /*Subscriptionfaq.findOne({
        "_id": _faqid*/
    }, function(err, page) {
        if (err) return res.send('error');
        res.send(page);
    })
});
router.post('/insertsubscriptions', function(req, res, next) {
     var subscriptionname = req.body.subscriptionname;
     var description = req.body.description;
     var amount = req.body.amount;
     var noofimages = req.body.noofimages;
     var isactive = req.body.isactive;
     var ispopular = req.body.ispopular;
     var _subscription = new Subscription({
        'subscriptionname': subscriptionname,
	'description': description,
	'amount': amount,
	'noofimages': noofimages,
        'isactive':isactive,
        'ispopular':ispopular
    });
    _subscription.save(function(err) {
        if (err) res.send('error');
    });
    res.send('success');
});
router.post('/insertsubscriptionfaqs', function(req, res, next) {
     var question = req.body.question;
     var answer = req.body.answer;
     var _subscriptionfaq = new Subscriptionfaq({
        'question': question,
	'answer': answer,
    });
    _subscriptionfaq.save(function(err) {
        if (err) res.send('error');
    });
    res.send('success');
});

router.post('/updatesubscriptions', function(req, res, next) {
    var _subscriptionid = req.body._id;
    var subscriptionname = req.body.subscriptionname;
    var description = req.body.description;
    var amount = req.body.amount;
    var noofimages = req.body.noofimages;
    var isactive = req.body.isactive;
    var ispopular = req.body.ispopular;

    Subscription.esUpdateOne({
        '_id': _subscriptionid
    }, {
        $set: {
		'subscriptionname': subscriptionname,
	        'description': description,
	        'amount': amount,
	        'noofimages': noofimages,
                'isactive':isactive,
                'ispopular':ispopular
        }
    }, function(err, doc) {
        if (err) {
            res.send('error');
        } else {
            res.send('success');
        }
    });
});
router.post('/updatesubscriptionfaqs', function(req, res, next) {
    var _subscriptionfaqid = req.body._id;
    var question = req.body.question;
    var answer = req.body.answer;

    Subscriptionfaq.esUpdateOne({
        '_id': _subscriptionfaqid
    }, {
        $set: {
		'question': question,
	        'answer': answer,
        }
    }, function(err, doc) {
        if (err) {
            res.send('error');
        } else {
            res.send('success');
        }

    });
});


router.get('/deletsubscription/:id', function(req, res, next) {
    var _subscriptionid = req.params.id;
    Subscription.esRemoveOne({'_id':_subscriptionid},function(err,subs) {
        if (err) {
            res.send('error');
        } else {
            res.send('success');
        }

    });
});
router.get('/deletsubscriptionfaq/:id', function(req, res, next) {
    var _faqid = req.params.id;
    Subscriptionfaq.esRemoveOne({'_id':_faqid},function(err,subs) {
        if (err) {
            res.send('error');
        } else {
            res.send('success');
        }

    });
});

router.get('/getcontentbyid/:id', function(req, res, next) {
    var _editid = req.params.id;

    Subscriptioncms.esFindOne({
      term : { edit: _editid }
    /*Subscriptioncms.findOne({
        "edit": _editid*/
    }, function(err, cmses) {
        if (err) return res.send('error');
        res.send(JSON.stringify(cmses));
    })
});

router.post('/updatecontent', function(req, res, next) {
    var _cmsid = req.body._id;
    var title = req.body.title;
    var subtitle = req.body.subtitle;
    var imageid = req.body.imageid;
    var image = req.body.image;

    if(imageid=='' || imageid==undefined)
    {

    }
    else
    {
      image=imageid;
    }
    Subscriptioncms.esUpdateOne({
        '_id': _cmsid
    }, {
        $set:
        {
		'title': title,
                'subtitle': subtitle,
                'image': image,
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

module.exports = router;
