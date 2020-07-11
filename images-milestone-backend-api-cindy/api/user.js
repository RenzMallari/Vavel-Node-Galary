const express = require('express');
const models = require('../models');
const router = express.Router();
const nodemailer = require('nodemailer');
const paypal = require('./paypal.js');
const moment = require('moment');
const ftpClient = require('ftp');
const ftpAccess = require('../config/ftp_access');
const uploader = require('jquery-file-upload-middleware');
const helper = require('../components/es_helper');
const mongoose = require('mongoose');
const fs = require('fs');
const request = require('request');
const shortid = require('shortid');
const FB = require('fb').default;
const md5 = require('md5');
FB.options({ version: 'v2.4' });

const User = models.user;
const UserSubscription = models.usersubscriptions;
const UserSubscriptionImages = models.usersubscriptionimages;
const UserGalleries = models.usergalleries;
const regTextPrepare = helper.regTextPrepare;

require('../events/userEvent');

const smtpTransport = nodemailer.createTransport('SMTP', {
  service: 'Gmail',
  auth: {
    user: 'noreply@vavel.com',
    pass: 'c0c0l0c0*85'
  }
});

function shuffle(o) {
  for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  return o;
}

router.use('/uploadCover', function(req, res, next) {

  res.sendF = res.send;
  /** ********************************************************************************************************/
  /* I apologize for this nightmare. unfortunately is not supported in asynchronous mode, so had to do it ...*/
  /** ********************************************************************************************************/
  res.send = function(rezultSend) {
    rezultSend = JSON.parse(rezultSend);
    if (!(rezultSend.files && rezultSend.files[0])) return res.sendF({ 'type': 'error', 'msg': 'no file, try again' });

    const fileInfo = rezultSend.files[0];

    if (!req.session || !req.session.user) return res.sendF({ 'type': 'error', 'msg': 'session is expired' });

    const userData = req.session.user;

    const client = new ftpClient();
    client.on('ready', function() {
      const fileExtension = fileInfo.name.split('.').pop();
      const fileId = userData._id.toString();

      const name = `${fileId}.${fileExtension}`;
      const fileName = `${__dirname}/uploads/${fileInfo.name}`

      client.put(fileName, `/photoImages/cover/${name}`, function(err) {
        if (err) return res.sendF({ 'type': 'error', 'msg': err });

        else {
          if (fs.existsSync(fileName)) fs.unlinkSync(fileName);

          client.end();

          User.esUpdateOne({ _id: mongoose.Types.ObjectId(userData._id) }, { coverimage: name }, function(err, user) {
            res.sendF(JSON.stringify({ coverimage: name }));
          });
        }
      });
    });

    client.connect(ftpAccess);
  };
  uploader.fileHandler({
    uploadDir: `${__dirname}/uploads/`,
    uploadUrl: '/uploads'
  })(req, res, next);
});

router.use('/uploadAvatar', function(req, res, next) {

  res.sendF = res.send;
  /** ********************************************************************************************************/
  /* I apologize for this nightmare. unfortunately is not supported in asynchronous mode, so had to do it ...*/
  /** ********************************************************************************************************/
  res.send = function(rezultSend) {
    rezultSend = JSON.parse(rezultSend);
    if (!(rezultSend.files && rezultSend.files[0])) return res.sendF({ 'type': 'error', 'msg': 'no file, try again' });

    const fileInfo = rezultSend.files[0];
    const fileName = `${__dirname}/uploads/${fileInfo.name}`;

    if (!req.session || !req.session.user) return res.sendF({ 'type': 'error', 'msg': 'session is expired' });

    const userData = req.session.user;

    const client = new ftpClient();
    client.on('ready', function() {
      const fileExtension = fileInfo.name.split('.').pop();
      const fileId = userData._id.toString();

      const name = `${fileId}.${fileExtension}`;

      client.put(fileName, `/photoImages/avatar/${name}`, function(err) {
        if (err) return res.sendF({ 'type': 'error', 'msg': err });

        if (fs.existsSync(fileName)) fs.unlinkSync(fileName);

        client.end();

        User.esUpdateOne({ _id: mongoose.Types.ObjectId(userData._id) }, { profileimage: name }, function(err, user) {
          res.sendF(JSON.stringify({ profileimage: name }));
        });

      });
    });

    client.connect(ftpAccess);
  };
  uploader.fileHandler({
    uploadDir: `${__dirname}/uploads/`,
    uploadUrl: '/uploads'
  })(req, res, next);
});

uploader.on('begin', function(fileInfo, req, res) {
});

uploader.on('end', function(fileInfo, req, res) {
});

router.post('/verifieduser/:userid', function(req, res, next) {
  const _userid = req.params.userid;
  const _verified = req.body.verified;

  User.esUpdateOne({
    '_id': _userid
  }, {
    $set: {
      'verified': _verified
    }
  }, function(err, usr) {
    console.log(usr);
    if (err) return res.send({
      type: 'error',
      error: err,
      msg: err.message
    });

    else if (usr) return res.send({
      type: 'success',
      msg: usr
    });

    else return res.send({
      type: 'error',
      msg: 'User not found'
    });

  });
});

router.get('/getallusers', function(req, res) {
  // User.aggregate([{
  //   $match: { isdeleted: false }
  // }, {
  //   $sort: {
  //     'createdAt': -1
  //   }
  // }],
  // // User.esFind({
  // //   term: { isdeleted: false }
  // /* User.find({
  //                             "isdeleted": false*/
  // // },
  // function(err, usr) {
  //   if (err) return res.send('error');

  //   res.send(usr);
  // });

  const { search = '', limit = 10, page = 1 } = req.query;

  const skip = parseInt(page - 1) * limit;
  const query = {
    isdeleted: false,
    $or: [
      { fullname: new RegExp(search, 'i') }
    ]
  };

  User.count(query).then(total => {
    User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .then((results = []) => {
        res.send({
          type: 'success',
          users: results,
          total,
          totalPages: Math.ceil(total / limit) || 1
        });
      }).catch(err => {
        res.send({
          'type': 'error',
          'msg': err
        });
      });
  }).catch(err => {
    res.send({
      'type': 'error',
      'msg': err
    });
  });
});

router.get('/checkuserstatus/:userid', function(req, res, next) {
  const _userid = req.params.userid;

  UserSubscription.esFindOne({
    term: { userid: _userid }

    /* UserSubscription.findOne({
        "userid": _userid*/
  }, function(err, subscribeusr) {
    if (err) res.send('error');

    else if (subscribeusr) {
      const today = new Date();
      const todaytime = today.getTime();
      const subscriptionenddate = subscribeusr.enddatetimestamp;
      if (todaytime <= subscriptionenddate) res.send('success');

      else res.send('error');

    }
    else res.send('error');

  });
});

router.get('/checkusersubscriptionstatus/:userid', function(req, res, next) {
  const _userid = req.params.userid;
  let _subscription_exist = 0;
  let downloaded_images = 0;

  UserSubscription.esFindOne({
    term: { userid: _userid }
    /*  UserSubscription.findOne({
          "userid": _userid*/
  }, function(err, subscribeusr) {
    if (err) res.send({ 'type': 'error', 'subscription_exist': _subscription_exist });

    else if (subscribeusr) {
      const today = new Date();
      const todaytime = today.getTime();
      const subscriptionenddate = subscribeusr.enddatetimestamp;
      if (todaytime <= subscriptionenddate) {
        _subscription_exist = 1;
        UserSubscriptionImages.esFind({
          term: { userid: _userid }
          /* UserSubscriptionImages.find({
            "userid": _userid*/
        }, function(err, userdownloads) {
          if (err) downloaded_images = 0;

          else if (userdownloads) userdownloads.forEach(function(data, index) {
            if ((data.datetimestamp >= subscribeusr.startdatetimestamp) && (data.datetimestamp <= subscribeusr.enddatetimestamp)) downloaded_images = downloaded_images + 1;

          });

          else downloaded_images = 0;

          if (downloaded_images < subscribeusr.noofimages) _subscription_exist = 1;

          else _subscription_exist = 0;

          res.send({ 'type': 'success', 'subscription_exist': _subscription_exist });
        });
      }
      else res.send({ 'type': 'error', 'subscription_exist': _subscription_exist });

    }
    else res.send({ 'type': 'error', 'subscription_exist': _subscription_exist });

  });
});

router.get('/getSubscriptionDetails/:userid', function(req, res, next) {
  const _userid = req.params.userid;
  let _subscription_exist = 0;
  let _is_subscription_expired;

  UserSubscription.esFindOne({
    term: { userid: _userid }
    /* UserSubscription.findOne({
        "userid": _userid*/
  }, function(err, subscribeusr) {
    if (err) res.send({ 'type': 'error', 'res': '', 'subscription_exist': _subscription_exist });

    else if (subscribeusr) {
      const today = new Date();
      const todaytime = today.getTime();
      const subscriptionenddate = subscribeusr.enddatetimestamp;
      if (todaytime <= subscriptionenddate) _is_subscription_expired = 0;

      else _is_subscription_expired = 1;

      let downloaded_images = 0;
      UserSubscriptionImages.esFind({
        term: { userid: _userid }
        /* UserSubscriptionImages.find({
            "userid": _userid*/
      }, function(err, userdownloads) {
        if (err) downloaded_images = 0;

        else if (userdownloads) userdownloads.forEach(function(data, index) {
          if ((data.datetimestamp >= subscribeusr.startdatetimestamp) && (data.datetimestamp <= subscribeusr.enddatetimestamp)) downloaded_images = downloaded_images + 1;

        });

        else downloaded_images = 0;

        _subscription_exist = 1;
        const _subscription_date = moment(subscribeusr.startdate).format('DD-MM-YYYY');
        const _subscription_end_date = moment(subscribeusr.enddate).format('DD-MM-YYYY');
        const reslt = { 'subscriptionname': subscribeusr.subscriptionname, 'price': subscribeusr.amount, 'images': subscribeusr.noofimages, 'subscriptiondate': _subscription_date, 'subscriptionenddate': _subscription_end_date, 'remaining_images': (subscribeusr.noofimages - downloaded_images) };
        res.send({ 'type': 'success', 'res': reslt, 'subscription_exist': _subscription_exist, 'is_subscription_expired': _is_subscription_expired });
      });
    }
    else res.send({ 'type': 'error', 'res': '', 'subscription_exist': _subscription_exist });

  });
});

router.get('/getallusersubscription', function(req, res, next) {
  const _subscription_exist = 0;
  const resarray = [];
  UserSubscription.esFind({ 'match_all': {} }
    // UserSubscription.find({}
    , function(err, subscribeusr) {
      if (err) res.send({ 'type': 'error', 'res': '', 'subscription_exist': _subscription_exist });

      else if (subscribeusr) {
        subscribeusr.forEach(function(data, index) {
          const result = {};
          const _subscription_date = moment(data.startdate).format('DD-MM-YYYY');
          const _subscription_end_date = moment(data.enddate).format('DD-MM-YYYY');
          reslt = { 'userid': data.userid, 'subscriptionname': data.subscriptionname, 'price': data.amount, 'images': data.noofimages, 'subscriptiondate': _subscription_date, 'subscriptionenddate': _subscription_end_date };
          resarray.push(reslt);
        });
        res.send({ 'type': 'success', 'res': resarray, 'subscription_exist': _subscription_exist });
      }
      else res.send({ 'type': 'error', 'res': '', 'subscription_exist': _subscription_exist });

    });
});

router.post('/subscribe', function(req, res, next) {
  const _subscriptionid = req.body.subscriptionid;
  const _selectedplanname = req.body.selectedplanname;
  const _noofimages = req.body.noofimages;
  const _selectedprice = req.body.selectedprice;
  const _cardnumber = req.body.cardnumber;
  const _expirydate = req.body.expirydate;
  const _expirydateexp = _expirydate.split('/');
  const _cvcnumber = req.body.cvcnumber;
  const _phonenumber = req.body.phonenumber;
  const _userid = req.body.userid;
  /* paypal.paypal_api.configure({
   'mode': 'sandbox',
   'client_id': 'AagmhObOlbFGnRUeTbkSfuoEpLPLuZoLAf_wbN177nkcfrIdEYmjcVjr-l6nk_7dj0PXageyOR_dfy8v',
   'client_secret': 'ELDrwbpgIEtg1MOiaObvVgvxzUZrBdkoSZlXdtRRbjyuV40Rhyxyyh0qitkOgSvNDyHNmyc6ZL-I0auF'
 });*/

  User.esFindOne({
    term: { _id: _userid }
  }, function(err, user) {
    // User.findOne({'_id':_userid}, function (err, user) {
    if (err) res.send({ 'type': 'error', 'msg': 'Some error occurred. Please try again later.' });

    else if (user) {
      const _firstname = user.firstname;
      const _lastname = user.lastname;
      const create_payment_json = {
        'intent': 'sale',
        'payer': {
          'payment_method': 'credit_card',
          'funding_instruments': [{
            'credit_card': {
              'type': 'visa',
              'number': _cardnumber,
              'expire_month': _expirydateexp[0],
              'expire_year': _expirydateexp[1],
              'cvv2': _cvcnumber,
              'first_name': _firstname,
              'last_name': _lastname,
              'billing_address': {
                'line1': '52 N Main ST',
                'city': 'Johnstown',
                'state': 'OH',
                'postal_code': '43210',
                'country_code': 'US'
              }
            }
          }]
        },
        'transactions': [{
          'amount': {
            'total': _selectedprice,
            'currency': 'USD'
          },
          'description': 'This is the payment for buying single image.'
        }]
      };
      paypal.paypal_api.payment.create(create_payment_json, function(err, result) {
        if (err) res.send({ 'type': 'error', 'msg': `${err.response.message}.` });

        else if (result.state == 'approved') {
          const today = new Date();
          const currenttime = today.getTime();
          const enddate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30);
          const enddatetimestamp = enddate.getTime();
          UserSubscription.esRemoveOne({ 'userid': _userid }, function(err, removesubscription) {
          });
          const _usersubscription = new UserSubscription({
            userid: _userid,
            subscriptionid: _subscriptionid,
            subscriptionname: _selectedplanname,
            amount: _selectedprice,
            userphone: _phonenumber,
            noofimages: _noofimages,
            startdatetimestamp: currenttime,
            enddate,
            enddatetimestamp
          });
          _usersubscription.save(function(err, subscription) {
            res.send({ 'type': 'success', 'msg': 'You have subscribed successfully.' });
          });
        }
        else res.send({ 'type': 'error', 'msg': 'Some error occurred. Please try again later or use another card.' });

      });
    }
    else res.send({ 'type': 'error', 'msg': 'Some error occurred. Please try again later.' });

  });
});

router.get('/getallactivephotographer', function(req, res, next) {

  User.esFind({
    'bool': {
      'must': [
        { 'term': { 'isdeleted': false } },
        { 'term': { 'isactive': true } },
        { 'term': { 'roleid': '3' } }
      ]
    }
    /* User.find({
        "isdeleted": false,
        "isactive": true,
        "roleid":'3'*/
  }, function(err, usr) {
    if (err) return res.send('error');
    res.send(usr);
  });
});

router.get('/getfeaturedphotographer', function(req, res, next) {

  User.esFind({
    'bool': {
      'must': [
        { 'term': { 'isdeleted': false } },
        { 'term': { 'isactive': true } },
        { 'term': { 'roleid': '3' } },
        { 'term': { 'isfeatured': true } }
      ]
    }
    /* User.find({
        "isdeleted": false,
        "isactive": true,
        "roleid":'3',
        "isfeatured":true*/
  }, function(err, usr) {
    if (err) return res.send('error');

    else {
      const randomuser = shuffle(usr);
      res.send(randomuser[0]);
    }

  });
});

router.get('/getuserbyid/:id', function(req, res, next) {
  const _userid = req.params.id;

  User.esFindOne({
    term: { _id: _userid }
    /* User.findOne({
        "_id": _userid*/
  }, function(err, usr) {
    if (err) return res.send('error');
    res.send(usr);
  });
});

router.post('/insertuser', function(req, res, next) {
  const roleid = req.body.roleid;
  const flickrid = req.body.flickrid;
  const email = req.body.email;
  const firstname = req.body.firstname;
  const middlename = req.body.middlename;
  const lastname = req.body.lastname;
  const password = md5(req.body.password);
  const profileimage = req.body.profileimage;
  const phonenumber = req.body.phonenumber;
  const addressline1 = req.body.addressline1;
  const addressline2 = req.body.addressline2;
  const city = req.body.city;
  const state = req.body.state;
  const country = req.body.country;
  const isactive = req.body.isactive;
  const isfeatured = req.body.isfeatured;
  const adminpercentage = req.body.adminpercentage;
  const _user = new User({
    roleid,
    flickrid,
    email,
    firstname,
    middlename,
    lastname,
    password,
    profileimage,
    phonenumber,
    addressline1,
    addressline2,
    city,
    state,
    country,
    isactive,
    isfeatured,
    adminpercentage
  });

  _user.save(function(err) {
    if (err) res.send('error');
  });
  res.send('success');

});

router.get('/insertuser/:roleid/:flickrid/:email/:firstname/:middlename/:lastname/:password/:profileimage/:phonenumber/:addressline1/:addressline2/:city/:state/:country', function(req, res, next) {
  const roleid = req.params.roleid;
  const flickrid = req.params.flickrid;
  const email = req.params.email;
  const firstname = req.params.firstname;
  const middlename = req.params.middlename;
  const lastname = req.params.lastname;
  const password = md5(req.params.password);
  const profileimage = req.params.profileimage;
  const phonenumber = req.params.phonenumber;
  const addressline1 = req.params.addressline1;
  const addressline2 = req.params.addressline2;
  const city = req.params.city;
  const state = req.params.state;
  const country = req.params.country;
  const isactive = req.params.isactive;
  const isfeatured = req.params.isfeatured;
  const adminpercentage = req.params.adminpercentage;
  const _user = new User({
    roleid,
    flickrid,
    email,
    firstname,
    middlename,
    lastname,
    password,
    profileimage,
    phonenumber,
    addressline1,
    addressline2,
    city,
    state,
    country,
    isactive,
    isfeatured,
    adminpercentage
  });

  _user.save(function(err) {
    if (err) res.send('error');
  });
  res.send('success');

});

router.post('/updateuser', function(req, res, next) {
  const _userid = req.body._id;
  const email = req.body.email;
  const firstname = req.body.firstname;
  const middlename = req.body.middlename;
  const lastname = req.body.lastname;
  const phonenumber = req.body.phonenumber;
  const addressline1 = req.body.addressline1;
  const addressline2 = req.body.addressline2;
  const city = req.body.city;
  const state = req.body.state;
  const country = req.body.country;
  const isactive = req.body.isactive;
  const isfeatured = req.body.isfeatured;
  const adminpercentage = req.body.adminpercentage;

  User.esUpdateOne({
    '_id': _userid
  }, {
    $set: {
      email,
      'fullname': `${firstname} ${lastname}`,
      firstname,
      middlename,
      lastname,
      phonenumber,
      addressline1,
      addressline2,
      city,
      state,
      country,
      isactive,
      isfeatured,
      adminpercentage

    }
  }, function(err, doc) {

    if (err) res.send('error');
    else res.send('success');

  });

});

router.get('/updateuserstatus/:id/:status', function(req, res, next) {
  const _userid = req.params.id;
  const status = req.params.status;

  User.esUpdateOne({
    '_id': _userid
  }, {
    $set: {
      'isactive': status
    }
  }, function(err, doc) {
    if (err) res.send('error');
    else res.send('success');

  });
});

router.get('/deleteuser/:id', function(req, res, next) {
  const _userid = req.params.id;

  User.esUpdateOne({
    '_id': _userid
  }, {
    $set: {
      'isdeleted': true
    }
  }, function(err, doc) {
    if (err) res.send('error');
    else res.send('success');

  });
});

router.post('/facebooksignuplogin', function(req, res, nexe) {
  const _verificationcode = Math.floor(Math.random() * 90000) + 10000;
  const fbId = req.body.facebookid;

  User.esFindOne({
    term: { facebookid: fbId }
  }, function(err, usr) {

    /* User.findOne({
        "facebookid": fbId
    },function(err, usr) {*/
    if (usr == null || usr == '') {
      const _user = new User({
        'roleid': '2',
        'facebookid': fbId,
        'fullname': `${req.body.firstname} ${req.body.lastname}`,
        'firstname': req.body.firstname,
        'middlename': req.body.middlename,
        'lastname': req.body.lastname,
        'username': req.body.firstname,
        'profileimage': 'dra9rytyly6lbcnavvtw',
        'isactive': true,
        'verificationcode': _verificationcode,
        'lastloggedindate': Date.now(),
        'isloggedin': true,
        'isdeleted': false,
        'link': '',
        'coverimage': 'cover-image-default-app_m0ykui',
        'paypalemail': '',
        'adminpercentage': 0
      });

      _user.save(function(err, user) {
        if (err) res.send({ 'type': 'error', 'msg': err });
        else User.esFindOne({
          term: { facebookid: fbId }
          /* User.findOne({
                  "facebookid": fbId*/
        }, function(err, usr) {
          res.send({ 'type': 'success', 'msg': user });
        });

      });
    } else res.send({ 'type': 'success', 'msg': usr });

  });

});

function validateGoogleCaptcha(captchaResponse) {
  // reCAPTCHA SECRET KEY
  const secret = '6LftBMQUAAAAANUKphmnkiAz2rqZL9LY4eUpVTPj';
  return new Promise((resolve, reject) => {
    request.post(
      'https://www.google.com/recaptcha/api/siteverify',
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${secret}&response=${captchaResponse}`,
      },
      (error, response, body) => {
        if(!error && response.statusCode == 200) {
          resolve(body);
        } else {
          reject(error);
        }
    });
  })
}

router.post('/registration', function(req, res, next) {
  const _firstname = req.body.firstname;
  const _lastname = req.body.lastname;
  const _paypalemail = req.body.paypalemail;
  const _email = req.body.email;
  const _password = req.body.password;
  const _verificationcode = Math.floor(Math.random() * 90000) + 10000;
  const _username = _email.split('@');
  const username = _username[0] + shortid.generate();
  const _country = req.body.country;
  const _recaptchaResponse = req.body['g-recaptcha-response'];
  let _type = '2';
  const validateCaptchErrorMsg = 'Validate google captcha error. Please, try again.';

  validateGoogleCaptcha(_recaptchaResponse)
    .then(response => {
      const parsedResponse = JSON.parse(response);
      if (!parsedResponse.success) {
        console.log(`*** Validate google captcha unsuccessfull. *** Response: ${JSON.stringify(response)}`);
        res.send({ 'type': 'error', 'msg': validateCaptchErrorMsg });
        return;
      }

      if (req.body.usertype == 'photographer') _type = '3';

      const _user = new User({
        'roleid': _type,
        'facebookid': '',
        'instagramid': '',
        'email': _email,
        'fullname': `${_firstname} ${_lastname}`,
        'firstname': _firstname,
        'middlename': '',
        'lastname': _lastname,
        'companyname': '',
        username,
        'password': md5(_password.toString()),
        'bio': '',
        'link': '',
        'coverimage': 'header-photo',
        'profileimage': 'photo-icon.png',
        'phonenumber': '',
        'addressline1': '',
        'paypalemail': _paypalemail,
        'addressline2': '',
        'city': '',
        'state': '',
        'country': _country,
        'isactive': true,
        'verificationcode': _verificationcode,
        'lastloggedindate': Date.now(),
        'isloggedin': true,
        'isdeleted': false,
        'adminpercentage': 30
      });
    
      User.esFindOne({
        'bool': {
          'should': [
            {
              'term': {
                'email': _email
              }
            },
            {
              'term': {
                username
              }
            }
          ],
          'must': [
            { 'term': { 'isdeleted': false } },
            { 'term': { 'isactive': true } }
          ],
          'minimum_should_match': 1
        }
      }, function(err, usr) {
        // User.findOne({"email": _email,"isactive":true,"isdeleted":false}, function(err, usr) {
        console.log('Registration: error getting user: ', err);
        if (err) return res.send({ 'type': 'error', 'msg': err });
        if (!usr) {
          console.log('Registration: user not exist, so we create it: ');
          _user.save(function(err, user) {
            if (err) res.send({ 'type': 'error', 'msg': err });
            else
    
              /*
                                           var mailOptions = {
                                                  //from: "info@photogallery.com",
                                                  from: "nits.krishnendu@gmail.com",
                                                  to: _email,
                                                  generateTextFromHTML: true,
                                                  subject: "Photogallery--Successfully Registered",
                                                  text: "",
                                                  html: "<b>Registration Details</b><br/><b>Email:</b>"+_email+"<br><b>Password:</b>"+_password+"<br/><b>Verification Code:</b>"+_verificationcode
                                              }
    
                                              smtpTransport.sendMail(mailOptions, function(error, response){
                                                  if(error){
                                                      console.log('Registration: error sending email');
                                                      //user.remove();
                                                      res.send({"type":"error","msg":'Error sending registration email: '+error});
                                                  }
                                                  else {
                                                      res.send({"type":"success","msg":user});
                                                  }
                                                  smtpTransport.close();
                                                });*/
              res.send({ 'type': 'success', 'msg': user });
    
          });
        }
        else res.send({ 'type': 'validate', 'msg': 'Email already exists.' });
      });
    })
    .catch(error => {
      console.log(`*** Validate google captcha error ***. Errror: ${error}`);
      res.send({ 'type': 'error', 'msg': validateCaptchErrorMsg })
    });
});

router.post('/userlogin', function(req, res, next) {
  const _email = req.body.email;
  const _password = md5(req.body.password.toString());

  // User.esFindOne({
  //   "bool": {
  //     "must": [
  //       { "term": { "email": _email } },
  //       { "term": { "password": _password } },
  //       { "term": { "isdeleted": false } },
  //     ],
  //     "must_not": [
  //       { "term": { "roleid": 1 } },
  //     ]
  //   }
  User.findOne({
    email: _email,
    password: _password,
    isdeleted: false
  }, function(err, user) {
    if (err) res.json({ error: 'error1', msg: err.message });
    else if (user == '' || user == null || (user && user.roleid === 1)) res.json({ error: 'error2', msg: 'User not found' });
    else {
      User.esUpdateOne({ '_id': user._id }, { $set: { 'lastloggedindate': Date.now(), 'isloggedin': true } }, function(error, doc) {

      });

      req.session.user = {
        _id: user._id,
        email: user.email,
        isactive: user.isactive,
        fullname: user.fullname
      };
      res.send(user);
    }
  });

  /*
      User.findOne({
          "email": _email,
          "password": _password,
          "roleid":{$ne: "1"},
          "isdeleted": false,
      }, function (err, user) {
          if (err) {
            res.send('error');
          } else if (user == '' || user == null) {
              res.send('error');
          } else {
              User.esUpdateOne({ "_id": user._id }, { $set: { "lastloggedindate": Date.now(), "isloggedin": true } }, function (error, doc) {

              });
              req.session.user = user;
              res.send(user);
          }
      });*/
});

router.post('/fblogin', function(req, res, next) {
  const accessToken = req.body.accessToken;
  console.log('data', accessToken);
  FB.setAccessToken(accessToken);
  FB.api('/me', { fields: ['id', 'email', 'name', 'first_name', 'last_name', 'middle_name'] }, function(profile) {
    console.log(profile);
    User.findOne({
      facebookid: profile.id,
      isdeleted: false
    }, function(err, user) {
      if (err) res.json({ error: 'fb_login_error', msg: err.message });
      else if (user == '' || user == null || (user && user.roleid === 1))
        // User not found , so create user
        User.create({
          facebookid: profile.id,
          username: profile.id,
          email: profile.email || '',
          firstname: profile.first_name,
          middlename: profile.last_name,
          lastname: profile.middle_name,
          fullname: profile.name,
          roleid: 'photographee',
          isdeleted: false,
          coverimage: 'header-photo',
          profileimage: 'photo-icon.png',
          isactive: true
        }, function(err, newUSer) {
          if (err) res.json({ error: 'register_user_error', msg: err.message });
          else {
            User.esUpdateOne({ '_id': newUSer._id }, { $set: { 'lastloggedindate': Date.now(), 'isloggedin': true } }, function(error, doc) {

            });

            req.session.user = {
              _id: newUSer._id,
              email: newUSer.email,
              isactive: newUSer.isactive
            };
            res.send(newUSer);
          }
        });
      else {
        User.esUpdateOne({ '_id': user._id }, { $set: { 'lastloggedindate': Date.now(), 'isloggedin': true } }, function(error, doc) {

        });

        req.session.user = {
          _id: user._id,
          email: user.email,
          isactive: user.isactive
        };
        res.send(user);
      }
    });
  });

});

router.post('/changepassword', function(req, res, next) {
  const _userId = req.body._id;
  const _newpassword = req.body.newpassword;
  const _lastpassword = md5(req.body.oldpassword.toString());

  User.esFindOne({
    'bool': {
      'must': [
        { 'term': { '_id': _userId } },
        { 'term': { 'password': _lastpassword } }
      ]
    }
  }, function(err, usr) {
    /* User.findOne({
        "_id": _userId,
        "password":_lastpassword
    }, function(err, usr) {*/
    if (err) return res.send({ 'type': 'error', 'msg': err });
    if (usr == null || usr == '') res.send({ 'type': 'error', 'msg': 'Old password does not match!' });

    else User.esUpdateOne({
      '_id': _userId
    }, {
      $set: {
        'password': md5(_newpassword.toString())
      }
    }, function(err, doc) {
      res.send({ 'type': 'success', 'msg': 'Password changed successfully' });
    });

  });
});

router.post('/changecurrency', function(req, res, next) {
  const _userid = req.body._id;
  const _currency = req.body.currency;

  if (_userid != '') User.esUpdateOne({ '_id': _userid }, { $set: { 'currency': _currency } }, function(err, user) {
    if (err) res.send({ 'type': 'error', 'msg': err });
    res.send({ 'type': 'success', 'msg': 'Currency updated successfully', 'userdata': user });
    //   User.esFindOne({
    //     term: { _id: _userid }
    //     /*User.findOne({
    //        "_id":_userid*/
    //   }, function (err, usr) {
    //     console.log(usr)
    //     res.send({ "type": "success", "msg": "Currency updated successfully", "userdata": usr });
    //   });
  });

  else res.send({ 'type': 'error', 'msg': 'User not valid!' });

});

router.post('/searchkeywords_new', function(req, res) {
  const _keyword = req.body.keyword;
  res.send({ 'type': 'success', 'msg': 1, 'userimage': _keyword });

  if (_keyword == '' || _keyword === undefined) res.send({ 'type': 'error', 'msg': 0 });

  else User.esFind({
    'filtered': {
      'filter': {
        'or': [
          { 'match': { 'firstname': regTextPrepare(_keyword) } },
          { 'match': { 'username': regTextPrepare(_keyword) } },
          { 'match': { 'email': regTextPrepare(_keyword) } },
          { 'match': { 'fullname': regTextPrepare(_keyword) } }
        ]
      }
    }
    /* User.find({
         $or:[ {'firstname':_keyword}, {'username':_keyword}, {'email':_keyword}, {'fullname':_keyword} ]*/
  }, function(err, user) {
    if (err) res.send({ 'type': 'error', 'msg': 0 });

    else if (user) res.send({ 'type': 'success', 'msg': 1, 'userimage': user });

    else res.send({ 'type': 'error', 'msg': 0 });

  });

});

router.post('/searchkeywords', function(req, res) {
  const _keyword = req.body.keyword;
  if (_keyword == '' || _keyword === undefined) res.send({ 'type': 'error', 'msg': 0 });

  else User.esFindOne({
    'filtered': {
      'filter': {
        'or': [
          { 'match': { 'firstname': regTextPrepare(_keyword) } },
          { 'match': { 'username': regTextPrepare(_keyword) } },
          { 'match': { 'email': regTextPrepare(_keyword) } },
          { 'match': { 'fullname': regTextPrepare(_keyword) } }
        ]
      }
    }
  }, function(err, user) {

    /* User.findOne({
        $or:[ {'firstname':_keyword}, {'username':_keyword}, {'email':_keyword}, {'fullname':_keyword} ]
     }, function (err, user) {*/
    if (err) res.send({ 'type': 'error', 'msg': 0 });

    else
    if (user) res.send({ 'type': 'success', 'msg': 1, 'userid': user._id });

    else res.send({ 'type': 'error', 'msg': 0 });

  });

});

router.post('/changeemail', function(req, res, next) {
  const _userid = req.body._id;
  const _email = req.body.email;

  if (_userid != '') User.esUpdateOne({ '_id': _userid }, { $set: { 'email': _email } }, function(err, user) {
    if (err) res.send({ 'type': 'error', 'msg': err });
    res.send({ 'type': 'success', 'msg': 'Email updated successfully', 'userdata': user });
    // User.esFindOne({
    //   term: { _id: _userid }
    //   /* User.findOne({
    //       "_id":_userid*/
    // }, function (err, usr) {
    //   res.send({ "type": "success", "msg": "Email updated successfully", "userdata": usr });
    // });
  });

  else res.send({ 'type': 'error', 'msg': 'User not valid!' });

});

router.post('/changepaypal', function(req, res, next) {
  const _userid = req.body._id;
  const _paypalemail = req.body.paypalemail;

  if (_userid != '') User.esUpdateOne({ '_id': _userid }, { $set: { 'paypalemail': _paypalemail } }, function(err, user) {
    if (err) res.send({ 'type': 'error', 'msg': err });
    res.send({ 'type': 'success', 'msg': 'Paypal email updated successfully', 'userdata': user });
    // User.esFindOne({
    //   term: { _id: _userid }
    //   /*User.findOne({
    //      "_id":_userid*/
    // }, function (err, usr) {
    //   res.send({ "type": "success", "msg": "Paypal email updated successfully", "userdata": usr });
    // });
  });

  else res.send({ 'type': 'error', 'msg': 'User not valid!' });

});

router.post('/changeprofile', function(req, res, next) {
  const _userid = req.body._id;
  const _fullname = req.body.fullname;
  const _bio = req.body.bio;
  const _username = req.body.username;
  const _link = req.body.link;

  if (_userid != '') User.esUpdateOne({ '_id': _userid }, { $set: { 'fullname': _fullname, 'bio': _bio, 'username': _username, 'link': _link } }, function(err, user) {
    if (err) res.send({ 'type': 'error', 'msg': err });
    res.send({ 'type': 'success', 'msg': 'Profile updated successfully', 'userdata': user });
    // User.esFindOne({
    //   term: { _id: _userid }

    //   /*User.findOne({
    //      "_id":_userid*/
    // }, function (err, usr) {
    //   res.send({ "type": "success", "msg": "Profile updated successfully", "userdata": usr });
    // });
  });

  else res.send({ 'type': 'error', 'msg': 'User not valid!' });

});

router.post('/changeusername', function(req, res, next) {
  const _userid = req.body._id;
  const _username = req.body.username;

  if (_userid != '')

  // User.esUpdateOne({ "_id": _userid }, { $set: { 'username': _username } }, function (err, user) {
  //   if (err) res.send({ "type": "error", "msg": err });

  //   User.esFindOne({
  //     term: { _id: _userid }

  //     /*User.findOne({
  //        "_id":_userid*/
  //   }, function (err, usr) {
  //     res.send({ "type": "success", "msg": "Username updated successfully", "userdata": usr });
  //   });
  // });

    User.esUpdateOne(
      { '_id': _userid }, { $set: { 'username': _username } }
      , function(err, usr) {
        if (err) res.send({ 'type': 'error', 'msg': err });
        res.send({ 'type': 'success', 'msg': 'Username updated successfully', 'userdata': usr });
      });

  else res.send({ 'type': 'error', 'msg': 'User not valid!' });

});

router.post('/changebio', function(req, res, next) {
  const _userid = req.body._id;
  const _bio = req.body.bio;

  if (_userid != '') User.esUpdateOne({ '_id': _userid }, { $set: { 'bio': _bio } }, function(err, user) {
    if (err) res.send({ 'type': 'error', 'msg': err });
    res.send({ 'type': 'success', 'msg': 'Bio updated successfully', 'userdata': user });
    // User.esFindOne({
    //   term: { _id: _userid }
    //   /*User.findOne({
    //      "_id":_userid*/
    // }, function (err, usr) {
    //   res.send({ "type": "success", "msg": "Bio updated successfully", "userdata": usr });
    // });
  });

  else res.send({ 'type': 'error', 'msg': 'User not valid!' });

});

router.post('/changeprofileimage', function(req, res, next) {
  const _userid = req.body._id;
  const _image = req.body.image;
  if (_userid != '') User.esUpdateOne({ '_id': _userid }, { $set: { 'profileimage': _image } }, function(err, user) {
    if (err) res.send({ 'type': 'error', 'msg': err });
    res.send({ 'type': 'success', 'msg': 'Profile image updated successfully', 'userdata': user });
    // User.esFindOne({
    //   term: { _id: _userid }
    //   /*User.findOne({
    //      "_id":_userid*/
    // }, function (err, usr) {
    //   res.send({ "type": "success", "msg": "Profile image updated successfully", "userdata": usr });
    // });
  });

  else res.send({ 'type': 'error', 'msg': 'User not valid!' });

});

router.post('/changewatermark1', function(req, res, next) {
  const _userid = req.body._id;
  const _image = req.body.watermark1;
  if (_userid != '') User.esUpdateOne({ '_id': _userid }, { $set: { 'watermark1': _image, 'is_watermark1_uploaded': 0, 'margedwatermark1': '' } }, function(err, user) {
    if (err) res.send({ 'type': 'error', 'msg': err });
    res.send({ 'type': 'success', 'msg': 'Watermark updated successfully', 'userdata': user });

    // User.esFindOne({
    //   term: { _id: _userid }
    //   /*User.findOne({
    //      "_id":_userid*/
    // }, function (err, usr) {
    //   res.send({ "type": "success", "msg": "Watermark updated successfully", "userdata": usr });
    // });
  });

  else res.send({ 'type': 'error', 'msg': 'User not valid!' });

});

router.post('/changewatermark2', function(req, res, next) {
  const _userid = req.body._id;
  const _image = req.body.watermark2;
  if (_userid != '') User.esUpdateOne({ '_id': _userid }, { $set: { 'watermark2': _image, 'is_watermark2_uploaded': 0, 'margedwatermark2': '' } }, function(err, user) {
    if (err) res.send({ 'type': 'error', 'msg': err });
    res.send({ 'type': 'success', 'msg': 'Watermark updated successfully', 'userdata': user });
    // User.esFindOne({
    //   term: { _id: _userid }
    //   /*User.findOne({
    //      "_id":_userid*/
    // }, function (err, usr) {
    //   res.send({ "type": "success", "msg": "Watermark updated successfully", "userdata": usr });
    // });
  });

  else res.send({ 'type': 'error', 'msg': 'User not valid!' });

});

router.post('/changecoverimage', function(req, res, next) {
  const _userid = req.body._id;
  const _image = req.body.coverimage;
  if (_userid != '') User.esUpdateOne({ '_id': _userid }, { $set: { 'coverimage': _image } }, function(err, user) {
    if (err) res.send({ 'type': 'error', 'msg': err });
    res.send({ 'type': 'success', 'msg': 'Cover image updated successfully', 'userdata': user });
    // User.esFindOne({
    //   term: { _id: _userid }
    //   /*User.findOne({
    //      "_id":_userid*/
    // }, function (err, usr) {
    //   res.send({ "type": "success", "msg": "Cover image updated successfully", "userdata": usr });
    // });
  });

  else res.send({ 'type': 'error', 'msg': 'User not valid!' });

});

router.post('/forgotpassword', function(req, res, next) {
  const useremail = req.body.email;
  User.esFindOne({
    'match': { 'email': es_helper.regTextPrepare(useremail) }
    /* User.findOne({
        "email": useremail*/
  }, function(err, usr) {
    if (err) res.send({ 'type': 'error', 'msg': err });

    if (usr == null || usr == '') res.send({ 'type': 'error', 'msg': 'User does not exist' });
    else {
      const _newpasswordRand = Math.floor(Math.random() * 90000) + 10000;
      const newpassword = md5(_newpasswordRand.toString());
      const password = newpassword;
      const _userid = usr._id;

      User.esUpdateOne({
        '_id': _userid
      }, {
        $set: {
          password
        }
      }, function(err, doc) {

        const mailOptions = {
          from: 'info@photogallery.com',
          to: useremail,
          generateTextFromHTML: true,
          subject: 'Forgot password request successful',
          text: '',
          html: `<b>New password:${_newpasswordRand}</b>`
        };
        smtpTransport.sendMail(mailOptions, function(error, response) {
          if (error) res.send({ 'type': 'error', 'msg': err });

          smtpTransport.close();

          res.send({ 'type': 'success', 'msg': 'Password request successfully processed .Please check your mail to retrieve password' });

        });
      });
    }
  });

});

/* router.post('/adminauthlogin', function(req, res, next) {
       res.json(req.session.adminuser);
});*/

router.post('/userauthlogin', function(req, res, next) {
  res.json(req.session.user);
});
router.get('/userdetails/:username', function(req, res, next) {
  const username = req.params.username;
  User.esFindOne({
    term: { username }
    // User.findOne({
    //     "username": username
  }, function(err, usr) {
    if (err) return res.send({ 'type': 'error', 'msg': err });
    res.send({ 'type': 'success', 'msg': usr });
  });
});

router.get('/usertags/:id', function(req, res, next) {
  const id = req.params.id;
  const ret_tags = [];
  let tcount = 0;
  UserGalleries.esFind({
    term: { userid: id }
    /* UserGalleries.find({
        "userid": id*/
  }, function(err, usr) {
    if (err) return res.send({ 'type': 'error', 'msg': err });
    usr.forEach(function(data, index) {
      const tags = data.tags;
      tags.forEach(function(tag, ind) {
        if (tcount >= 4) return false;
        else ret_tags.push(tag);

        tcount++;
      });

    });
    res.send({ 'type': 'success', 'msg': ret_tags });
  });
});

router.get('/userimages/:id', function(req, res, next) {
  const id = req.params.id;
  const ret_tags = [];
  let tcount = 0;

  UserGalleries.esFind({
    term: { userid: id }
    /* UserGalleries.find({
        "userid": id*/
  }, function(err, usr) {
    if (err) return res.send({ 'type': 'error', 'msg': err });
    usr.forEach(function(data, index) {
      if (tcount >= 9) return false;
      else ret_tags.push(data);
      tcount++;
    });
    res.send({ 'type': 'success', 'msg': ret_tags });
  });
});

module.exports = router;
