var express = require('express');
var md5 = require('md5');
var mongoose = require('mongoose');
var Joinuscms = require('../models/joinuscmsmodel');
var router = express.Router();


router.get('/getcontentbyid/:id', function(req, res, next) {
    var _editid = req.params.id;

    Joinuscms.esFindOne({
      term : { edit: _editid }
    /*Joinuscms.findOne({
        "edit": _editid*/
    }, function(err, joinuscms) {
        if (err) return res.send('error');
        res.send(JSON.stringify(joinuscms));
    })
});


router.post('/updatecontent', function(req, res, next) {
    var _jounuscmsid = req.body._id;
    var joinmodaltitle = req.body.joinmodaltitle;
    var usertitle = req.body.usertitle;
    var usercontent = req.body.usercontent;
    var userbuttonvalue = req.body.userbuttonvalue;
    var photographertitle = req.body.photographertitle;
    var photographercontent = req.body.photographercontent;
    var photographerbuttonvalue = req.body.photographerbuttonvalue;
    var title = req.body.title;
    var subtitle = req.body.subtitle;
    var formbelowcontent = req.body.formbelowcontent;
    var rightimage = req.body.rightimage;
    var imageid = req.body.imageid;
    var righttitle=req.body.righttitle;
    var rightcontent=req.body.rightcontent;


   if(imageid=='' || imageid==undefined)
    {

    }
    else
    {
      rightimage=imageid;
    }

    Joinuscms.esUpdateOne({
        '_id': _jounuscmsid
    }, {
        $set:
        {
		'joinmodaltitle': joinmodaltitle,
		'usertitle': usertitle,
		'usercontent': usercontent,
		'userbuttonvalue': userbuttonvalue,
		'photographertitle':photographertitle,
		'photographercontent':photographercontent,
		'photographerbuttonvalue':photographerbuttonvalue,
		'title':title,
		'subtitle':subtitle,
		'formbelowcontent':formbelowcontent,
		'rightimage':rightimage,
		'righttitle':righttitle,
		'rightcontent':rightcontent,
		'edit':1
        }
     }, function(err, doc) {
        if (err) {
            console.log(err);
            res.send('error');
        } else {
            res.send('success');
        }
    });
});
module.exports = router;
