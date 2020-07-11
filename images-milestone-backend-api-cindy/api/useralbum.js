const express = require('express');
const async = require('async');
const helper = require('../components/es_helper');
const mongoose = require('mongoose');
const User = require('../models/usersmodel');
const UserAlbum = require('../models/useralbumsmodel');
const Downloads = require('../models/downloadmodel');
const Tags = require('../models/tagsmodel');
const Collections = require('../models/usercollectionsmodel');
const Cart = require('../models/cartmodel');
const Settings = require('../models/settingsmodel');
const Payments = require('../models/paymentmodel');
const Sales = require('../models/salemodel');
const router = express.Router();
const paypal = require('./paypal.js');
const fs = require('fs');
const path = require('path');
const sizeOfImg = require('image-size');
const ftpClient = require('ftp');
const ftpAccess = require('../config/ftp_access');
const formidable = require('formidable');
const Promise = require('bluebird');
const routeCache = require('../components/routeCache');

require('../events/albumEvent');
const eventBus = require('../components/eventBus');

const regTextPrepare = helper.regTextPrepare;

const h4PrefixMaxDate = new Date('11/16/2019');

router.use('/uploader/:albumId', function(req, res) {
  const form = new formidable.IncomingForm({
    uploadDir: `${__dirname}/uploads/`,
    keepExtensions: true
  });

  form.parse(req, (err, fields, files) => {
    if (err) return res.status(500).send(err);

    const fileInfo = files.file.toJSON();

    const fileStructure = path.parse(fileInfo.path);

    if (!(req.session && req.session.user)) return res.status(500).send('session is expired');

    const client = new ftpClient();
    client.on('ready', function() {
      const fileExtension = fileStructure.ext.slice(1).toLowerCase();
      const fileId = mongoose.Types.ObjectId();

      const name = `${fileId}.${fileExtension}`;
      const userData = req.session.user;
      const dimensions = sizeOfImg(fileInfo.path);
      const filenamepng = `${fileInfo.name.split('.').slice(0, -1).join('.')}.png`;
      const filename = fileInfo.name.split('.').slice(0, -1);

      async.waterfall([
        (callback) => {
          require('./watermark_2')
            .start(fileInfo.name, userData.fullname, dimensions)
            .then(() => {
              const {albumId} = req.params;
              UserAlbum.findById(albumId, (err, album) => {
                let prefix = 'h5_';
                if (album && new Date(album.date) < h4PrefixMaxDate) {
                  prefix = 'h4_';
                }
                client.put(`${__dirname}/uploads/watermarked_2/${fileInfo.name}`, `/photoImages/bunch/${prefix}${name}`, callback);
              });
            }).catch(callback); // added for watermarking picture by node
        },
        (callback) => {
          async.parallel([
            (callback) => {
              client.put(`${__dirname}/uploads/${fileInfo.name}`, `/photoImages/bunch/${name}`, callback);
            },
            (callback) => {
              client.put(`${__dirname}/uploads/thumbnail/${fileInfo.name}`, `/photoImages/thumbnail/${name}`, callback);
            }
          ], callback);
        },
        (data, callback) => {
          async.parallel([
            (callback) => {
              const filepath = `${__dirname}/watermark-second/${filename}_water.png`;
              fs.unlink(filepath, err => {
                console.log(`*** Error unlinking ${filepath}. Error: ${err}`);
                callback();
              });
            },
            (callback) => {
              const filepath = `${__dirname}/uploads/thumbnail/${fileInfo.name}`;
              fs.unlink(filepath, err => {
                console.log(`*** Error unlinking ${filepath}. Error: ${err}`);
                callback();
              });
            },
            (callback) => {
              const filepath = `${__dirname}/watermark-second/${filename}_name.png`;
              fs.unlink(filepath, err => {
                console.log(`*** Error unlinking ${filepath}. Error: ${err}`);
                callback();
              });
            },
            (callback) => {
              const filepath = `${__dirname}/uploads/watermarks/${filenamepng}`;
              fs.unlink(filepath, err => {
                console.log(`*** Error unlinking ${filepath}. Error: ${err}`);
                callback();
              });
            },
            (callback) => {
              const filepath = `${__dirname}/uploads/watermarks_2/${filenamepng}`;
              fs.unlink(filepath, err => {
                console.log(`*** Error unlinking ${filepath}. Error: ${err}`);
                callback();
              });
            },
            (callback) => {
              const filepath = `${__dirname}/watermark-second/${fileInfo.name}`;
              fs.unlink(filepath, err => {
                console.log(`*** Error unlinking ${filepath}. Error: ${err}`);
                callback();
              });
            },
            (callback) => {
              const filepath = `${__dirname}/uploads/watermarked_2/${fileInfo.name}`;
              fs.unlink(filepath, err => {
                console.log(`*** Error unlinking ${filepath}. Error: ${err}`);
                callback();
              })
            },
            (callback) => {
              const filepath = `${__dirname}/uploads/${fileInfo.name}`;
              fs.unlink(filepath, err => {
                console.log(`*** Error unlinking ${filepath}. Error: ${err}`);
                callback();
              })
            },
            (callback) => {
              const filepath = `${__dirname}/uploads/tmp_${fileInfo.name}`;
              fs.unlink(filepath, err => {
                console.log(`*** Error unlinking ${filepath}. Error: ${err}`);
                callback();
              })
            }
          ], callback);
        }
      ], function(err, result) {
        if (err) return res.status(500).send((err && err.message) || err);

        client.end();

        eventBus.emit('albumImgAdd', {
          userData,
          req,
          fileId,
          fileExtension,
          dimensions,
          fileInfo,
          rezultSend: { files: [] },
          callback(send) {
            const promises = [];

            promises.push(routeCache.del('getnoofalbums*', function() { }));
            promises.push(routeCache.del('getlastphotos*', function() { }));
            promises.push(routeCache.del(`getalbums:userid:${userData._id}*`, function() { }));

            Promise.all(promises)
              .then(function() {
                res.json(JSON.parse(send));
              }).catch(function() {
                res.json(JSON.parse(send));
              });
          }
        });
      });
    });

    fileInfo.name = fileInfo.name.replace(/\s/g, '_');

    fs.rename(fileInfo.path, `${fileStructure.dir}/${fileInfo.name}`, (err) => {
      if (err) return res.status(500).send((err && err.message) || err);

      fileInfo.path = `${fileStructure.dir}/${fileInfo.name}`;

      client.connect(ftpAccess);
    });
  });
});

router.post('/payment_paypal', function(req, res, next) {
  const _payerid = req.body.payerid;
  const _albumid = req.body.albumid;

  UserAlbum.esFindOne({
    term: {
      _id: _albumid
    }
    /* UserAlbum.findOne({
     "_id":_albumid*/
  }, function(err, useralbum) {
    if (err) res.send({
      type: 'error',
      msg: 'Some error occurred. Please try again later.'
    });
    else if (useralbum) {
      const _albumprice = useralbum.price;
      const _albumsymbol = useralbum.symbol;

      // paypal payment configuration.
      const payment = {
        'intent': 'sale',
        'payer': {
          'payment_method': 'paypal'
        },
        'redirect_urls': {
          'return_url': `${paypal.merchantURL}/success/${_albumid}`,
          'cancel_url': `${paypal.merchantURL}/cancel`
        },
        'transactions': [{
          'amount': {
            'total': _albumprice,
            'currency': 'USD'
          },
          'description': 'This is the payment for buying album.'
        }]
      };
      paypal.paypal_api.payment.create(payment, function(error, payment) {
        if (error) {
          console.log(error);
          return res.send({
            'type': 'error',
            error
          });
        } else {
          console.log('Paypal payment: ', payment);
          const redirectUrl = paypal.getApprovalURL(payment.links);
          res.send({
            'type': 'success',
            'url': redirectUrl
          });
        }
      });
    }
  });
});

router.post('/executepayment', function(req, res, next) {

  const payerId = req.body.payerId;
  const paymentId = req.body.paymentId;
  const userId = req.body.userId;
  const albumId = req.body.albumId;

  const execute_payment_json = {
    'payer_id': payerId
  };
  console.log('executing payment: ', req.body);
  console.log('payerId: ', execute_payment_json);
  // The buyer pays to the platform all items in the cart
  paypal.paypal_api.payment.execute(paymentId, execute_payment_json, function(error, payment) {
    if (error) {
      console.log(error.response);
      res.send({
        type: 'error',
        msg: error.response.message
      });
      return;
    }
    // Once we get the payment for all items in the cart we pay to each photographer
    console.log('Get Album Payment Response');
    console.log(JSON.stringify(payment));
    UserAlbum.esFindOne({
      term: {
        _id: albumId
      }
    }, function(err, album) {
      if (err || !album) {
        console.log(`Error: album with id ${albumId} not found`);
        res.send({
          type: 'error',
          msg: 'Album not found.'
        });
        return;
      }

      User.findOne({
        '_id': album.userid
      }, function(err, user) {
        console.log('Find author error :', err);
        if (err || !user) res.send({
          type: 'error',
          msg: 'Album author not found.'
        });

        const _paypalemail = user.paypalemail;
        const ADMIN_PERCENTAGE = user.adminpercentage;
        const authorAmount = album.price * (1 - ADMIN_PERCENTAGE / 100);
        if (!_paypalemail) {
          res.send({
            type: 'error',
            msg: 'Album author doesn\'t have paypalemail'
          });
          return;
        }
        paypal.pay(_paypalemail, authorAmount, `Photography Album Payment: albumid = ${album._id}`, function(err, response) {
          console.log('Payment to the author done', response);
          const _sale = new Sales({
            'userid': user._id,
            // 'payerid': payerId,
            'payerid': userId,
            // 'type': 'Image',
            'type': 'Album',
            'totalamount': album.price,
            'adminpercentage': album.price * (ADMIN_PERCENTAGE / 100),
            'totalearnings': authorAmount,
            'paymentid': paymentId,
            'ack': response.responseEnvelope.ack,
            'corelationid': response.responseEnvelope.correlationId
          });
          if (err) {
            _sale.paykey = '';
            _sale.transactionid = '';
            _sale.transactionstatus = '';
            _sale.message = response.error[0].message;
          } else {
            _sale.paykey = response.payKey;
            _sale.transactionid = response.paymentInfoList.paymentInfo[0].transactionId;
            _sale.transactionstatus = response.paymentInfoList.paymentInfo[0].transactionStatus;
            _sale.message = '';
          }

          return new Promise(function(resolve, reject) {
            _sale.save(function(err, sale) {
              if (err) return reject(err);

              resolve(sale);
            });
          }).then(function() {
            console.log('Create payment');

            // Create payment
            const _payment = new Payments({
              'userid': album.userid,
              'payerid': userId,
              'payerphone': '',
              'type': 'Album',
              'totalamount': album.price,
              'paymentid': paymentId,
              'status': 'Approved'
            });

            return new Promise(function(resolve, reject) {
              _payment.save(function(err, payment) {
                if (err) return reject(err);

                resolve(payment);
              });
            });
          }).then(function() {
            console.log('Create download');

            // Create download
            return Promise.each(album.images, function(image) {
              if (!image.publicid) return Promise.resolve();

              return new Promise(function(resolve, reject) {
                const _downloads = new Downloads({
                  'gallery_id': albumId,
                  'image_id': image.publicid,
                  'buyer_id': userId,
                  'status': '1',
                  'downloadtype': 'album',
                  'downloadlink': `https://stock.vavel.com/s/photoImages/bunch/${image.publicid}.${image.fileExtension.toLowerCase()}`
                });

                _downloads.save(function(err, download) {
                  resolve();
                });
              });
            });
          }).then(function() {
            res.send({
              'type': 'success'
            });
          }).catch(function(err) {
            console.log(err);

            res.send({
              type: 'error',
              msg: 'Some error occurred. Please try again later.'
            });
          });
        });
      });
    });
  });
});

router.get('/savepaypalsuccess/:userid/:albumid/:paypalId', function(req, res, next) {
  const _payerid = req.params.userid;
  const _albumid = req.params.albumid;
  const pyid = req.params.paypalId;

  User.esFindOne({
    term: {
      _id: _payerid
    }
    // User.findOne({'_id':_payerid
  }, function(err, user) {
    if (err) res.send({
      type: 'error',
      msg: 'Some error occurred. Please try again later.'
    });
    else if (user) UserAlbum.esFindOne({
      term: {
        _id: _albumid
      }
      /* UserAlbum.findOne({
            "_id":_albumid*/
    }, function(err, useralbum) {
      if (err) res.send({
        type: 'error',
        msg: 'Some error occurred. Please try again later.'
      });
      else if (useralbum) {
        const _albumprice = useralbum.price;
        const _albumadminpercentage = useralbum.adminpercentage;
        const _albumauthorid = useralbum.userid;
        const _firstname = user.firstname;
        const _lastname = user.lastname;

        const _payment = new Payments({
          'userid': _albumauthorid,
          'payerid': _payerid,
          'payerphone': '',
          'type': 'Album',
          'totalamount': _albumprice,
          'paymentid': pyid, // result.id
          'status': 'Approved'
        });
        _payment.save(function(err, payment) { });

        /* ------------------Adaptive-------------------*/
        if (_albumadminpercentage == '' || _albumadminpercentage == 0 || _albumadminpercentage === undefined) User.esFindOne({
          term: {
            _id: _albumauthorid
          }
          // User.findOne({'_id':_albumauthorid
        }, function(err, author) {
          const _authoradminpercentage = author.adminpercentage;
          const _paypalemail = author.paypalemail;
          if (_authoradminpercentage == '' || _authoradminpercentage == 0 || _authoradminpercentage === undefined) Settings.esFindOne({
            term: {
              edit: 1
            }
            // Settings.findOne({"edit":1
          }, function(err, settings) {
            const _adminpercentage = settings.adminpercentage;
            const _albumpricepercent = (_albumprice * _adminpercentage) / 100;
            const _remaining = (_albumprice - _albumpricepercent);
            if (_paypalemail == '' || _paypalemail === undefined) {
              const _sale = new Sales({
                'userid': _albumauthorid,
                'payerid': _payerid,
                'type': 'Album',
                'totalamount': _albumprice,
                'adminpercentage': _albumpricepercent,
                'totalearnings': _remaining,
                'paymentid': pyid,
                'paykey': '',
                'transactionid': '',
                'transactionstatus': '',
                'ack': 'Success',
                'corelationid': '',
                'message': 'Photographer\'s paypal email not added'
              });
              _sale.save(function(err, sale) { });
            } else paypal.pay(_paypalemail, _remaining, 'Photography Album Payment', function(err, response) {
              if (err) {
                var _sale = new Sales({
                  'userid': _albumauthorid,
                  'payerid': _payerid,
                  'type': 'Album',
                  'totalamount': _albumprice,
                  'adminpercentage': _albumpricepercent,
                  'totalearnings': _remaining,
                  'paymentid': pyid,
                  'paykey': '',
                  'transactionid': '',
                  'transactionstatus': '',
                  'ack': response.responseEnvelope.ack,
                  'corelationid': response.responseEnvelope.correlationId,
                  'message': response.error[0].message
                });
                _sale.save(function(err, sale) { });
              } else {
                var _sale = new Sales({
                  'userid': _albumauthorid,
                  'payerid': _payerid,
                  'type': 'Album',
                  'totalamount': _albumprice,
                  'adminpercentage': _albumpricepercent,
                  'totalearnings': _remaining,
                  'paymentid': pyid,
                  'paykey': response.payKey,
                  'transactionid': response.paymentInfoList.paymentInfo[0].transactionId,
                  'transactionstatus': response.paymentInfoList.paymentInfo[0].transactionStatus,
                  'ack': response.responseEnvelope.ack,
                  'corelationid': response.responseEnvelope.correlationId,
                  'message': ''
                });
                _sale.save(function(err, sale) { });
              }
            });

          });
          else {
            const _albumpricepercent = (_albumprice * _authoradminpercentage) / 100;
            const _remaining = (_albumprice - _albumpricepercent);
            if (_paypalemail == '' || _paypalemail === undefined) {
              const _sale = new Sales({
                'userid': _albumauthorid,
                'payerid': _payerid,
                'type': 'Album',
                'totalamount': _albumprice,
                'adminpercentage': _albumpricepercent,
                'totalearnings': _remaining,
                'paymentid': pyid,
                'paykey': '',
                'transactionid': '',
                'transactionstatus': '',
                'ack': 'Success',
                'corelationid': '',
                'message': 'Photographer\'s paypal email not added'
              });
              _sale.save(function(err, sale) { });
            } else paypal.pay(_paypalemail, _remaining, 'Photography Album Payment', function(err, response) {
              if (err) {
                var _sale = new Sales({
                  'userid': _albumauthorid,
                  'payerid': _payerid,
                  'type': 'Album',
                  'totalamount': _albumprice,
                  'adminpercentage': _albumpricepercent,
                  'totalearnings': _remaining,
                  'paymentid': pyid,
                  'paykey': '',
                  'transactionid': '',
                  'transactionstatus': '',
                  'ack': response.responseEnvelope.ack,
                  'corelationid': response.responseEnvelope.correlationId,
                  'message': response.error[0].message
                });
                _sale.save(function(err, sale) { });
              } else {
                var _sale = new Sales({
                  'userid': _albumauthorid,
                  'payerid': _payerid,
                  'type': 'Album',
                  'totalamount': _albumprice,
                  'adminpercentage': _albumpricepercent,
                  'totalearnings': _remaining,
                  'paymentid': pyid,
                  'paykey': response.payKey,
                  'transactionid': response.paymentInfoList.paymentInfo[0].transactionId,
                  'transactionstatus': response.paymentInfoList.paymentInfo[0].transactionStatus,
                  'ack': response.responseEnvelope.ack,
                  'corelationid': response.responseEnvelope.correlationId,
                  'message': ''
                });
                _sale.save(function(err, sale) { });
              }
            });

          }
        });
        else User.esFindOne({
          term: {
            _id: _albumauthorid
          }
          // User.findOne({'_id':_albumauthorid
        }, function(err, author) {
          const _paypalemail = author.paypalemail;
          const _albumpricepercent = (_albumprice * _albumadminpercentage) / 100;
          const _remaining = (_albumprice - _albumpricepercent);
          if (_paypalemail == '' || _paypalemail === undefined) {
            const _sale = new Sales({
              'userid': _albumauthorid,
              'payerid': _payerid,
              'type': 'Album',
              'totalamount': _albumprice,
              'adminpercentage': _albumpricepercent,
              'totalearnings': _remaining,
              'paymentid': pyid,
              'paykey': '',
              'transactionid': '',
              'transactionstatus': '',
              'ack': 'Success',
              'corelationid': '',
              'message': 'Photographer\'s paypal email not added'
            });
            _sale.save(function(err, sale) { });
          } else paypal.pay(_paypalemail, _remaining, 'Photography Album Payment', function(err, response) {
            if (err) {
              var _sale = new Sales({
                'userid': _albumauthorid,
                'payerid': _payerid,
                'type': 'Album',
                'totalamount': _albumprice,
                'adminpercentage': _albumpricepercent,
                'totalearnings': _remaining,
                'paymentid': pyid,
                'paykey': '',
                'transactionid': '',
                'transactionstatus': '',
                'ack': response.responseEnvelope.ack,
                'corelationid': response.responseEnvelope.correlationId,
                'message': response.error[0].message
              });
              _sale.save(function(err, sale) { });
            } else {
              var _sale = new Sales({
                'userid': _albumauthorid,
                'payerid': _payerid,
                'type': 'Album',
                'totalamount': _albumprice,
                'adminpercentage': _albumpricepercent,
                'totalearnings': _remaining,
                'paymentid': pyid,
                'paykey': response.payKey,
                'transactionid': response.paymentInfoList.paymentInfo[0].transactionId,
                'transactionstatus': response.paymentInfoList.paymentInfo[0].transactionStatus,
                'ack': response.responseEnvelope.ack,
                'corelationid': response.responseEnvelope.correlationId,
                'message': ''
              });
              _sale.save(function(err, sale) { });
            }
          });

        });

        /* -------------------------------------*/

        async.each(useralbum.images, function(collec) {
          if (collec.publicid != '') {

            const _downloads = new Downloads({
              'gallery_id': _albumid,
              'image_id': collec.publicid,
              'buyer_id': _payerid,
              'status': '1',
              'downloadtype': 'album',
              'downloadlink': `https://stock.vavel.com/s/photoImages/bunch/${collec.publicid}.${collec.fileExtension}`
            });
            _downloads.save(function(err, download) { });

          }
        }, function() { });
        res.send({
          'type': 'success',
          'msg': 'Thanks! You have made payment successfully.'
        });
      } else res.send({
        type: 'error',
        msg: 'Some error occurred. Please try again later.'
      });

    });
    else res.send({
      type: 'error',
      msg: 'Some error occurred. Please try again later.'
    });

  });

});

router.post('/payment', function(req, res, next) {
  const _selectedplanname = req.body.selectedplanname;
  const _payerid = req.body.payerid;
  const _cardnumber = req.body.cardnumber;
  const _expirydate = req.body.expirydate;
  const _expirydateexp = _expirydate.split('/');
  const _cvcnumber = req.body.cvcnumber;
  const _phonenumber = req.body.phonenumber;
  const _albumid = req.body.albumid;

  /*  // paypal auth configuration
    var config = {
      "api": {
        "host": "api.sandbox.paypal.com",
        "port": "",
        "client_id": "AbKFI5oxOVC6rzRTSHzStUt-YcmqESLZuS1Rg22qbuOyrQNHPIlQcsi6yKjI5cUIdXnbMXLrgn-dyqR5", // your paypal application client id
        "client_secret": "EMdU5s8gK8cPnFrD7njXBzwxJA1aRRpdYBZX4Cvs10a0bF2DTEzkVGj4L9GWUApbHSUspzYmaFRfMA5u" // your paypal application secret id
      }
    }
    paypal.paypal_api.configure(config.api);
  */
  User.esFindOne({
    term: {
      _id: _payerid
    }
    // User.findOne({'_id':_payerid
  }, function(err, user) {
    if (err) res.send({
      type: 'error',
      msg: 'Some error occurred. Please try again later.'
    });
    else if (user) UserAlbum.esFindOne({
      term: {
        _id: _albumid
      }
      /* UserAlbum.findOne({
           "_id":_albumid*/
    }, function(err, useralbum) {
      if (err) res.send({
        type: 'error',
        msg: 'Some error occurred. Please try again later.'
      });
      else if (useralbum) {
        const _albumprice = useralbum.price;
        const _albumadminpercentage = useralbum.adminpercentage;
        const _albumauthorid = useralbum.userid;
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
              'total': _albumprice,
              'currency': 'USD'
            },
            'description': 'This is the payment for buying album.'
          }]
        };
        paypal.paypal_api.payment.create(create_payment_json, function(err, result) {
          if (err) res.send({
            type: 'error',
            msg: `${err.response.message}.`
          });
          else if (result.state == 'approved') {

            const _payment = new Payments({
              'userid': _albumauthorid,
              'payerid': _payerid,
              'payerphone': _phonenumber,
              'type': 'Album',
              'totalamount': _albumprice,
              'paymentid': result.id,
              'status': 'Approved'
            });
            _payment.save(function(err, payment) { });

            /* ------------------Adaptive-------------------*/
            if (_albumadminpercentage == '' || _albumadminpercentage == 0 || _albumadminpercentage === undefined) User.esFindOne({
              term: {
                _id: _albumauthorid
              }
              // User.findOne({'_id':_albumauthorid
            }, function(err, author) {
              const _authoradminpercentage = author.adminpercentage;
              const _paypalemail = author.paypalemail;
              if (_authoradminpercentage == '' || _authoradminpercentage == 0 || _authoradminpercentage === undefined) Settings.esFindOne({
                term: {
                  edit: 1
                }
                // Settings.findOne({"edit":1
              }, function(err, settings) {
                const _adminpercentage = settings.adminpercentage;
                const _albumpricepercent = (_albumprice * _adminpercentage) / 100;
                const _remaining = (_albumprice - _albumpricepercent);
                if (_paypalemail == '' || _paypalemail === undefined) {
                  const _sale = new Sales({
                    'userid': _albumauthorid,
                    'payerid': _payerid,
                    'type': 'Album',
                    'totalamount': _albumprice,
                    'adminpercentage': _albumpricepercent,
                    'totalearnings': _remaining,
                    'paymentid': result.id,
                    'paykey': '',
                    'transactionid': '',
                    'transactionstatus': '',
                    'ack': 'Success',
                    'corelationid': '',
                    'message': 'Photographer\'s paypal email not added'
                  });
                  _sale.save(function(err, sale) { });
                } else paypal.pay(_paypalemail, _remaining, 'Photography Album Payment', function(err, response) {
                  if (err) {
                    var _sale = new Sales({
                      'userid': _albumauthorid,
                      'payerid': _payerid,
                      'type': 'Album',
                      'totalamount': _albumprice,
                      'adminpercentage': _albumpricepercent,
                      'totalearnings': _remaining,
                      'paymentid': result.id,
                      'paykey': '',
                      'transactionid': '',
                      'transactionstatus': '',
                      'ack': response.responseEnvelope.ack,
                      'corelationid': response.responseEnvelope.correlationId,
                      'message': response.error[0].message
                    });
                    _sale.save(function(err, sale) { });
                  } else {
                    var _sale = new Sales({
                      'userid': _albumauthorid,
                      'payerid': _payerid,
                      'type': 'Album',
                      'totalamount': _albumprice,
                      'adminpercentage': _albumpricepercent,
                      'totalearnings': _remaining,
                      'paymentid': result.id,
                      'paykey': response.payKey,
                      'transactionid': response.paymentInfoList.paymentInfo[0].transactionId,
                      'transactionstatus': response.paymentInfoList.paymentInfo[0].transactionStatus,
                      'ack': response.responseEnvelope.ack,
                      'corelationid': response.responseEnvelope.correlationId,
                      'message': ''
                    });
                    _sale.save(function(err, sale) { });
                  }
                });

              });
              else {
                const _albumpricepercent = (_albumprice * _authoradminpercentage) / 100;
                const _remaining = (_albumprice - _albumpricepercent);
                if (_paypalemail == '' || _paypalemail === undefined) {
                  const _sale = new Sales({
                    'userid': _albumauthorid,
                    'payerid': _payerid,
                    'type': 'Album',
                    'totalamount': _albumprice,
                    'adminpercentage': _albumpricepercent,
                    'totalearnings': _remaining,
                    'paymentid': result.id,
                    'paykey': '',
                    'transactionid': '',
                    'transactionstatus': '',
                    'ack': 'Success',
                    'corelationid': '',
                    'message': 'Photographer\'s paypal email not added'
                  });
                  _sale.save(function(err, sale) { });
                } else paypal.pay(_paypalemail, _remaining, 'Photography Album Payment', function(err, response) {
                  if (err) {
                    var _sale = new Sales({
                      'userid': _albumauthorid,
                      'payerid': _payerid,
                      'type': 'Album',
                      'totalamount': _albumprice,
                      'adminpercentage': _albumpricepercent,
                      'totalearnings': _remaining,
                      'paymentid': result.id,
                      'paykey': '',
                      'transactionid': '',
                      'transactionstatus': '',
                      'ack': response.responseEnvelope.ack,
                      'corelationid': response.responseEnvelope.correlationId,
                      'message': response.error[0].message
                    });
                    _sale.save(function(err, sale) { });
                  } else {
                    var _sale = new Sales({
                      'userid': _albumauthorid,
                      'payerid': _payerid,
                      'type': 'Album',
                      'totalamount': _albumprice,
                      'adminpercentage': _albumpricepercent,
                      'totalearnings': _remaining,
                      'paymentid': result.id,
                      'paykey': response.payKey,
                      'transactionid': response.paymentInfoList.paymentInfo[0].transactionId,
                      'transactionstatus': response.paymentInfoList.paymentInfo[0].transactionStatus,
                      'ack': response.responseEnvelope.ack,
                      'corelationid': response.responseEnvelope.correlationId,
                      'message': ''
                    });
                    _sale.save(function(err, sale) { });
                  }
                });

              }
            });
            else User.esFindOne({
              term: {
                _id: _albumauthorid
              }
              // User.findOne({'_id':_albumauthorid
            }, function(err, author) {
              const _paypalemail = author.paypalemail;
              const _albumpricepercent = (_albumprice * _albumadminpercentage) / 100;
              const _remaining = (_albumprice - _albumpricepercent);
              if (_paypalemail == '' || _paypalemail === undefined) {
                const _sale = new Sales({
                  'userid': _albumauthorid,
                  'payerid': _payerid,
                  'type': 'Album',
                  'totalamount': _albumprice,
                  'adminpercentage': _albumpricepercent,
                  'totalearnings': _remaining,
                  'paymentid': result.id,
                  'paykey': '',
                  'transactionid': '',
                  'transactionstatus': '',
                  'ack': 'Success',
                  'corelationid': '',
                  'message': 'Photographer\'s paypal email not added'
                });
                _sale.save(function(err, sale) { });
              } else paypal.pay(_paypalemail, _remaining, 'Photography Album Payment', function(err, response) {
                if (err) {
                  var _sale = new Sales({
                    'userid': _albumauthorid,
                    'payerid': _payerid,
                    'type': 'Album',
                    'totalamount': _albumprice,
                    'adminpercentage': _albumpricepercent,
                    'totalearnings': _remaining,
                    'paymentid': result.id,
                    'paykey': '',
                    'transactionid': '',
                    'transactionstatus': '',
                    'ack': response.responseEnvelope.ack,
                    'corelationid': response.responseEnvelope.correlationId,
                    'message': response.error[0].message
                  });
                  _sale.save(function(err, sale) { });
                } else {
                  var _sale = new Sales({
                    'userid': _albumauthorid,
                    'payerid': _payerid,
                    'type': 'Album',
                    'totalamount': _albumprice,
                    'adminpercentage': _albumpricepercent,
                    'totalearnings': _remaining,
                    'paymentid': result.id,
                    'paykey': response.payKey,
                    'transactionid': response.paymentInfoList.paymentInfo[0].transactionId,
                    'transactionstatus': response.paymentInfoList.paymentInfo[0].transactionStatus,
                    'ack': response.responseEnvelope.ack,
                    'corelationid': response.responseEnvelope.correlationId,
                    'message': ''
                  });
                  _sale.save(function(err, sale) { });
                }
              });

            });

            /* -------------------------------------*/

            async.each(useralbum.images, function(collec) {
              if (collec.publicid != '') {

                const _downloads = new Downloads({
                  'gallery_id': _albumid,
                  'image_id': collec.publicid,
                  'buyer_id': _payerid,
                  'status': '1',
                  'downloadtype': 'album',
                  'downloadlink': `https://stock.vavel.com/s/photoImages/bunch/${collec.publicid}.${collec.fileExtension}`
                });
                _downloads.save(function(err, download) { });

              }
            }, function() { });
            res.send({
              'type': 'success',
              'msg': 'Thanks! You have made payment successfully.'
            });

          } else res.send({
            type: 'error',
            msg: 'Some error occurred. Please try again later or use another card.'
          });

        });
      } else res.send({
        type: 'error',
        msg: 'Some error occurred. Please try again later.'
      });

    });
    else res.send({
      type: 'error',
      msg: 'Some error occurred. Please try again later.'
    });

  });
});

router.post('/addalbum', function(req, res, next) {
  if (!(req.session && req.session.user) && req.cookies && req.cookies.users)
    req.session.user = req.cookies.users;

  if (req.session && req.session.user && !req.session.user._id) try {
    req.session.user = JSON.parse(unescape(req.session.user));
  } catch (err) {
    return res.send({
      type: 'error',
      msg: err.message
    });
  }

  console.log('req.session.user', req.session.user._id);

  if (!(req.session && req.session.user)) return res.send({
    type: 'error',
    msg: 'session is expired'
  });

  const userData = req.session.user;
  const userid = userData._id;

  const name = req.body.albumname;
  const editoriallicense = req.body.editoriallicense;
  const commerciallicense = req.body.commerciallicense;
  const albumaddress = req.body.albumaddress;
  const lat = req.body.lat;
  const lng = req.body.lng;
  const price = req.body.price;
  const albumcountry = req.body.albumcountry;
  const albumcity = req.body.albumcity;
  const date = req.body.date;

  UserAlbum.esFindOne({
    'bool': {
      'must': [{
        'term': {
          userid
        }
      }, {
        'term': {
          'name': name
        }
      }]
    }
    /* UserAlbum.findOne({
          "userid":userid,
          "name":name*/
  }, function(err, useralbum) {
    if (err) return res.send({
      type: 'error',
      msg: err
    });

    if (useralbum) return res.send({
      type: 'error',
      msg: 'Album name already exist.'
    });

    const _albumjoin = new UserAlbum({
      userid,
      name,
      price,
      editoriallicense,
      commerciallicense,
      albumaddress,
      lat,
      lng,
      'photosetid': '',
      'images': [],
      'tags': [],
      albumcountry,
      albumcity,
      date
    });

    _albumjoin.save(function(err, addedalbum) {
      if (err) return res.send({
        type: 'error',
        msg: err
      });

      console.log('* album created', addedalbum);

      const promises = [];

      promises.push(routeCache.del('getnoofalbums*', function(err) { }));
      promises.push(routeCache.del(`getalbums:userid:${userData._id}*`, function() { }));

      Promise.all(promises)
        .then(function() {
          res.send({
            'type': 'success',
            'msg': 'success',
            'album': addedalbum
          });
        }).catch(function() {
          res.send({
            'type': 'success',
            'msg': 'success',
            'album': addedalbum
          });
        });
    });
  });
});

router.post('/addalbumtags', function(req, res, next) {

  const userid = req.body._id;
  const _galleryid = req.body.album_id;
  const albumpublicid = req.body.albumpublicid;
  const albumwidthheight = req.body.albumwidthheight;
  const albumimageurls = req.body.albumimageurls;
  const keyword = req.body.keyword;
  const albumpublicidexp = albumpublicid.split(',');
  const albumwidthheightexp = albumwidthheight.split('@');
  const _tagexp = [];
  let i = 0;
  for (; i < (albumpublicidexp.length - 1); i++) {
    const hw = albumwidthheightexp[i].split(',');
    const imageheight = hw[1];
    const imagewidth = hw[0];
    for (let j = 0; j < req.body.keyword.length; j++) {
      const ss = `${_galleryid}@@@@${albumpublicidexp[i]}@@@@${imageheight}@@@@${imagewidth}@@@${req.body.keyword[j].tag.trim()}`;

      const _tagjoin = new Tags({
        'galleryid': _galleryid,
        'imageid': albumpublicidexp[i],
        'height': imageheight,
        'width': imagewidth,
        'keyword': req.body.keyword[j].tag.trim()
      });
      _tagjoin.save(function(err, addedtags) { });
    }
  }
  const length_count = albumpublicidexp.length - 1;
  setTimeout(function() {
    if (i == length_count) res.send({
      'type': 'success',
      'msg': 'Success'
    });

  }, 1000);

});

router.post('/updateadminpercentage', function(req, res, next) {
  const adminperc = req.body.adminperc;
  const albumid = req.body.albumid;

  UserAlbum.esFindOne({
    term: {
      _id: albumid
    }
    /* UserAlbum.findOne({
         '_id':albumid*/
  }, function(err, useralbum) {
    if (err) res.send({
      type: 'error',
      msg: err
    });
    else if (useralbum) UserAlbum.esUpdateOne({
      '_id': albumid
    }, {
      $set: {
        'adminpercentage': adminperc
      }
    }, function(error, tg) {
      if (error) res.send({
        type: 'error',
        msg: error
      });
      res.send({
        'type': 'success',
        'msg': 'success'
      });
    });
    else res.send({
      type: 'error',
      msg: err
    });

  });
});

router.post('/updatesingleimagepercentage', function(req, res, next) {
  const adminperc = req.body.adminperc;
  const albumid = req.body.albumid;
  const imageid = req.body.imageid;

  UserAlbum.esFindOne({
    term: {
      _id: albumid
    }
    /* UserAlbum.findOne({
         '_id':albumid*/
  }, function(err, useralbum) {
    if (err) res.send({
      type: 'error',
      msg: err
    });
    else if (useralbum) UserAlbum.esUpdateOne({
      '_id': albumid,
      'images.publicid': imageid
    }, {
      $set: {
        'images.$.adminpercentage': adminperc
      }
    }, function(error, tg) {
      if (error) res.send({
        type: 'error',
        msg: error
      });
      res.send({
        'type': 'success',
        'msg': 'success'
      });
    });
    else res.send({
      type: 'error',
      msg: err
    });

  });
});

router.post('/renameAlbum', function(req, res, next) {
  const userData = req.session.user || JSON.parse(unescape(req.cookies.users));;
  // console.log(req.body)
  eventBus.emit('albumUpdate', {
    req,
    resp(send) {
      const promises = [];
      promises.push(routeCache.del('getnoofalbums*', function() { }));
      if (userData && userData._id) promises.push(routeCache.del(`getalbums:userid:${userData._id}*`, function() { }));
      Promise.all(promises)
        .then(function() {
          res.send(send);
        }).catch(function() {
          res.send(send);
        });
    }
  });
});

router.get('/getnoofalbums', routeCache.route({ name: 'getnoofalbums' }), function(req, res) {
  const { limit = 30, page = 0, tag } = req.query;

  let query = { match_all: {} };

//  if (tag) query = {
 //  query_string: {
   //   default_field: 'tags.tag',
    //  query: tag
  //  }
 // };

  UserAlbum.esCount(query, (err, data) => {
    if (err) return res.send({
      type: 'error',
      msg: err
    });

    UserAlbum.esRawFind(query, {
      sort: { createdate: { order: 'desc' } },
      size: limit,
      from: page * limit
    }, function(err, allalbums) {
      if (err) return res.send({
        type: 'error',
        msg: err
      });

      allalbums.forEach(e => {
        if (!e.thumbnail && e.images && e.images[0]) e.thumbnail = e.images[0];

      });

      // if (tag !== 'undefined') {
      //  allalbums = allalbums.filter(e => {
      //    let tag_flag = 0;
      //    e.images.map(image => {
      //      image.tags.map(_tag => {
      //        if (_tag.tag === tag) {
      //          tag_flag = 1;
      //        }
      //      })
      //    })
      //    return tag_flag === 1 ? e : false;
      //  })
      // }

      res.send({
        'type': 'success',
        'count': data.count,
        allalbums,
        'geolocation': req.geolocation,
        'country': req.country
      });
    });
  });
});

function getlastphotos(req, queryObj, limit, page, project, callback) {
  let allResultsParam = [
    { $unwind: '$images' },
    { $addFields: { 'timestamp' : { $convert: {
      'input': '$date',
      'to': 'date',
      'onError': '$currentDate'
    } } } },
    { $addFields: { 'year' : { $year: '$timestamp' } } },
    { $addFields: { 'month' : { $month:  '$timestamp' } } },
    { $match: queryObj }
  ];

  if (project) {
    allResultsParam.push({ $project: project });
  }

  UserAlbum.aggregate( allResultsParam, function(err, allResults) {
    if (err) return callback({
      type: 'error',
      msg: err
    });

    let resultsParam = [
      { $unwind: '$images' },
      { $addFields: { 'timestamp' : { $convert: {
        'input': '$date',
        'to': 'date',
        'onError': '$currentDate'
      } } } },
      { $addFields: { 'year' : { $year: '$timestamp' } } },
      { $addFields: { 'month' : { $month:  '$timestamp' } } },
      { $match: queryObj},
      { $sort: { 'images.adddate': -1 } },
      { $skip: limit * page },
      { $limit: +limit }
    ];

    if (project) {
      resultsParam.splice(5, 0, { $project: project });
    }
    
    UserAlbum.aggregate(resultsParam, function(err, results) {
      if (err) return callback({
        type: 'error',
        msg: err
      });

      callback({
        type: 'success',
        alluserphotos: results,
        count: allResults.length,
        geolocation: req.geolocation,
        country: req.country,
        _is_photo_exist: !!results.length
      });
    });
  });
}

function distance(lat1 = 0, lon1 = 0, coords) {
  lat1 = Number(lat1)
  lon1 = Number(lon1)
  lat2 = Number(coords[0])
  lon2 = Number(coords[1])
  var R = 6371; // km (change this constant to get miles)
  var dLat = (lat2 - lat1) * Math.PI / 180;
  var dLon = (lon2 - lon1) * Math.PI / 180;
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return Math.round(d);
}

function sortPhotos(photos, coords) {
  if(!coords) {
    return photos;
  }

  const withDistance = photos.map(function (userphoto) {
    if (userphoto.lat && userphoto.lng) userphoto.distance = distance(userphoto.lat, userphoto.lng, coords)
    else userphoto.distance = null;
    return userphoto
});

withDistance.sort((a,b) => a.distance - b.distance)
return withDistance;
}

// eslint-disable-next-line max-len
// router.get('/getlastphotos', function(req, res) {
router.get('/getlastphotos', routeCache.route({ name: 'getlastphotos' }), function(req, res) {
  const { limit = 30, page = 0, tag, year, month, time, from, to, fields } = req.query;
  const countryFromCookies = req.cookies.country ? req.cookies.country.substring(1, req.cookies.country.length - 1) : undefined;
  const countryFromHeaders = countryFromCookies || (req.geolocation && req.geolocation.name);
  const country = req.query.country || countryFromHeaders || undefined;
  const coords = req.cookies.lng && req.cookies.lat ? [req.cookies.lat, req.cookies.lng] : null
  queryObj = {};

  if (tag !== undefined) {
    queryObj['images.tags.tag'] = tag;
  }
  if (year !== undefined) {
    queryObj.year = +year;
  }
  if (month !== undefined) {
    queryObj.month = +month;
  }
  if (country !== undefined && country !== 'country') {
    queryObj['albumcountry'] = { $regex : new RegExp(country, 'i') };
  }

  if (time !== undefined && time.toLowerCase() === 'Past-24-hour'.toLowerCase()) {
    const date = new Date();
    date.setHours(date.getHours() - 24);
    queryObj.timestamp = { $gte: date }
  }
  if (time !== undefined && time.toLowerCase() === 'Past-week'.toLowerCase()) {
    const date = new Date();
    date.setHours(date.getHours() - 24 * 7);
    queryObj.timestamp = { $gte: date }
  }
  if (time !== undefined && time.toLowerCase() === 'Past-month'.toLowerCase()) {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    queryObj.timestamp = { $gte: date }
  }
  if (time !== undefined && time.toLowerCase() === 'Past-year'.toLowerCase()) {
    const date = new Date();
    date.setMonth(date.getMonth() - 12);
    queryObj.timestamp = { $gte: date }
  }
  if (time !== undefined && time.toLowerCase() === 'Custom-range'.toLowerCase()) {
    if (from !== undefined && to !== undefined) {
      try {
        const fromDate = new Date(from);
        const toDate = new Date(to);
        queryObj.timestamp = { $gt: fromDate, $lte: toDate }
      } catch (error) {}
    }
  }

  let project;
  if (fields !== undefined) {
    const fieldsvalues = fields.split(',');
    project = {};
    for(param of fieldsvalues) {
      project[param] = `$${param}`;
    }
  }

  getlastphotos(req, queryObj, limit, page, project, resultByCountry => {
    if (resultByCountry.type === 'error') {
      return res.send(resultByCountry);
    }

    delete queryObj['albumcountry'];
    queryObj['albumcountry'] = { $not: { $regex : new RegExp(country, 'i') } };

    return getlastphotos(req, queryObj, limit, page, project, result => {
      if (result.type === 'error') {
        return res.send(result);
      }

      result.alluserphotos = country !== 'country' ?  resultByCountry.alluserphotos.concat(result.alluserphotos): result.alluserphotos;
      if (!country) {
        result.alluserphotos = sortPhotos(result.alluserphotos, coords);
      }

      result.count = resultByCountry.count + result.count;
      result._is_photo_exist = resultByCountry._is_photo_exist && result._is_photo_exist;
      
      return res.send(result);
    });

    // if(queryObj['albumcountry']) {
    //   queryObj['albumcountry'] = { $not: queryObj['albumcountry'] };
    // }

    // return getlastphotos(req, queryObj, limit, page, result => {
    //   if (result.type === 'error') {
    //     return res.send(result);
    //   }

    //   result.alluserphotos = resultByCountry.alluserphotos.concat(result.alluserphotos);
    //   result.alluserphotos = sortPhotos(result.alluserphotos, coords);

    //   result.count = resultByCountry.count + result.count;
    //   result._is_photo_exist = resultByCountry._is_photo_exist && result._is_photo_exist;
      
    //   return res.send(result);
    // });
  });
});

router.get('/lastphotos-by-year', function(req, res) {
  const { tag, userid } = req.query;
  queryObj = {};

  if (!tag && !userid) {
    return res.send({
      type: 'success',
      results: []
    });
  }

  if (tag) {
    queryObj = { 'images.tags.tag': tag };
  }
  if (userid) {
    queryObj = { 'userid': userid };
  }

  UserAlbum.aggregate([
    { $unwind: '$images' },
    { $match: queryObj},
    { $addFields: { 'timestamp' : { $convert: {
      'input': '$date',
      'to': 'date',
      'onError': '$currentDate'
    } } } },
    { $group : {
      _id: {
        year: { $year: '$timestamp' },
        month: { $month: '$timestamp' }
      },
      'publicid': { '$first': "$images.publicid" },
      'fileExtension': { '$first': "$images.fileExtension" },
    } }
  ], function(err, results) {
    if (err) return res.send({
      type: 'error',
      msg: err
    });

    const yearsObj = results.reduce((acc, curr) => {
      const { publicid, fileExtension, _id } = curr;
      const {year, month} = _id;
      if (!year) return acc;
      if(!acc[year]) acc[year] = [{ month, publicid, fileExtension }];
      else acc[year].push({ month, publicid, fileExtension });
      return acc;
    }, {});

    let years = Object.keys(yearsObj)

    years.sort((a,b) => +b - +a);

    const response = years.reduce((acc, year) => {
      const months = yearsObj[year];
      months.sort((a,b) => b.month - a.month);
      return acc.concat(months.map(m => ({ ...m, year: +year })));
    }, []);

    res.send({
      type: 'success',
      results: response
    });
  });
});

router.get('/getalbums/:userid', routeCache.route({ name: 'getalbums' }), function(req, res) {
  const _userid = req.params.userid;
  const { limit = 0, page = 0 } = req.query;

  UserAlbum.count({
    'userid': _userid
  }, (err, count) => {
    if (err) return res.send({
      type: 'error',
      msg: err
    });

    UserAlbum.find({
      'userid': _userid
    })
      .sort({ createdate: -1 })
      .skip(page * limit)
      .limit(+limit)
      .exec(function(err, albumfind) {
        if (err) return res.send({
          type: 'error',
          msg: err
        });

        res.send({
          'type': 'success',
          'is_album_exist': !!albumfind.length,
          'allalbums': albumfind,
          count
        });
      });
  });
});

router.get('/getalbumsimages/:userid', function(req, res) {
  const { limit = 30, page = 0, year, month } = req.query;
  const { userid } = req.params;
  const queryObj = { userid };

  if (year !== undefined && month !== undefined) {
    queryObj.date = { $regex : new RegExp(`${year}-${month < 10 ? '0'+month: month}.*`) };
  }

  UserAlbum.aggregate([
    { $unwind: '$images' },
    { $addFields: { 'userid' : '$userid' } } ,
    { $addFields: { 'imagepublicid' : '$images.publicid' } } ,
    { $addFields: { 'imagewidth' : '$images.imagewidth' } },
    { $addFields: { 'imageheight' : '$images.imageheight' } },
    { $addFields: { 'comments' :  '$images.comments' } },
    { $addFields: { 'caption' : '$images.caption' } } ,
    { $addFields: { 'tags' :  '$images.tags' } } ,
    { $addFields: { 'editoriallicense' : '$editoriallicense' } } ,
    { $addFields: { 'commerciallicense' : '$commerciallicense' }  },
    { $addFields: { 'albumaddress' : '$albumaddress' } } ,
    { $addFields: { 'adminpercentage' : '$adminpercentage' } } ,
    { $addFields: { 'fileExtension' : '$images.fileExtension'  } },
    { $sort: { 'images.adddate': -1 } },
    { $match: queryObj },
  ], function(err, results) {
    if (err) return res.send({
      type: 'error',
      msg: err
    });

    res.send({
      type: 'success',
      images: results.slice(+limit * page, +limit + +limit * page),
      count: results.length,
      is_album_exist: results.length > 0
    });
  });
});

router.get('/getcountcart/:userid', function(req, res, next) {
  const _userid = req.params.userid;

  const _is_album_exist = 0;

  /* Cart.esFind({
    term: {
      buyer_id: _userid
    }*/
  Cart.find({
    'buyer_id': _userid
  }, function(err, cartfind) {
    if (err) res.send({
      'type': 'error',
      'cartcount': ''
    });
    else {
      cartfind = cartfind || [];
      res.send({
        'type': 'success',
        'cartcount': cartfind.length
      });
    }
  });
});

router.get('/getcarts/:userid', function(req, res, next) {
  const _userid = req.params.userid;

  console.log('Getting cart!');
  /* Cart.esFind({
    term: {
      buyer_id: _userid
    }*/
  Cart.find({
    'buyer_id': _userid
  }, function(err, cartfind) {
    if (err) res.send({
      type: 'error',
      msg: err
    });
    else {
      console.log(`Send cart! ${cartfind.length}`);
      res.send({
        'type': 'success',
        'carts': cartfind
      });
    }
  });
});
router.get('/getalldownloads_albums/:userid/:limit', function(req, res, next) {
  const buyer_id = req.params.userid;

  const _limit = req.params.limit;
  let _is_download_exist_albums = 0;

  const { limit = 10000, page = 0 } = req.query;

  Downloads.aggregate([
    { $match: { status: 1, buyer_id, type: 'album' } },
    {
      '$group': {
        _id: '$gallery_id',
        list_images: { $push: '$$ROOT' },
        image_id: { $first: '$image_id' },
        downloadlink: { $first: '$downloadlink' },
        buyer_id: { $first: '$buyer_id' },
        gallery_id: { $first: '$gallery_id' },
        type: { $first: '$type' },
        startdate: { $first: '$startdate' },
        downloadtype: { $first: '$downloadtype' },
        status: { $first: '$status' },
        count: { $sum: 1 }
      }
    },
    // {"$replaceRoot":{"newRoot":"$doc"}},
    { $sort: { startdate: -1 } }
  ], function(err, downloadfind) {
    if (err || !downloadfind) return res.send({
      type: 'error',
      msg: err
    });

    _is_download_exist_albums = !!downloadfind.length;

    res.send({
      'type': 'success',
      'is_download_exist_albums': _is_download_exist_albums,
      'downloads_albums': downloadfind.splice(page * limit, limit),
      'count': downloadfind.length
    });
  });
});
router.get('/getalldownloads/:userid/:limit', function(req, res) {
  const buyer_id = req.params.userid;

  const { limit = 30, page = 0 } = req.query;

  Downloads.count({
    buyer_id,
    status: 1
  }, function(err, count) {
    if (err) return res.send({
      type: 'error',
      msg: err
    });

    Downloads.esRawFind({
      'bool': {
        'must': [{
          'term': {
            buyer_id
          }
        }, {
          'term': {
            'status': '1'
          }
        }]
      }
    }, {
      'sort': { 'startdate': { 'order': 'desc' } },
      'size': +limit,
      'from': page * limit
    }, function(err, downloadall) {
      if (err) res.send({
        type: 'error',
        msg: err
      });

      else res.send({
        'type': 'success',
        'is_download_exist': 1,
        'downloads': downloadall,
        count
      });

    });

  });
});

router.get('/deletecart/:buyerid/:cid/:price', function(req, res, next) {
  const _id = req.params.cid;
  const _userid = req.params.buyerid;
  const _price = req.params.price;
  Cart.remove({
    _id
  }, function(err, carts) {
    if (err) {
      res.send({
        type: 'error',
        msg: err
      });
      return;
    }
    Cart.find({
      'buyer_id': _userid
    }, function(err, cartfind) {
      if (err) res.send({
        type: 'error',
        msg: err
      });
      else if (cartfind) {
        console.log('deleted cart');
        res.send({
          'type': 'success',
          'carts': cartfind
        });
      }
    });
  });
});

router.get('/getallalbums', function(req, res, next) {
  let _is_album_exist = 0;

  UserAlbum.esFind({
    match_all: {}
  },
    // UserAlbum.find({},'_id images.publicid',
    function(err, albumfind) {
      if (err) res.send({
        type: 'error',
        msg: err
      });
      else {
        if (albumfind.length > 0) _is_album_exist = 1;
        else _is_album_exist = 0;

        res.send({
          'type': 'success',
          'is_album_exist': _is_album_exist,
          'allalbums': albumfind
        });
      }
    });
});

router.post('/searchkeywords_collections_load', function(req, res, next) {
  const _keyword = req.body.keyword;
  if (_keyword == '' || _keyword === undefined) res.send({
    type: 'error',
    msg: 0
  });
  else {
    // res.send({"type":"success",msg: 1,'album':'hjhj'});

    const query = {
      'query_string': {
        'default_field': 'name',
        'query': `*${regTextPrepare(_keyword)}*`
      }
    };

    Collections.esRawFind(query,
      { 'sort': { 'createdate': { 'order': 'desc' } } },
      function(err, collections) {
        if (err) res.send({
          type: 'error',
          msg: 0
        });
        else if (collections.length) {
          const _result = [];
          collections.forEach(function(data, index) {
            _result.push(`${data.name}_${data._id}`);
          });
          res.send({
            'type': 'success',
            'msg': 1,
            'collections': _result
          });
        } else res.send({
          type: 'error',
          msg: 0
        });

      });
  }
  // res.send({"type":"success",msg: 1,'album':_keyword});
});

router.post('/searchkeywords_album_load', function(req, res, next) {
  const _keyword = req.body.keyword;
  if (_keyword == '' || _keyword === undefined) res.send({
    type: 'error',
    msg: 0
  });
  else {
    // res.send({"type":"success",msg: 1,'album':'hjhj'});

    const query = {
      'query_string': {
        'default_field': 'name',
        'query': `*${regTextPrepare(_keyword)}*`
      }
    };

    UserAlbum.esRawFind(query,
      { 'sort': { 'createdate': { 'order': 'desc' } } },
      function(err, useralbum) {
        if (err) res.send({
          type: 'error',
          msg: 0
        });
        else if (useralbum.length) {
          const _result = [];
          useralbum.forEach(function(data, index) {
            _result.push(`${data.name}_${data._id}`);
          });
          res.send({
            'type': 'success',
            'msg': 1,
            'albums': _result
          });
        } else res.send({
          type: 'error',
          msg: 0
        });

      });
  }
  // res.send({"type":"success",msg: 1,'album':_keyword});
});

router.post('/searchkeywordsuser_load', function(req, res, next) {
  const _keyword = req.body.keyword;
  if (_keyword == '' || _keyword === undefined) res.send({
    type: 'error',
    msg: 0
  });
  else {
    /* var query = {
      "filtered": {
        "filter": {
          "or": [{
            "regexp": {
              "firstname": '.*' + regTextPrepare(_keyword) + '.*'
            }
          }, {
            "regexp": {
              "username": '.*' + regTextPrepare(_keyword) + '.*'
            }
          }, {
            "regexp": {
              "email": '.*' + regTextPrepare(_keyword) + '.*'
            }
          }, {
            "regexp": {
              "fullname": '.*' + regTextPrepare(_keyword) + '.*'
            }
          }]
        }
      }
    };*/

    const query = {
      'query_string': {
        'fields': [
          'firstname',
          'username',
          'email',
          'fullname'
        ],
        'query': `*${regTextPrepare(_keyword)}*`
      }
    };

    User.esFind(query,
      function(err, user) {
        if (err) res.send({
          type: 'error',
          msg: 0
        });
        else if (user.length) {
          const _result = [];
          const ids = [];

          user.forEach(function(data, index) {
            if (ids.indexOf(data._id) == -1) {
              _result.push({ name: data.fullname, id: data._id, image: data.profileimage });
              ids.push(data._id);
            }
          });
          res.send({
            'type': 'success',
            'msg': 1,
            'user': _result
          });
        } else res.send({
          type: 'error',
          msg: 0
        });

      });
  }
});

router.post('/searchcollections_new', function(req, res, next) {
  const _keyword = req.body.keyword;
  if (_keyword == '' || _keyword === undefined) res.send({
    type: 'error',
    msg: 0
  });
  else {
    const query = {
      'query_string': {
        'fields': [
          'name'
        ],
        'query': `*${regTextPrepare(_keyword)}*`
      }
    };

    Collections.esFind(query, function(err, collections) {
      if (err) res.send({
        type: 'error',
        msg: 0
      });
      else if (collections.length) res.send({
        'type': 'success',
        'msg': 1,
        collections
      });
      else res.send({
        type: 'error',
        msg: 0
      });

    });
  }
  // res.send({"type":"success",msg: 1,'album':_keyword});
});

router.post('/searchkeywordsuser_new', function(req, res, next) {
  const _keyword = req.body.keyword;
  if (_keyword == '' || _keyword === undefined) res.send({
    type: 'error',
    msg: 0
  });
  else {

    const query = {
      'query_string': {
        'fields': [
          'firstname',
          'username',
          'email',
          'fullname'
        ],
        'query': `*${regTextPrepare(_keyword)}*`
      }
    };

    User.esFind(query, function(err, user) {
      if (err) res.send({
        type: 'error',
        msg: err.message
      });
      else if (user.length) res.send({
        'type': 'success',
        'msg': 1,
        'userimage': user
      });
      else res.send({
        type: 'error',
        msg: 0
      });

    });
  }
});

router.post('/searchkeywords', function(req, res, next) {
  const _keyword = req.body.keyword;
  if (_keyword == '' || _keyword === undefined) res.send({
    type: 'error',
    msg: 0
  });
  else UserAlbum.esFindOne({
    'regexp': {
      'name': `.*${regTextPrepare(_keyword)}.*`
    }
    /* UserAlbum.findOne({
          "name": { $regex : new RegExp(_keyword, "i") }*/
  }, function(err, useralbum) {
    if (err) res.send({
      type: 'error',
      msg: 0
    });
    else if (useralbum) res.send({
      'type': 'success',
      'msg': 1,
      'albumid': useralbum._id
    });
    else res.send({
      type: 'error',
      msg: 0
    });

  });

});

router.post('/searchkeywords_new', function(req, res, next) {
  const _keyword = req.body.keyword;
  if (_keyword == '' || _keyword === undefined) res.send({
    type: 'error',
    msg: 0
  });
  else {
    // res.send({"type":"success",msg: 1,'album':'hjhj'});

    const query = {
      'query_string': {
        'fields': [
          'name'
        ],
        'query': `*${regTextPrepare(_keyword)}*`
      }
    };
    UserAlbum.find({
      name: new RegExp(_keyword, 'i')
    }, function(err, useralbum) {
      // console.log('searchkeywords_new', err, useralbum[0])
      // UserAlbum.esFind(query, function(err, useralbum) {
      if (err) res.send({
        type: 'error',
        msg: err.message
      });
      else if (useralbum.length) res.send({
        'type': 'success',
        'msg': 1,
        'album': useralbum
      });
      else res.send({
        type: 'error',
        msg: 0
      });

    });
  }
  // res.send({"type":"success",msg: 1,'album':_keyword});
});

router.get('/getalbumdetails/:id', function(req, res, next) {
  const _id = req.params.id;
  // const

  UserAlbum.esFindOne({
    term: {
      _id
    }
    /* UserAlbum.findOne({
          "_id": _id*/
  }, function(err, useralbum) {
    if (err || !useralbum) return res.send({
      'type': 'error',
      'msg': err || 'No album detected'
    });

    User.esFindOne({
      term: {
        _id: useralbum.userid
      }
      /* User.findOne({
         "_id": useralbum.userid*/
    }, function(error, user) {
      res.send({
        'type': 'success',
        'msg': useralbum.images,
        'albumname': useralbum.name,
        'albumprice': useralbum.price,
        'tags': useralbum.tags,
        'usrdetls': user
      });
    });
  });
});

router.post('/deletealbumImage', function(req, res, next) {
  if (!req.session || !req.session.user) return res.send({
    type: 'error',
    msg: 'session is expired'
  });

  const userData = req.session.user;
  const _imageid = req.body.imageid;
  const _albumid = req.body.albumid;

  eventBus.emit('albumImgDelete', {
    _albumid,
    _imageid,
    req,
    callback(send) {
      const promises = [];

      promises.push(routeCache.del('getlastphotos*', function() { }));
      promises.push(routeCache.del(`getalbums:userid:${userData._id}*`, function() { }));
      promises.push(routeCache.del(`getcollections:userid:${userData._id}*`, function() { }));
      promises.push(routeCache.del('getrandomcollection*', function() { }));

      Promise.all(promises)
        .then(function() {
          res.send(send);
        }).catch(function() {
          res.send(send);
        });
    }
  });
});

router.post('/deleteAlbum', function(req, res, next) {
  const userData = JSON.parse(unescape(req.cookies.users));

  eventBus.emit('albumDelete', {
    req,
    resp(send) {
      const promises = [];

      promises.push(routeCache.del('getlastphotos*', function() { }));
      promises.push(routeCache.del(`getalbums:userid:${userData._id}*`, function() { }));
      promises.push(routeCache.del(`getcollections:userid:${userData._id}*`, function() { }));
      promises.push(routeCache.del('getrandomcollection*', function() { }));

      Promise.all(promises)
        .then(function() {
          res.send(send);
        }).catch(function() {
          res.send(send);
        });
    }
  });
});

module.exports = router;
