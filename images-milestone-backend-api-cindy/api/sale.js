var express = require('express');
var md5 = require('md5');
var mongoose = require('mongoose');
var Salecms = require('../models/salecmsmodel');
var Sale = require('../models/salemodel');
var Payments = require('../models/paymentmodel');
var router = express.Router();
var moment = require('moment');

router.get('/getcontentbyid/:id', function(req, res, next) {
    var _editid = req.params.id;

    Salecms.esFindOne({
      term : { edit: _editid }
    /*Salecms.findOne({
        "edit": _editid*/
    }, function(err, salecmses) {
        if (err) return res.send('error');
        if(salecmses)
        {
         res.send(JSON.stringify(salecmses));
        }
        else
        {
          res.send('error');
        }
    })
});


router.post('/updatecontent', function(req, res, next) {
    var _salecmsid = req.body._id;
    var title = req.body.title;
    var content = req.body.content;

    if(_salecmsid=='' || _salecmsid==undefined)
    {
      var _cms = new Salecms({
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
      Salecms.esUpdateOne({
        '_id': _salecmsid
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

router.get('/getsales/:userid', function(req, res, next) {
    var _userid = req.params.userid;
    Sale.esFind({
          "term" : { "userid" : _userid  }
    /*Sale.find({
        "userid": _userid*/
    }, function(err, sales) {
        if (err)
        {
           res.send({"type":"error","msg":err});
        }
        else
        {
          if(sales.length>0)
          {
            _is_sale_exist=1;
          }
          else
          {
            _is_sale_exist=0;
          }
          res.send({"type":"success","is_sale_exist":_is_sale_exist,"sales":sales});
       }
    })
});

router.get('/getpurchases/:userid', function(req, res, next) {
    var _userid = req.params.userid;

    Sale.esFind({
          "term" : { "payerid" : _userid  }
    /*Sale.find({
        "payerid": _userid*/
    }, function(err, sales) {
        if (err)
        {
           res.send({"type":"error","msg":err});
        }
        else
        {
          if(sales.length>0)
          {
            _is_sale_exist=1;
          }
          else
          {
            _is_sale_exist=0;
          }
          res.send({"type":"success","is_sale_exist":_is_sale_exist,"purchases":sales});
       }
    })
});

router.get('/getpayments', function(req, res, next) {
    var _payment_exist=0;
    var resarray=[];

    Payments.esFind({match_all : {}},
    //Payments.find({},
      function(err, allpayments) {
        if (err)
        {
          res.send({'type':'error','res':'','payment_exist':_payment_exist});
        }
        else if(allpayments)
        {
          allpayments.forEach(function(data,index){
              var result={};
              var _pay_date = moment(data.paydate).format('DD-MM-YYYY');
              reslt={'userid':data.userid,'payerid':data.payerid,'payerphone':data.payerphone,'payfor':data.type,'amount':data.totalamount,'paymentid':data.paymentid,'paymentdate':_pay_date};
              resarray.push(reslt);
          });
          res.send({'type':'success','res':resarray,'payment_exist':_payment_exist});
        }
        else
        {
          res.send({'type':'error','res':'','payment_exist':_payment_exist});
        }
    });
});

router.get('/getallsales', function(req, res, next) {
    var _sales_exist=0;
    var resarray=[];

    Sale.esFind({match_all : {}},
    //Sale.find({},
      function(err, allsales) {
        if (err)
        {
          res.send({'type':'error','res':'','sales_exist':_sales_exist});
        }
        else if(allsales)
        {
          allsales.forEach(function(data,index){
              var result={};
              var _pay_date = moment(data.paydate).format('DD-MM-YYYY');
              reslt={'userid':data.userid,'payerid':data.payerid,'payfor':data.type,'amount':data.totalamount,'paymentid':data.paymentid,'paymentdate':_pay_date,'adminpercentage':data.adminpercentage,'totalearnings':data.totalearnings,'paykey':data.paykey,'transactionid':data.transactionid,'ack':data.ack,'message':data.message};
              resarray.push(reslt);
          });
          res.send({'type':'success','res':resarray,'sales_exist':_sales_exist});
        }
        else
        {
          res.send({'type':'error','res':'','sales_exist':_sales_exist});
        }
    });
});


module.exports = router;
