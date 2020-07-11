const express = require('express');
const User = require('../models/usersmodel');
const Cart = require('../models/cartmodel');
const CartTotal = require('../models/carttotalmodel');
const Downloads = require('../models/downloadmodel');
const UserGalleriers = require('../models/usergalleriesmodel');
const Likes = require('../models/likesmodel');
const Collections = require('../models/usercollectionsmodel');
const Albums = require('../models/useralbumsmodel');
const Settings = require('../models/settingsmodel');
const Payments = require('../models/paymentmodel');
const Relevant = require('../models/relevantmodel');
const Sales = require('../models/salemodel');
const UserSubscription = require('../models/usersubscriptionmodel');
const UserSubscriptionImages = require('../models/usersubscriptionimagesmodel');
const router = express.Router();
const fs = require('fs');
const es_helper = require('../components/es_helper');
const nodemailer = require('nodemailer');
const _ = require('lodash');
const ftpClient = require('ftp');
const ftpAccess = require('../config/ftp_access');
const easyimg = require('easyimage');
const paypal = require('./paypal.js');
const Promise = require('bluebird');
const routeCache = require('../components/routeCache');

require('../events/collectionEvent');

require('../events/albumEvent');
const eventBus = require('../components/eventBus');

const smtpTransport = nodemailer.createTransport('SMTP', {
  service: 'Gmail',
  auth: {
    user: 'noreply@vavel.com',
    pass: 'c0c0l0c0*85'
  }
});

const gm = require('gm');

function shuffle(o) {
  for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  return o;
}

router.post('/subscriptiondownload', function(req, res, next) {
  const _galleryid = req.body.galleryid;
  const _imageid = req.body.imageid;
  const _payerid = req.body.payerid;
  const _imagetype = req.body.imagetype;
  const today = new Date();
  const todaytime = today.getTime();

  UserSubscription.esFindOne({
    term: {
      userid: _payerid
    }
    /* UserSubscription.findOne({
         "userid": _payerid*/
  }, function(err, subscribeusr) {
    if (err) return res.send({
      'type': 'error',
      'msg': 'Some error occurred. Please try again later.'
    });
    if (subscribeusr) {
      const subscriptionenddate = subscribeusr.enddatetimestamp;
      if (todaytime <= subscriptionenddate) {
        const subscriptionprice = subscribeusr.amount;
        const noofimages = subscribeusr.noofimages;
        const _imageprice = (subscriptionprice / noofimages);

        UserGalleriers.esFindOne({
          term: {
            imagepublicid: _imageid
          }
          /* UserGalleriers.findOne({
              "imagepublicid": _imageid*/
        }, function(err, usergallery) {
          if (err) res.send({
            'type': 'error',
            'msg': 'Some error occurred. Please try again later.'
          });
          else if (usergallery) {
            const _imageadminpercentage = usergallery.adminpercentage;
            const _imageauthorid = usergallery.userid;

            /* ----------------------Adaptive Gallery--------------------*/
            if (_imageadminpercentage == '' || _imageadminpercentage == 0 || _imageadminpercentage === undefined) User.esFindOne({
              term: {
                _id: _imageauthorid
              }
              // User.findOne({'_id':_imageauthorid
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
                const _albumpricepercent = (_imageprice * _adminpercentage) / 100;
                const _remaining = (_imageprice - _albumpricepercent);
                paypal.pay(_paypalemail, _remaining, 'Photography Image Payment', function(err, response) {
                  if (err)
                    res.send({
                      'type': 'error',
                      'msg': 'Some error occurred. Please try again later.'
                    });
                  else {
                    const _subsimage = new UserSubscriptionImages({
                      'authorid': _imageauthorid,
                      'userid': _payerid,
                      'imageid': _imageid,
                      'datetimestamp': todaytime
                    });
                    _subsimage.save(function(err, subsimage) {
                      const _sale = new Sales({
                        'userid': _imageauthorid,
                        'payerid': _payerid,
                        'type': 'Image',
                        'totalamount': _imageprice,
                        'adminpercentage': _albumpricepercent,
                        'totalearnings': _remaining,
                        'paymentid': '',
                        'paykey': response.payKey,
                        'transactionid': response.paymentInfoList.paymentInfo[0].transactionId,
                        'transactionstatus': response.paymentInfoList.paymentInfo[0].transactionStatus,
                        'ack': response.responseEnvelope.ack,
                        'corelationid': response.responseEnvelope.correlationId,
                        'message': ''
                      });
                      _sale.save(function(err, sale) { });
                    });
                    res.send({
                      'type': 'success',
                      'msg': 'Please wait for downloading.'
                    });
                  }
                });
              });
              else {
                const _albumpricepercent = (_imageprice * _authoradminpercentage) / 100;
                const _remaining = (_imageprice - _albumpricepercent);
                paypal.pay(_paypalemail, _remaining, 'Photography Image Payment', function(err, response) {
                  if (err) res.send({
                    'type': 'error',
                    'msg': 'Some error occurred. Please try again later.'
                  });
                  else {
                    const _subsimage = new UserSubscriptionImages({
                      'authorid': _imageauthorid,
                      'userid': _payerid,
                      'imageid': _imageid,
                      'datetimestamp': todaytime
                    });
                    _subsimage.save(function(err, subsimage) {
                      const _sale = new Sales({
                        'userid': _imageauthorid,
                        'payerid': _payerid,
                        'type': 'Image',
                        'totalamount': _imageprice,
                        'adminpercentage': _albumpricepercent,
                        'totalearnings': _remaining,
                        'paymentid': '',
                        'paykey': response.payKey,
                        'transactionid': response.paymentInfoList.paymentInfo[0].transactionId,
                        'transactionstatus': response.paymentInfoList.paymentInfo[0].transactionStatus,
                        'ack': response.responseEnvelope.ack,
                        'corelationid': response.responseEnvelope.correlationId,
                        'message': ''
                      });
                      _sale.save(function(err, sale) { });
                    });
                    res.send({
                      'type': 'success',
                      'msg': 'Please wait for downloading.'
                    });
                  }
                });
              }
            });
            else User.esFindOne({
              term: {
                _id: _imageauthorid
              }
              // User.findOne({'_id':_imageauthorid
            }, function(err, author) {
              const _paypalemail = author.paypalemail;
              const _albumpricepercent = (_imageprice * _imageadminpercentage) / 100;
              const _remaining = (_imageprice - _albumpricepercent);
              paypal.pay(_paypalemail, _remaining, 'Photography Image Payment', function(err, response) {
                if (err) res.send({
                  'type': 'error',
                  'msg': 'Some error occurred. Please try again later.'
                });
                else {
                  const _subsimage = new UserSubscriptionImages({
                    'authorid': _imageauthorid,
                    'userid': _payerid,
                    'imageid': _imageid,
                    'datetimestamp': todaytime
                  });
                  _subsimage.save(function(err, subsimage) {
                    const _sale = new Sales({
                      'userid': _imageauthorid,
                      'payerid': _payerid,
                      'type': 'Image',
                      'totalamount': _imageprice,
                      'adminpercentage': _albumpricepercent,
                      'totalearnings': _remaining,
                      'paymentid': '',
                      'paykey': response.payKey,
                      'transactionid': response.paymentInfoList.paymentInfo[0].transactionId,
                      'transactionstatus': response.paymentInfoList.paymentInfo[0].transactionStatus,
                      'ack': response.responseEnvelope.ack,
                      'corelationid': response.responseEnvelope.correlationId,
                      'message': ''
                    });
                    _sale.save(function(err, sale) { });
                  });
                  res.send({
                    'type': 'success',
                    'msg': 'Please wait for downloading.'
                  });
                }
              });
            });

            /* ----------------------------------------------------------*/
          } else Albums.esFindOne({
            term: {
              _id: _galleryid
            }
            /* Albums.findOne({
                       "_id":_galleryid*/
          }, function(err, useralbum) {
            if (err) res.send({
              'type': 'error',
              'msg': 'Some error occurred. Please try again later.'
            });
            else if (useralbum) useralbum.images.forEach(function(img, ind) {
              if (_imageid == img.publicid) {
                const _imageadminpercentage = img.adminpercentage;
                const _imageauthorid = img.userid;

                /* ----------------------Adaptive Album Image--------------------*/
                if (_imageadminpercentage == '' || _imageadminpercentage == 0 || _imageadminpercentage === undefined)

                  User.esFindOne({
                    term: {
                      _id: _imageauthorid
                    }
                    // User.findOne({'_id':_imageauthorid
                  }, function(err, author) {
                    let _authoradminpercentage = author.adminpercentage;
                    let _paypalemail = author.paypalemail;
                    if (_authoradminpercentage == '' || _authoradminpercentage == 0 || _authoradminpercentage === undefined)

                      Settings.esFindOne({
                        term: {
                          edit: 1
                        }
                        // Settings.findOne({"edit":1
                      }, function(err, settings) {
                        var _adminpercentage = settings.adminpercentage;
                        var _albumpricepercent = (_imageprice * _adminpercentage) / 100;
                        var _remaining = (_imageprice - _albumpricepercent);
                        paypal.pay(_paypalemail, _remaining, "Photography Image Payment", function(err, response) {
                          if (err) {
                            res.send({
                              "type": "error",
                              "msg": 'Some error occurred. Please try again later.'
                            });
                          } else {
                            var _subsimage = new UserSubscriptionImages({
                              'authorid': _imageauthorid,
                              'userid': _payerid,
                              'imageid': _imageid,
                              'datetimestamp': todaytime
                            });
                            _subsimage.save(function(err, subsimage) {
                              var _sale = new Sales({
                                'userid': _imageauthorid,
                                'payerid': _payerid,
                                'type': 'Image',
                                'totalamount': _imageprice,
                                'adminpercentage': _albumpricepercent,
                                'totalearnings': _remaining,
                                'paymentid': '',
                                'paykey': response.payKey,
                                'transactionid': response.paymentInfoList.paymentInfo[0].transactionId,
                                'transactionstatus': response.paymentInfoList.paymentInfo[0].transactionStatus,
                                'ack': response.responseEnvelope.ack,
                                'corelationid': response.responseEnvelope.correlationId,
                                'message': '',
                              });
                              _sale.save(function(err, sale) { });
                            });
                            res.send({
                              "type": "success",
                              "msg": 'Please wait for downloading.'
                            });
                          }
                        });
                      });
                    else {
                      let _albumpricepercent = (_imageprice * _authoradminpercentage) / 100;
                      let _remaining = (_imageprice - _albumpricepercent);
                      paypal.pay(_paypalemail, _remaining, 'Photography Image Payment', function(err, response) {
                        if (err)
                          res.send({
                            "type": "error",
                            "msg": 'Some error occurred. Please try again later.'
                          });
                        else {
                          let _subsimage = new UserSubscriptionImages({
                            'authorid': _imageauthorid,
                            'userid': _payerid,
                            'imageid': _imageid,
                            'datetimestamp': todaytime
                          });
                          _subsimage.save(function(err, subsimage) {
                            let _sale = new Sales({
                              'userid': _imageauthorid,
                              'payerid': _payerid,
                              'type': 'Image',
                              'totalamount': _imageprice,
                              'adminpercentage': _albumpricepercent,
                              'totalearnings': _remaining,
                              'paymentid': '',
                              'paykey': response.payKey,
                              'transactionid': response.paymentInfoList.paymentInfo[0].transactionId,
                              'transactionstatus': response.paymentInfoList.paymentInfo[0].transactionStatus,
                              'ack': response.responseEnvelope.ack,
                              'corelationid': response.responseEnvelope.correlationId,
                              'message': ''
                            });
                            _sale.save(function(err, sale) { });
                          });
                          res.send({
                            'type': 'success',
                            'msg': 'Please wait for downloading.'
                          });
                        }
                      });
                    }
                  });
                else

                  User.esFindOne({
                    term: {
                      _id: _imageauthorid
                    }
                    // User.findOne({'_id':_imageauthorid
                  }, function(err, author) {
                    let _paypalemail = author.paypalemail;
                    let _albumpricepercent = (_imageprice * _imageadminpercentage) / 100;
                    let _remaining = (_imageprice - _albumpricepercent);
                    paypal.pay(_paypalemail, _remaining, 'Photography Image Payment', function(err, response) {
                      if (err)
                        res.send({
                          "type": "error",
                          "msg": 'Some error occurred. Please try again later.'
                        });
                      else {
                        let _subsimage = new UserSubscriptionImages({
                          'authorid': _imageauthorid,
                          'userid': _payerid,
                          'imageid': _imageid,
                          'datetimestamp': todaytime
                        });
                        _subsimage.save(function(err, subsimage) {
                          let _sale = new Sales({
                            'userid': _imageauthorid,
                            'payerid': _payerid,
                            'type': 'Image',
                            'totalamount': _imageprice,
                            'adminpercentage': _albumpricepercent,
                            'totalearnings': _remaining,
                            'paymentid': '',
                            'paykey': response.payKey,
                            'transactionid': response.paymentInfoList.paymentInfo[0].transactionId,
                            'transactionstatus': response.paymentInfoList.paymentInfo[0].transactionStatus,
                            'ack': response.responseEnvelope.ack,
                            'corelationid': response.responseEnvelope.correlationId,
                            'message': ''
                          });
                          _sale.save(function(err, sale) { });
                        });
                        res.send({
                          'type': 'success',
                          'msg': 'Please wait for downloading.'
                        });
                      }
                    });
                  });

                /* ----------------------------------------------------------*/
              }
            });
            else res.send({
              'type': 'error',
              'msg': 'Some error occurred. Please try again later.'
            });

          });

        });
      } else res.send({
        'type': 'error',
        'msg': 'Some error occurred. Please try again later.'
      });

    } else res.send({
      'type': 'error',
      'msg': 'Some error occurred. Please try again later.'
    });

  });
});

router.post('/getseller_id', function(req, res, next) {
  const _galleryid = req.body.galleryid;
  const _imageid = req.body.imageid;
  const _buyer_id = req.body.buyer_id;
  const _price = req.body.price;
  const _imagewidth = req.body.imagewidth;
  const _imageheight = req.body.imageheight;
  const _imagedpi = req.body.imagedpi;
  const _downloadlink = req.body.downloadlink;

  UserGalleriers.esFindOne({
    term: {
      imagepublicid: _imageid
    }
    /* UserGalleriers.findOne({
      "imagepublicid": _imageid*/
  }, function(err, usergallery) {
    if (err) res.send({
      'type': 'error',
      'msg': err
    });
    else if (usergallery) res.send({
      'type': 'success',
      'msg': usergallery.userid,
      'type': 'single'
    });
    else Albums.esFindOne({
      'bool': {
        'must': [{
          'term': {
            '_id': _galleryid
          }
        }]
      }
      // Albums.findOne({
      //    "_id":_galleryid,
      //    "images.publicid":_imageid

    }, function(err, useralbum) {
      if (err) res.send({
        'type': 'error',
        'msg': err
      });
      else if (useralbum) res.send({
        'type': 'success',
        'msg': useralbum.userid,
        'type': 'album'
      });
      else res.send({
        'type': 'error',
        'msg': 'Not Found'
      });

    });
  });
});

const imageGetSized = function(publickId, extention, width, height, callback) {
  console.log('Getting sized image');
  const client = new ftpClient();
  const fileName = `${publickId}.${extention}`;
  const beginName = `photoImages/bunch/${publickId}.${extention}`;
  const endName = `photoImages/repackaged/${publickId}_${width}_${height}.${extention}`;

  client.on('ready', function() {
    client.size(endName, function(err, list) {

      if (!err && list) return callback(null, `https://stock.vavel.com/s/${endName}`);

      client.size(beginName, function(err, list) {
        if (err) return callback(err, null);

        if (!list) return callback({
          error: 'file not found'
        }, null);

        client.get(beginName, function(err, stream) {
          if (err) throw err;
          stream.once('close', function() {
            easyimg.resize({
              src: `${ftpAccess.imgsDownloadPath}/${fileName}`,
              dst: `${ftpAccess.imgsDownloadPath}/${fileName}`,
              width,
              height
            }).then(
              function(file) {

                // upload && clean
                client.put(`${ftpAccess.imgsDownloadPath}/${fileName}`, endName, function(err) {
                  fs.unlink(`${ftpAccess.imgsDownloadPath}/${fileName}`, function(errUnlink) {
                    console.log(errUnlink);
                  });
                  callback(null, `https://stock.vavel.com/s/${endName}`);
                  client.end();
                });
              },
              function(err) {
                console.log(err);
                callback({
                  error: err
                }, null);
              }
            );
          });
          stream.pipe(fs.createWriteStream(`${ftpAccess.imgsDownloadPath}/${fileName}`));
        });
      });

    });
  });
  client.connect(ftpAccess);
};

router.post('/addtocart', function(req, res, next) {
  const _galleryid = req.body.galleryid;
  const _imageid = req.body.imageid;
  const _buyer_id = req.body.buyer_id;
  const _price = req.body.price;
  const _seller_id = req.body.seller_id;
  const _type = req.body.type;
  const _imagewidth = req.body.imagewidth;
  const _imageheight = req.body.imageheight;
  const _imagedpi = req.body.imagedpi;
  let _downloadlink = req.body.downloadlink;
  const _image_publicid = req.body.image_publicid;
  const _sellonetime = req.body.sellonetime;
  const _soldout = req.body.soldout;
  let total = 0;

  console.log('Let get the photo', req.body);
  Albums.esFindOne({
    bool: {
      must: [{
        term: {
          _id: _galleryid
        }
      }]
    }
  }, function(err, data) {
    if (err) {
      console.log('Error getting photo', err);
      return res.send({
        'type': 'error',
        'msg': err.message,
        'error': err
      });
    }

    const index = _.findIndex(data.images, {
      'publicid': _imageid
    });
    if (!(~index && data.images[index].fileExtension)) {
      console.log('Error getting photo. old image');
      return res.send({
        'type': 'error',
        'msg': 'old img'
      });
    }
    imageGetSized(_imageid, data.images[index].fileExtension, _imagewidth, _imageheight, function(err, name) {
      if (err) return res.send({
        'type': 'error',
        'msg': err.message,
        'error': err
      });

      _downloadlink = name;

      console.log('Get cart of buyer');
      Cart.esFindOne({
        term: {
          buyer_id: _buyer_id
        }
        /* Cart.findOne({
           "buyer_id": _buyer_id*/
      }, function(err, cartdetails) {
        if (err) res.send({
          'type': 'error',
          'msg': err.message,
          'error': err
        });

        if (cartdetails) {
          console.log('Cart getted, now get sellerId');

          User.esFindOne({
            term: {
              _id: _seller_id
            }
            // User.findOne({"_id": _seller_id
          }, function(err, imgowner) {
            if (err) return res.send({
              'type': 'error',
              'msg': err.message,
              'error': err
            });

            const _seller_name = imgowner.fullname;
            const _cart = new Cart({
              'seller_id': _seller_id,
              'seller_name': _seller_name,
              'gallery_id': _galleryid,
              'image_id': _imageid,
              'image_extension': data.images[index].fileExtension,
              'price': _price,
              'buyer_id': _buyer_id,
              'type': _type,
              'status': '1',
              'imagewidth': _imagewidth,
              'imageheight': _imageheight,
              'imagedpi': _imagedpi,
              'downloadlink': _downloadlink,
              'image_publicid': _image_publicid,
              'soldout': _soldout,
              'sellonetime': _sellonetime
            });

            _cart.save(function(err, cart) {
              console.log(`Getting cartTotal for buyer ${_buyer_id}`);
              console.log('New cart: ', cart);

              CartTotal.findOne({
                'buyer_id': _buyer_id
              }, function(err, carttotals) {
                if (!carttotals) return res.send({
                  'type': 'success',
                  'msg': 'price updated successfully'
                });

                total = parseInt(carttotals.totalprice) + parseInt(_price);
                CartTotal.esUpdateOne({
                  'buyer_id': _buyer_id
                }, {
                  $set: {
                    'totalprice': total
                  }
                }, function(error, comnt) {
                  if (error) return res.send({
                    'type': 'error',
                    'msg': error.message,
                    error
                  });

                  res.send({
                    'type': 'success',
                    'msg': 'price updated successfully'
                  });
                });

              });
            });
          });
        } else {
          console.log('No cart, create new one.');
          total = parseInt(_price);

          User.esFindOne({
            term: {
              _id: _seller_id
            }
            /* User.findOne({
                "_id": _seller_id*/
          }, function(err, imgowner) {
            if (err) res.send({
              'type': 'error'
            });
            else {
              const _seller_name = imgowner.fullname;
              const _cart = new Cart({
                'seller_id': _seller_id,
                'seller_name': _seller_name,
                'gallery_id': _galleryid,
                'image_id': _imageid,
                'image_extension': data.images[index].fileExtension,
                'price': _price,
                'buyer_id': _buyer_id,
                'type': _type,
                'status': '1',
                'imagewidth': _imagewidth,
                'imageheight': _imageheight,
                'imagedpi': _imagedpi,
                'downloadlink': _downloadlink,
                'soldout': _soldout,
                'sellonetime': _sellonetime,
                'image_publicid': _image_publicid
              });
              _cart.save(function(err, cart) {
                const _carttotal = new CartTotal({
                  'totalprice': total,
                  'buyer_id': _buyer_id
                });
                _carttotal.save(function(err, cart) {
                  res.send({
                    'type': 'success'
                  });
                });

              });

            }
          });

        }
      });

    });

  });

});

router.post('/payment', function(req, res, next) {
  const _galleryid = req.body.galleryid;
  const _imageid = req.body.imageid;
  const _payerid = req.body.payerid;
  const _cardnumber = req.body.cardnumber;
  const _expirydate = req.body.expirydate;
  const _expirydateexp = _expirydate.split('/');
  const _cvcnumber = req.body.cvcnumber;
  const _phonenumber = req.body.phonenumber;
  const _imagetype = req.body.imagetype;
  const _imageprice = req.body.imageprice;
  const _downloadlink = req.body.downloadlink;

  paypal.paypal_api.configure({
    'mode': 'sandbox',
    'client_id': 'AagmhObOlbFGnRUeTbkSfuoEpLPLuZoLAf_wbN177nkcfrIdEYmjcVjr-l6nk_7dj0PXageyOR_dfy8v',
    'client_secret': 'ELDrwbpgIEtg1MOiaObvVgvxzUZrBdkoSZlXdtRRbjyuV40Rhyxyyh0qitkOgSvNDyHNmyc6ZL-I0auF'
  });

  User.esFindOne({
    term: {
      _id: _payerid
    }
    // User.findOne({'_id':_payerid
  }, function(err, user) {
    if (err) res.send({
      'type': 'error',
      'msg': 'Some error occurred. Please try again later.'
    });
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
            'total': _imageprice,
            'currency': 'USD'
          },
          'description': 'This is the payment for buying single image.'
        }]
      };
      paypal.paypal_api.payment.create(create_payment_json, function(err, result) {
        if (err) res.send({
          'type': 'error',
          'msg': `${err.response.message}.`
        });
        else if (result.state == 'approved') {

          /* ------------------Adaptive-------------------*/

          UserGalleriers.esFindOne({
            term: {
              imagepublicid: _imageid
            }
            /* UserGalleriers.findOne({
                "imagepublicid": _imageid*/
          }, function(err, usergallery) {
            if (err) console.log(err);
            else if (usergallery) {
              const _imageadminpercentage = usergallery.adminpercentage;
              const _imageauthorid = usergallery.userid;

              const _payment = new Payments({
                'userid': _imageauthorid,
                'payerid': _payerid,
                'payerphone': _phonenumber,
                'type': 'Image',
                'totalamount': _imageprice,
                'paymentid': result.id,
                'status': 'Approved'
              });
              _payment.save(function(err, payment) { });

              /* ----------------------Adaptive Gallery--------------------*/
              if (_imageadminpercentage == '' || _imageadminpercentage == 0 || _imageadminpercentage === undefined) User.esFindOne({
                term: {
                  _id: _imageauthorid
                }
                // User.findOne({'_id':_imageauthorid
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
                  const _albumpricepercent = (_imageprice * _adminpercentage) / 100;
                  const _remaining = (_imageprice - _albumpricepercent);
                  if (_paypalemail == '' || _paypalemail === undefined) {
                    const _sale = new Sales({
                      'userid': _imageauthorid,
                      'payerid': _payerid,
                      'type': 'Image',
                      'totalamount': _imageprice,
                      'adminpercentage': _albumpricepercent,
                      'totalearnings': _remaining,
                      'paymentid': result.id,
                      'paykey': '',
                      'transactionid': '',
                      'transactionstatus': '',
                      'ack': 'Success',
                      'corelationid': '',
                      'message': 'Photographer\'s paypal email not added.'
                    });
                    _sale.save(function(err, sale) { });
                  } else
                    paypal.pay(_paypalemail, _remaining, 'Photography Image Payment', function(err, response) {
                      if (err) {
                        var _sale = new Sales({
                          'userid': _imageauthorid,
                          'payerid': _payerid,
                          'type': 'Image',
                          'totalamount': _imageprice,
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
                          'userid': _imageauthorid,
                          'payerid': _payerid,
                          'type': 'Image',
                          'totalamount': _imageprice,
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
                  const _albumpricepercent = (_imageprice * _authoradminpercentage) / 100;
                  const _remaining = (_imageprice - _albumpricepercent);
                  if (_paypalemail == '' || _paypalemail === undefined) {
                    const _sale = new Sales({
                      'userid': _imageauthorid,
                      'payerid': _payerid,
                      'type': 'Image',
                      'totalamount': _imageprice,
                      'adminpercentage': _albumpricepercent,
                      'totalearnings': _remaining,
                      'paymentid': result.id,
                      'paykey': '',
                      'transactionid': '',
                      'transactionstatus': '',
                      'ack': 'Success',
                      'corelationid': '',
                      'message': 'Photographer\'s paypal email not added.'
                    });
                    _sale.save(function(err, sale) { });
                  } else paypal.pay(_paypalemail, _remaining, 'Photography Image Payment', function(err, response) {
                    if (err) {
                      var _sale = new Sales({
                        'userid': _imageauthorid,
                        'payerid': _payerid,
                        'type': 'Image',
                        'totalamount': _imageprice,
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
                        'userid': _imageauthorid,
                        'payerid': _payerid,
                        'type': 'Image',
                        'totalamount': _imageprice,
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
                  _id: _imageauthorid
                }
                // User.findOne({'_id':_imageauthorid
              }, function(err, author) {
                const _paypalemail = author.paypalemail;
                const _albumpricepercent = (_imageprice * _imageadminpercentage) / 100;
                const _remaining = (_imageprice - _albumpricepercent);
                if (_paypalemail == '' || _paypalemail === undefined) {
                  const _sale = new Sales({
                    'userid': _imageauthorid,
                    'payerid': _payerid,
                    'type': 'Image',
                    'totalamount': _imageprice,
                    'adminpercentage': _albumpricepercent,
                    'totalearnings': _remaining,
                    'paymentid': result.id,
                    'paykey': '',
                    'transactionid': '',
                    'transactionstatus': '',
                    'ack': 'Success',
                    'corelationid': '',
                    'message': 'Photographer\'s paypal email not added.'
                  });
                  _sale.save(function(err, sale) { });
                } else paypal.pay(_paypalemail, _remaining, 'Photography Image Payment', function(err, response) {
                  if (err) {
                    var _sale = new Sales({
                      'userid': _imageauthorid,
                      'payerid': _payerid,
                      'type': 'Image',
                      'totalamount': _imageprice,
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
                      'userid': _imageauthorid,
                      'payerid': _payerid,
                      'type': 'Image',
                      'totalamount': _imageprice,
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

              /* ----------------------------------------------------------*/
            } else Albums.esFindOne({
              term: {
                _id: _galleryid
              }
              /* Albums.findOne({
                  "_id":_galleryid*/
            }, function(err, useralbum) {
              if (err) console.log(err);
              else if (useralbum) useralbum.images.forEach(function(img, ind) {
                if (_imageid == img.publicid) {
                  const _imageadminpercentage = img.adminpercentage;
                  const _imageauthorid = img.userid;

                  const _payment = new Payments({
                    'userid': _imageauthorid,
                    'payerid': _payerid,
                    'payerphone': _phonenumber,
                    'type': 'Image',
                    'totalamount': _imageprice,
                    'paymentid': result.id,
                    'status': 'Approved'
                  });
                  _payment.save(function(err, payment) { });

                  /* ----------------------Adaptive Album Image--------------------*/
                  if (_imageadminpercentage == '' || _imageadminpercentage == 0 || _imageadminpercentage === undefined)

                    User.esFindOne({
                      term: {
                        _id: _imageauthorid
                      }
                      // User.findOne({'_id':_imageauthorid
                    }, function(err, author) {
                      let _authoradminpercentage = author.adminpercentage;
                      let _paypalemail = author.paypalemail;
                      if (_authoradminpercentage == '' || _authoradminpercentage == 0 || _authoradminpercentage === undefined)

                        Settings.esFindOne({
                          term: {
                            edit: 1
                          }
                          // Settings.findOne({"edit":1
                        }, function(err, settings) {
                          var _adminpercentage = settings.adminpercentage;
                          var _albumpricepercent = (_imageprice * _adminpercentage) / 100;
                          var _remaining = (_imageprice - _albumpricepercent);
                          if (_paypalemail == '' || _paypalemail === undefined) {
                            var _sale = new Sales({
                              'userid': _imageauthorid,
                              'payerid': _payerid,
                              'type': 'Image',
                              'totalamount': _imageprice,
                              'adminpercentage': _albumpricepercent,
                              'totalearnings': _remaining,
                              'paymentid': result.id,
                              'paykey': '',
                              'transactionid': '',
                              'transactionstatus': '',
                              'ack': 'Success',
                              'corelationid': '',
                              'message': "Photographer's paypal email not added.",
                            });
                            _sale.save(function(err, sale) { });
                          } else {
                            paypal.pay(_paypalemail, _remaining, "Photography Image Payment", function(err, response) {
                              if (err) {
                                var _sale = new Sales({
                                  'userid': _imageauthorid,
                                  'payerid': _payerid,
                                  'type': 'Image',
                                  'totalamount': _imageprice,
                                  'adminpercentage': _albumpricepercent,
                                  'totalearnings': _remaining,
                                  'paymentid': result.id,
                                  'paykey': '',
                                  'transactionid': '',
                                  'transactionstatus': '',
                                  'ack': response.responseEnvelope.ack,
                                  'corelationid': response.responseEnvelope.correlationId,
                                  'message': response.error[0].message,
                                });
                                _sale.save(function(err, sale) { });
                              } else {
                                var _sale = new Sales({
                                  'userid': _imageauthorid,
                                  'payerid': _payerid,
                                  'type': 'Image',
                                  'totalamount': _imageprice,
                                  'adminpercentage': _albumpricepercent,
                                  'totalearnings': _remaining,
                                  'paymentid': result.id,
                                  'paykey': response.payKey,
                                  'transactionid': response.paymentInfoList.paymentInfo[0].transactionId,
                                  'transactionstatus': response.paymentInfoList.paymentInfo[0].transactionStatus,
                                  'ack': response.responseEnvelope.ack,
                                  'corelationid': response.responseEnvelope.correlationId,
                                  'message': '',
                                });
                                _sale.save(function(err, sale) { });
                              }
                            });
                          }
                        });
                      else {
                        let _albumpricepercent = (_imageprice * _authoradminpercentage) / 100;
                        let _remaining = (_imageprice - _albumpricepercent);
                        if (_paypalemail == '' || _paypalemail === undefined) {
                          let _sale = new Sales({
                            'userid': _imageauthorid,
                            'payerid': _payerid,
                            'type': 'Image',
                            'totalamount': _imageprice,
                            'adminpercentage': _albumpricepercent,
                            'totalearnings': _remaining,
                            'paymentid': result.id,
                            'paykey': '',
                            'transactionid': '',
                            'transactionstatus': '',
                            'ack': 'Success',
                            'corelationid': '',
                            'message': 'Photographer\'s paypal email not added.'
                          });
                          _sale.save(function(err, sale) { });
                        } else
                          paypal.pay(_paypalemail, _remaining, "Photography Image Payment", function(err, response) {
                            if (err) {
                              var _sale = new Sales({
                                'userid': _imageauthorid,
                                'payerid': _payerid,
                                'type': 'Image',
                                'totalamount': _imageprice,
                                'adminpercentage': _albumpricepercent,
                                'totalearnings': _remaining,
                                'paymentid': result.id,
                                'paykey': '',
                                'transactionid': '',
                                'transactionstatus': '',
                                'ack': response.responseEnvelope.ack,
                                'corelationid': response.responseEnvelope.correlationId,
                                'message': response.error[0].message,
                              });
                              _sale.save(function(err, sale) { });
                            } else {
                              var _sale = new Sales({
                                'userid': _imageauthorid,
                                'payerid': _payerid,
                                'type': 'Image',
                                'totalamount': _imageprice,
                                'adminpercentage': _albumpricepercent,
                                'totalearnings': _remaining,
                                'paymentid': result.id,
                                'paykey': response.payKey,
                                'transactionid': response.paymentInfoList.paymentInfo[0].transactionId,
                                'transactionstatus': response.paymentInfoList.paymentInfo[0].transactionStatus,
                                'ack': response.responseEnvelope.ack,
                                'corelationid': response.responseEnvelope.correlationId,
                                'message': '',
                              });
                              _sale.save(function(err, sale) { });
                            }
                          });

                      }
                    });
                  else

                    User.esFindOne({
                      term: {
                        _id: _imageauthorid
                      }
                      // User.findOne({'_id':_imageauthorid
                    }, function(err, author) {
                      let _paypalemail = author.paypalemail;
                      let _albumpricepercent = (_imageprice * _imageadminpercentage) / 100;
                      let _remaining = (_imageprice - _albumpricepercent);
                      if (_paypalemail == '' || _paypalemail === undefined) {
                        let _sale = new Sales({
                          'userid': _imageauthorid,
                          'payerid': _payerid,
                          'type': 'Image',
                          'totalamount': _imageprice,
                          'adminpercentage': _albumpricepercent,
                          'totalearnings': _remaining,
                          'paymentid': result.id,
                          'paykey': '',
                          'transactionid': '',
                          'transactionstatus': '',
                          'ack': 'Success',
                          'corelationid': '',
                          'message': 'Photographer\'s paypal email not added.'
                        });
                        _sale.save(function(err, sale) { });
                      } else
                        paypal.pay(_paypalemail, _remaining, "Photography Image Payment", function(err, response) {
                          if (err) {
                            var _sale = new Sales({
                              'userid': _imageauthorid,
                              'payerid': _payerid,
                              'type': 'Image',
                              'totalamount': _imageprice,
                              'adminpercentage': _albumpricepercent,
                              'totalearnings': _remaining,
                              'paymentid': result.id,
                              'paykey': '',
                              'transactionid': '',
                              'transactionstatus': '',
                              'ack': response.responseEnvelope.ack,
                              'corelationid': response.responseEnvelope.correlationId,
                              'message': response.error[0].message,
                            });
                            _sale.save(function(err, sale) { });
                          } else {
                            var _sale = new Sales({
                              'userid': _imageauthorid,
                              'payerid': _payerid,
                              'type': 'Image',
                              'totalamount': _imageprice,
                              'adminpercentage': _albumpricepercent,
                              'totalearnings': _remaining,
                              'paymentid': result.id,
                              'paykey': response.payKey,
                              'transactionid': response.paymentInfoList.paymentInfo[0].transactionId,
                              'transactionstatus': response.paymentInfoList.paymentInfo[0].transactionStatus,
                              'ack': response.responseEnvelope.ack,
                              'corelationid': response.responseEnvelope.correlationId,
                              'message': '',
                            });
                            _sale.save(function(err, sale) { });
                          }
                        });

                    });

                  /* ----------------------------------------------------------*/

                }
              });
              else console.log('Not Found');

            });

          });
          /* -------------------------------------*/

          res.send({
            'type': 'success',
            'msg': 'Thanks! You have made payment successfully.'
          });
        } else res.send({
          'type': 'error',
          'msg': 'Some error occurred. Please try again later or use another card.'
        });

      });
    } else res.send({
      'type': 'error',
      'msg': 'Some error occurred. Please try again later.'
    });

  });
});

router.get('/cart_payment_paypal/:userid', function(req, res, next) {
  const _payerid = req.params.userid;

  Cart.find({
    'buyer_id': _payerid
  }, function(err, carts) {

    // paypal auth configuration
    /* var config = {
        "api": {
            "host": "api.sandbox.paypal.com",
            "port": "",
            "client_id": "AbKFI5oxOVC6rzRTSHzStUt-YcmqESLZuS1Rg22qbuOyrQNHPIlQcsi6yKjI5cUIdXnbMXLrgn-dyqR5", // your paypal application client id
            "client_secret": "EMdU5s8gK8cPnFrD7njXBzwxJA1aRRpdYBZX4Cvs10a0bF2DTEzkVGj4L9GWUApbHSUspzYmaFRfMA5u" // your paypal application secret id
        }
    };
    paypal.paypal_api.configure(config.api);*/

    const total = _.sumBy(carts, function(o) { return parseInt(o.price); });

    // paypal payment configuration.
    const payment = {
      'intent': 'sale',
      'payer': {
        'payment_method': 'paypal'
      },
      'redirect_urls': {
        'return_url': `${paypal.merchantURL}/success_cart`,
        'cancel_url': `${paypal.merchantURL}/cancel`
      },
      'transactions': [{
        'amount': {
          total,
          'currency': 'USD'
        },
        'description': 'This is the payment for buying album.'
      }]
    };

    paypal.paypal_api.payment.create(payment, function(error, payment) {
      if (error) {
        console.log(error);
        res.send({
          'type': 'error',
          'msg': error.response.message
        });
      } else
        if (payment.payer.payment_method === 'paypal') {
          const redirectUrl = paypal.getApprovalURL(payment.links);
          res.send({
            'type': 'success',
            'url': redirectUrl
          });
        }

    });

  });
});

router.post('/executepayment', function(req, res, next) {

  const payerId = req.body.payerId;
  const paymentId = req.body.paymentId;
  const userId = req.body.userId;

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
        'type': 'error',
        'msg': error.response.message
      });
      return;
    }

    Cart.find({
      'buyer_id': userId
    }, function(err, carts) {
      if (err || !carts) {
        console.log(`Error: cart with buyer_id ${userId} not found`);
        res.send({
          'type': 'error',
          'msg': 'Cart not found.'
        });
        return;
      }

      User.findOne({
        '_id': carts[0].seller_id
      }, function(err, user) {
        console.log('Find author error :', err);
        if (err || !user) res.send({
          'type': 'error',
          'msg': 'Image author not found.'
        });

        const _paypalemail = user.paypalemail;
        const ADMIN_PERCENTAGE = user.adminpercentage;
        const total = _.sumBy(carts, function(o) { return parseInt(o.price); });
        const authorAmount = total * (1 - ADMIN_PERCENTAGE / 100);

        if (!_paypalemail) {
          res.send({
            'type': 'error',
            'msg': 'Image author doesn\'t have paypalemail'
          });
          return;
        }

        paypal.pay(_paypalemail, authorAmount, 'Photography Image Payment', function(err, response) {
          console.log('Payment to the author done', response);

          return Promise.each(carts, function(cart) {
            return new Promise(function(resolve, reject) {
              const _sale = new Sales({
                'userid': user._id,
                // 'payerid': payerId,
                'payerid': userId,
                // 'type': 'Image',
                'type': 'Image',
                'totalamount': cart.price,
                'adminpercentage': parseInt(cart.price) * (ADMIN_PERCENTAGE / 100),
                'totalearnings': parseInt(cart.price) * (1 - ADMIN_PERCENTAGE / 100),
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

              _sale.save(function(err, sale) {
                if (err) return reject(err);

                resolve(sale);
              });
            });
          }).then(function() {
            console.log('Create payment');

            // Create payment
            const _payment = new Payments({
              'userid': user._id,
              'payerid': userId,
              'payerphone': '',
              'type': 'Image',
              'totalamount': total,
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
            return Promise.each(carts, function(cart) {
              return new Promise(function(resolve, reject) {
                const _downloads = new Downloads({
                  'gallery_id': cart.gallery_id,
                  'image_id': cart.image_id,
                  'buyer_id': userId,
                  'status': '1',
                  'downloadtype': 'image',
                  'downloadlink': `https://stock.vavel.com/s/photoImages/bunch/${cart.image_id}.${cart.image_extension.toLowerCase()}`
                });

                _downloads.save(function(err, download) {
                  resolve();
                });
              });
            });
          }).then(function() {
            return new Promise(function(resolve, reject) {
              Cart.esRemoveAll({
                'buyer_id': userId
              }, function(err, cart) {
                resolve();
              });
            });
          }).then(function() {
            return new Promise(function(resolve, reject) {
              Cart.remove({
                'buyer_id': userId
              }, function(err, cart) {
                resolve();
              });
            });

          }).then(function() {
            res.send({
              'type': 'success'
            });
          }).catch(function(err) {
            console.log(err);

            res.send({
              'type': 'error',
              'msg': 'Some error occurred. Please try again later.'
            });
          });
        });
      });
    });
  });
});

router.get('/savepaypalcartsuccess/:userid/:paypalId', function(req, res, next) {
  const _payerid = req.params.userid;
  const pyid = req.params.paypalId;

  let _galleryid = '';
  let _imageid = '';
  let _seller_name = '';
  const _phonenumber = '';
  let _imageprice = '';
  const _downloadlink = '';
  const _total = 0;

  User.esFindOne({
    term: {
      _id: _payerid
    }
    // User.findOne({'_id':_payerid
  }, function(err, user) {
    if (err) res.send({
      'type': 'error',
      'msg': 'Some error occurred. Please try again later.'
    });
    else if (user) {
      const _firstname = user.firstname;
      const _lastname = user.lastname;
      const _email = user.email;

      Cart.esFind({
        term: {
          buyer_id: _payerid
        }
        // Cart.find({'buyer_id':_payerid
      }, function(err, cart) {

        if (err) res.send({
          'type': 'error',
          'msg': 'Some error occurred. Please try again later.'
        });
        else if (cart) {
          let loop_count_inner = 0;
          cart.forEach(function(cartdetails) {

            const _downloads = new Downloads({
              'gallery_id': cartdetails.galleryid,
              'image_id': cartdetails.image_id,
              'buyer_id': cartdetails.buyer_id,
              'type': cartdetails.type,
              'status': '1',
              'downloadlink': cartdetails.downloadlink
            });
            _downloads.save(function(err, download) {

              loop_count_inner = loop_count_inner + 1;
              _galleryid = cartdetails.gallery_id;
              _imageid = cartdetails.image_id;
              _seller_name = cartdetails.seller_name;
              _imageprice = cartdetails.price;

              /* ------------------Adaptive-------------------*/

              UserGalleriers.esFindOne({
                term: {
                  imagepublicid: _imageid
                }
                /* UserGalleriers.findOne({
                     "imagepublicid": _imageid*/
              }, function(err, usergallery) {
                if (err) console.log(err);
                else if (usergallery) {
                  const _imageadminpercentage = usergallery.adminpercentage;
                  const _imageauthorid = usergallery.userid;

                  const _payment = new Payments({
                    'userid': _imageauthorid,
                    'payerid': _payerid,
                    'payerphone': _phonenumber,
                    'type': 'Image',
                    'totalamount': _imageprice,
                    'paymentid': pyid,
                    'status': 'Approved'
                  });
                  _payment.save(function(err, payment) { });

                  /* ----------------------Adaptive Gallery--------------------*/
                  if (_imageadminpercentage == '' || _imageadminpercentage == 0 || _imageadminpercentage === undefined) User.esFindOne({
                    term: {
                      _id: _imageauthorid
                    }
                    // User.findOne({'_id':_imageauthorid
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
                      const _albumpricepercent = (_imageprice * _adminpercentage) / 100;
                      const _remaining = (_imageprice - _albumpricepercent);
                      if (_paypalemail == '' || _paypalemail === undefined) {
                        const _sale = new Sales({
                          'userid': _imageauthorid,
                          'payerid': _payerid,
                          'type': 'Image',
                          'totalamount': _imageprice,
                          'adminpercentage': _albumpricepercent,
                          'totalearnings': _remaining,
                          'paymentid': pyid,
                          'paykey': '',
                          'transactionid': '',
                          'transactionstatus': '',
                          'ack': 'Success',
                          'corelationid': '',
                          'message': 'Photographer\'s paypal email not added.'
                        });
                        _sale.save(function(err, sale) { });
                      } else
                        paypal.pay(_paypalemail, _remaining, 'Photography Image Payment', function(err, response) {
                          if (err) {
                            var _sale = new Sales({
                              'userid': _imageauthorid,
                              'payerid': _payerid,
                              'type': 'Image',
                              'totalamount': _imageprice,
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
                              'userid': _imageauthorid,
                              'payerid': _payerid,
                              'type': 'Image',
                              'totalamount': _imageprice,
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
                      const _albumpricepercent = (_imageprice * _authoradminpercentage) / 100;
                      const _remaining = (_imageprice - _albumpricepercent);
                      if (_paypalemail == '' || _paypalemail === undefined) {
                        const _sale = new Sales({
                          'userid': _imageauthorid,
                          'payerid': _payerid,
                          'type': 'Image',
                          'totalamount': _imageprice,
                          'adminpercentage': _albumpricepercent,
                          'totalearnings': _remaining,
                          'paymentid': pyid,
                          'paykey': '',
                          'transactionid': '',
                          'transactionstatus': '',
                          'ack': 'Success',
                          'corelationid': '',
                          'message': 'Photographer\'s paypal email not added.'
                        });
                        _sale.save(function(err, sale) { });
                      } else paypal.pay(_paypalemail, _remaining, 'Photography Image Payment', function(err, response) {
                        if (err) {
                          var _sale = new Sales({
                            'userid': _imageauthorid,
                            'payerid': _payerid,
                            'type': 'Image',
                            'totalamount': _imageprice,
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
                            'userid': _imageauthorid,
                            'payerid': _payerid,
                            'type': 'Image',
                            'totalamount': _imageprice,
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
                      _id: _imageauthorid
                    }
                    // User.findOne({'_id':_imageauthorid
                  }, function(err, author) {
                    const _paypalemail = author.paypalemail;
                    const _albumpricepercent = (_imageprice * _imageadminpercentage) / 100;
                    const _remaining = (_imageprice - _albumpricepercent);
                    if (_paypalemail == '' || _paypalemail === undefined) {
                      const _sale = new Sales({
                        'userid': _imageauthorid,
                        'payerid': _payerid,
                        'type': 'Image',
                        'totalamount': _imageprice,
                        'adminpercentage': _albumpricepercent,
                        'totalearnings': _remaining,
                        'paymentid': pyid,
                        'paykey': '',
                        'transactionid': '',
                        'transactionstatus': '',
                        'ack': 'Success',
                        'corelationid': '',
                        'message': 'Photographer\'s paypal email not added.'
                      });
                      _sale.save(function(err, sale) { });
                    } else paypal.pay(_paypalemail, _remaining, 'Photography Image Payment', function(err, response) {
                      if (err) {
                        var _sale = new Sales({
                          'userid': _imageauthorid,
                          'payerid': _payerid,
                          'type': 'Image',
                          'totalamount': _imageprice,
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
                          'userid': _imageauthorid,
                          'payerid': _payerid,
                          'type': 'Image',
                          'totalamount': _imageprice,
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

                  /* ----------------------------------------------------------*/
                } else Albums.esFindOne({
                  'bool': {
                    'must': [{
                      'term': {
                        '_id': _galleryid
                      }
                    }]
                  }
                  /* Albums.findOne({
                      "_id":_galleryid, 'images.publicid':_imageid*/
                }, function(err, img) {
                  if (err) console.log(err);
                  else if (img) {
                    const _imageadminpercentage = img.adminpercentage;
                    const _imageauthorid = img.userid;

                    const _payment = new Payments({
                      'userid': _imageauthorid,
                      'payerid': _payerid,
                      'payerphone': _phonenumber,
                      'type': 'Image',
                      'totalamount': _imageprice,
                      'paymentid': pyid,
                      'status': 'Approved'
                    });
                    _payment.save(function(err, payment) { });

                    /* ----------------------Adaptive Album Image--------------------*/
                    if (_imageadminpercentage == '' || _imageadminpercentage == 0 || _imageadminpercentage === undefined) User.esFindOne({
                      term: {
                        _id: _imageauthorid
                      }
                      // User.findOne({'_id':_imageauthorid
                    }, function(err, author) {
                      const _authoradminpercentage = author.adminpercentage;
                      const _paypalemail = author.paypalemail;
                      if (_authoradminpercentage == '' || _authoradminpercentage == 0 || _authoradminpercentage === undefined)

                        Settings.esFindOne({
                          term: {
                            edit: 1
                          }
                          //  Settings.findOne({"edit":1
                        }, function(err, settings) {
                          let _adminpercentage = settings.adminpercentage;
                          let _albumpricepercent = (_imageprice * _adminpercentage) / 100;
                          let _remaining = (_imageprice - _albumpricepercent);
                          if (_paypalemail == '' || _paypalemail === undefined) {
                            let _sale = new Sales({
                              'userid': _imageauthorid,
                              'payerid': _payerid,
                              'type': 'Image',
                              'totalamount': _imageprice,
                              'adminpercentage': _albumpricepercent,
                              'totalearnings': _remaining,
                              'paymentid': pyid,
                              'paykey': '',
                              'transactionid': '',
                              'transactionstatus': '',
                              'ack': 'Success',
                              'corelationid': '',
                              'message': 'Photographer\'s paypal email not added.'
                            });
                            _sale.save(function(err, sale) { });
                          } else
                            paypal.pay(_paypalemail, _remaining, "Photography Image Payment", function(err, response) {
                              if (err) {
                                var _sale = new Sales({
                                  'userid': _imageauthorid,
                                  'payerid': _payerid,
                                  'type': 'Image',
                                  'totalamount': _imageprice,
                                  'adminpercentage': _albumpricepercent,
                                  'totalearnings': _remaining,
                                  'paymentid': pyid,
                                  'paykey': '',
                                  'transactionid': '',
                                  'transactionstatus': '',
                                  'ack': response.responseEnvelope.ack,
                                  'corelationid': response.responseEnvelope.correlationId,
                                  'message': response.error[0].message,
                                });
                                _sale.save(function(err, sale) { });
                              } else {
                                var _sale = new Sales({
                                  'userid': _imageauthorid,
                                  'payerid': _payerid,
                                  'type': 'Image',
                                  'totalamount': _imageprice,
                                  'adminpercentage': _albumpricepercent,
                                  'totalearnings': _remaining,
                                  'paymentid': pyid,
                                  'paykey': response.payKey,
                                  'transactionid': response.paymentInfoList.paymentInfo[0].transactionId,
                                  'transactionstatus': response.paymentInfoList.paymentInfo[0].transactionStatus,
                                  'ack': response.responseEnvelope.ack,
                                  'corelationid': response.responseEnvelope.correlationId,
                                  'message': '',
                                });
                                _sale.save(function(err, sale) { });
                              }
                            });

                        });
                      else {
                        const _albumpricepercent = (_imageprice * _authoradminpercentage) / 100;
                        const _remaining = (_imageprice - _albumpricepercent);
                        if (_paypalemail == '' || _paypalemail === undefined) {
                          const _sale = new Sales({
                            'userid': _imageauthorid,
                            'payerid': _payerid,
                            'type': 'Image',
                            'totalamount': _imageprice,
                            'adminpercentage': _albumpricepercent,
                            'totalearnings': _remaining,
                            'paymentid': pyid,
                            'paykey': '',
                            'transactionid': '',
                            'transactionstatus': '',
                            'ack': 'Success',
                            'corelationid': '',
                            'message': 'Photographer\'s paypal email not added.'
                          });
                          _sale.save(function(err, sale) { });
                        } else
                          paypal.pay(_paypalemail, _remaining, 'Photography Image Payment', function(err, response) {
                            if (err) {
                              var _sale = new Sales({
                                'userid': _imageauthorid,
                                'payerid': _payerid,
                                'type': 'Image',
                                'totalamount': _imageprice,
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
                                'userid': _imageauthorid,
                                'payerid': _payerid,
                                'type': 'Image',
                                'totalamount': _imageprice,
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
                        _id: _imageauthorid
                      }
                      // User.findOne({'_id':_imageauthorid
                    }, function(err, author) {
                      const _paypalemail = author.paypalemail;
                      const _albumpricepercent = (_imageprice * _imageadminpercentage) / 100;
                      const _remaining = (_imageprice - _albumpricepercent);
                      if (_paypalemail == '' || _paypalemail === undefined) {
                        const _sale = new Sales({
                          'userid': _imageauthorid,
                          'payerid': _payerid,
                          'type': 'Image',
                          'totalamount': _imageprice,
                          'adminpercentage': _albumpricepercent,
                          'totalearnings': _remaining,
                          'paymentid': pyid,
                          'paykey': '',
                          'transactionid': '',
                          'transactionstatus': '',
                          'ack': 'Success',
                          'corelationid': '',
                          'message': 'Photographer\'s paypal email not added.'
                        });
                        _sale.save(function(err, sale) { });
                      } else
                        paypal.pay(_paypalemail, _remaining, 'Photography Image Payment', function(err, response) {
                          if (err) {
                            var _sale = new Sales({
                              'userid': _imageauthorid,
                              'payerid': _payerid,
                              'type': 'Image',
                              'totalamount': _imageprice,
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
                              'userid': _imageauthorid,
                              'payerid': _payerid,
                              'type': 'Image',
                              'totalamount': _imageprice,
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

                    /* ----------------------------------------------------------*/
                  } else console.log('Not Found');

                });

              });
              /* -------------------------------------*/

            });

          });
          setTimeout(function() {
            if (loop_count_inner == cart.length) Cart.esRemoveAll({
              'buyer_id': _payerid
            }, function(err, gallery) {

              res.send({
                'type': 'success'
              });
            });

          }, 1000);
        }
      });
    }
  });
});

router.post('/cart_payment', function(req, res, next) {
  let _galleryid = '';
  let _imageid = '';
  let _seller_name = '';
  const _payerid = req.body.payerid;
  const _cardnumber = req.body.cardnumber;
  const _expirydate = req.body.expirydate;
  const _expirydateexp = _expirydate.split('/');
  const _cvcnumber = req.body.cvcnumber;
  const _phonenumber = req.body.phonenumber;
  let _imageprice = '';
  let _downloadlink = '';
  let _total = 0;

  paypal.paypal_api.configure({
    'mode': 'sandbox',
    'client_id': 'AagmhObOlbFGnRUeTbkSfuoEpLPLuZoLAf_wbN177nkcfrIdEYmjcVjr-l6nk_7dj0PXageyOR_dfy8v',
    'client_secret': 'ELDrwbpgIEtg1MOiaObvVgvxzUZrBdkoSZlXdtRRbjyuV40Rhyxyyh0qitkOgSvNDyHNmyc6ZL-I0auF'
  });

  User.esFindOne({
    term: {
      _id: _payerid
    }
    // User.findOne({'_id':_payerid
  }, function(err, user) {
    if (err) res.send({
      'type': 'error',
      'msg': 'Some error occurred. Please try again later.'
    });
    else if (user) {
      const _firstname = user.firstname;
      const _lastname = user.lastname;
      const _email = user.email;

      CartTotal.esFindOne({
        term: {
          buyer_id: _payerid
        }
        // CartTotal.findOne({'buyer_id':_payerid
      }, function(err, carttotal) {
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
              'total': carttotal.totalprice,
              'currency': 'USD'
            },
            'description': 'This is the payment for buying single image.'
          }]
        };

        paypal.paypal_api.payment.create(create_payment_json, function(err, result) {
          if (err) res.send({
            'type': 'error',
            'msg': `${err.response.message}.`
          });
          else if (result.state == 'approved') Cart.esFind({
            term: {
              buyer_id: _payerid
            }
            // Cart.find({'buyer_id':_payerid
          }, function(err, cart) {

            if (err) res.send({
              'type': 'error',
              'msg': 'Some error occurred. Please try again later.'
            });
            else if (cart) {
              let loop_count_inner = 0;
              cart.forEach(function(cartdetails) {

                const _downloads = new Downloads({
                  'gallery_id': cartdetails.galleryid,
                  'image_id': cartdetails.image_id,
                  'buyer_id': cartdetails.buyer_id,
                  'type': cartdetails.type,
                  'status': '1',
                  'downloadlink': cartdetails.downloadlink
                });
                _downloads.save(function(err, download) {

                  loop_count_inner = loop_count_inner + 1;
                  _galleryid = cartdetails.gallery_id;
                  _imageid = cartdetails.image_id;
                  _seller_name = cartdetails.seller_name;
                  _imageprice = cartdetails.price;

                  /* ------------------Adaptive-------------------*/

                  UserGalleriers.esFindOne({
                    term: {
                      imagepublicid: _imageid
                    }
                    /* UserGalleriers.findOne({
                          "imagepublicid": _imageid*/
                  }, function(err, usergallery) {
                    if (err) console.log(err);
                    else if (usergallery) {
                      const _imageadminpercentage = usergallery.adminpercentage;
                      const _imageauthorid = usergallery.userid;

                      const _payment = new Payments({
                        'userid': _imageauthorid,
                        'payerid': _payerid,
                        'payerphone': _phonenumber,
                        'type': 'Image',
                        'totalamount': _imageprice,
                        'paymentid': result.id,
                        'status': 'Approved'
                      });
                      _payment.save(function(err, payment) { });

                      /* ----------------------Adaptive Gallery--------------------*/
                      if (_imageadminpercentage == '' || _imageadminpercentage == 0 || _imageadminpercentage === undefined) User.esFindOne({
                        term: {
                          _id: _imageauthorid
                        }
                        // User.findOne({'_id':_imageauthorid
                      }, function(err, author) {
                        const _authoradminpercentage = author.adminpercentage;
                        const _paypalemail = author.paypalemail;
                        if (_authoradminpercentage == '' || _authoradminpercentage == 0 || _authoradminpercentage === undefined)

                          Settings.esFindOne({
                            term: {
                              edit: 1
                            }
                            // Settings.findOne({"edit":1
                          }, function(err, settings) {
                            let _adminpercentage = settings.adminpercentage;
                            let _albumpricepercent = (_imageprice * _adminpercentage) / 100;
                            let _remaining = (_imageprice - _albumpricepercent);
                            if (_paypalemail == '' || _paypalemail === undefined) {
                              let _sale = new Sales({
                                'userid': _imageauthorid,
                                'payerid': _payerid,
                                'type': 'Image',
                                'totalamount': _imageprice,
                                'adminpercentage': _albumpricepercent,
                                'totalearnings': _remaining,
                                'paymentid': result.id,
                                'paykey': '',
                                'transactionid': '',
                                'transactionstatus': '',
                                'ack': 'Success',
                                'corelationid': '',
                                'message': 'Photographer\'s paypal email not added.'
                              });
                              _sale.save(function(err, sale) { });
                            } else
                              paypal.pay(_paypalemail, _remaining, "Photography Image Payment", function(err, response) {
                                if (err) {
                                  var _sale = new Sales({
                                    'userid': _imageauthorid,
                                    'payerid': _payerid,
                                    'type': 'Image',
                                    'totalamount': _imageprice,
                                    'adminpercentage': _albumpricepercent,
                                    'totalearnings': _remaining,
                                    'paymentid': result.id,
                                    'paykey': '',
                                    'transactionid': '',
                                    'transactionstatus': '',
                                    'ack': response.responseEnvelope.ack,
                                    'corelationid': response.responseEnvelope.correlationId,
                                    'message': response.error[0].message,
                                  });
                                  _sale.save(function(err, sale) { });
                                } else {
                                  var _sale = new Sales({
                                    'userid': _imageauthorid,
                                    'payerid': _payerid,
                                    'type': 'Image',
                                    'totalamount': _imageprice,
                                    'adminpercentage': _albumpricepercent,
                                    'totalearnings': _remaining,
                                    'paymentid': result.id,
                                    'paykey': response.payKey,
                                    'transactionid': response.paymentInfoList.paymentInfo[0].transactionId,
                                    'transactionstatus': response.paymentInfoList.paymentInfo[0].transactionStatus,
                                    'ack': response.responseEnvelope.ack,
                                    'corelationid': response.responseEnvelope.correlationId,
                                    'message': '',
                                  });
                                  _sale.save(function(err, sale) { });
                                }
                              });

                          });
                        else {
                          const _albumpricepercent = (_imageprice * _authoradminpercentage) / 100;
                          const _remaining = (_imageprice - _albumpricepercent);
                          if (_paypalemail == '' || _paypalemail === undefined) {
                            const _sale = new Sales({
                              'userid': _imageauthorid,
                              'payerid': _payerid,
                              'type': 'Image',
                              'totalamount': _imageprice,
                              'adminpercentage': _albumpricepercent,
                              'totalearnings': _remaining,
                              'paymentid': result.id,
                              'paykey': '',
                              'transactionid': '',
                              'transactionstatus': '',
                              'ack': 'Success',
                              'corelationid': '',
                              'message': 'Photographer\'s paypal email not added.'
                            });
                            _sale.save(function(err, sale) { });
                          } else
                            paypal.pay(_paypalemail, _remaining, 'Photography Image Payment', function(err, response) {
                              if (err) {
                                var _sale = new Sales({
                                  'userid': _imageauthorid,
                                  'payerid': _payerid,
                                  'type': 'Image',
                                  'totalamount': _imageprice,
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
                                  'userid': _imageauthorid,
                                  'payerid': _payerid,
                                  'type': 'Image',
                                  'totalamount': _imageprice,
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
                          _id: _imageauthorid
                        }
                        // User.findOne({'_id':_imageauthorid
                      }, function(err, author) {
                        const _paypalemail = author.paypalemail;
                        const _albumpricepercent = (_imageprice * _imageadminpercentage) / 100;
                        const _remaining = (_imageprice - _albumpricepercent);
                        if (_paypalemail == '' || _paypalemail === undefined) {
                          const _sale = new Sales({
                            'userid': _imageauthorid,
                            'payerid': _payerid,
                            'type': 'Image',
                            'totalamount': _imageprice,
                            'adminpercentage': _albumpricepercent,
                            'totalearnings': _remaining,
                            'paymentid': result.id,
                            'paykey': '',
                            'transactionid': '',
                            'transactionstatus': '',
                            'ack': 'Success',
                            'corelationid': '',
                            'message': 'Photographer\'s paypal email not added.'
                          });
                          _sale.save(function(err, sale) { });
                        } else
                          paypal.pay(_paypalemail, _remaining, 'Photography Image Payment', function(err, response) {
                            if (err) {
                              var _sale = new Sales({
                                'userid': _imageauthorid,
                                'payerid': _payerid,
                                'type': 'Image',
                                'totalamount': _imageprice,
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
                                'userid': _imageauthorid,
                                'payerid': _payerid,
                                'type': 'Image',
                                'totalamount': _imageprice,
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

                      /* ----------------------------------------------------------*/
                    } else Albums.esFindOne({
                      'bool': {
                        'must': [{
                          'term': {
                            '_id': _galleryid
                          }
                        }]
                      }
                      /* Albums.findOne({
                           "_id":_galleryid, 'images.publicid':_imageid*/
                    }, function(err, img) {
                      if (err)
                        console.log(err);
                      else if (img) {
                        const _imageadminpercentage = img.adminpercentage;
                        const _imageauthorid = img.userid;

                        const _payment = new Payments({
                          'userid': _imageauthorid,
                          'payerid': _payerid,
                          'payerphone': _phonenumber,
                          'type': 'Image',
                          'totalamount': _imageprice,
                          'paymentid': result.id,
                          'status': 'Approved'
                        });
                        _payment.save(function(err, payment) { });

                        /* ----------------------Adaptive Album Image--------------------*/
                        if (_imageadminpercentage == '' || _imageadminpercentage == 0 || _imageadminpercentage === undefined)
                          User.esFindOne({
                            term: {
                              _id: _imageauthorid
                            }
                            // User.findOne({'_id':_imageauthorid
                          }, function(err, author) {
                            let _authoradminpercentage = author.adminpercentage;
                            let _paypalemail = author.paypalemail;
                            if (_authoradminpercentage == '' || _authoradminpercentage == 0 || _authoradminpercentage === undefined)

                              Settings.esFindOne({
                                term: {
                                  edit: 1
                                }
                                //Settings.findOne({"edit":1
                              }, function(err, settings) {
                                var _adminpercentage = settings.adminpercentage;
                                var _albumpricepercent = (_imageprice * _adminpercentage) / 100;
                                var _remaining = (_imageprice - _albumpricepercent);
                                if (_paypalemail == '' || _paypalemail === undefined) {
                                  var _sale = new Sales({
                                    'userid': _imageauthorid,
                                    'payerid': _payerid,
                                    'type': 'Image',
                                    'totalamount': _imageprice,
                                    'adminpercentage': _albumpricepercent,
                                    'totalearnings': _remaining,
                                    'paymentid': result.id,
                                    'paykey': '',
                                    'transactionid': '',
                                    'transactionstatus': '',
                                    'ack': 'Success',
                                    'corelationid': '',
                                    'message': "Photographer's paypal email not added.",
                                  });
                                  _sale.save(function(err, sale) { });
                                } else {
                                  paypal.pay(_paypalemail, _remaining, "Photography Image Payment", function(err, response) {
                                    if (err) {
                                      var _sale = new Sales({
                                        'userid': _imageauthorid,
                                        'payerid': _payerid,
                                        'type': 'Image',
                                        'totalamount': _imageprice,
                                        'adminpercentage': _albumpricepercent,
                                        'totalearnings': _remaining,
                                        'paymentid': result.id,
                                        'paykey': '',
                                        'transactionid': '',
                                        'transactionstatus': '',
                                        'ack': response.responseEnvelope.ack,
                                        'corelationid': response.responseEnvelope.correlationId,
                                        'message': response.error[0].message,
                                      });
                                      _sale.save(function(err, sale) { });
                                    } else {
                                      var _sale = new Sales({
                                        'userid': _imageauthorid,
                                        'payerid': _payerid,
                                        'type': 'Image',
                                        'totalamount': _imageprice,
                                        'adminpercentage': _albumpricepercent,
                                        'totalearnings': _remaining,
                                        'paymentid': result.id,
                                        'paykey': response.payKey,
                                        'transactionid': response.paymentInfoList.paymentInfo[0].transactionId,
                                        'transactionstatus': response.paymentInfoList.paymentInfo[0].transactionStatus,
                                        'ack': response.responseEnvelope.ack,
                                        'corelationid': response.responseEnvelope.correlationId,
                                        'message': '',
                                      });
                                      _sale.save(function(err, sale) { });
                                    }
                                  });
                                }
                              });
                            else {
                              let _albumpricepercent = (_imageprice * _authoradminpercentage) / 100;
                              let _remaining = (_imageprice - _albumpricepercent);
                              if (_paypalemail == '' || _paypalemail === undefined) {
                                let _sale = new Sales({
                                  'userid': _imageauthorid,
                                  'payerid': _payerid,
                                  'type': 'Image',
                                  'totalamount': _imageprice,
                                  'adminpercentage': _albumpricepercent,
                                  'totalearnings': _remaining,
                                  'paymentid': result.id,
                                  'paykey': '',
                                  'transactionid': '',
                                  'transactionstatus': '',
                                  'ack': 'Success',
                                  'corelationid': '',
                                  'message': 'Photographer\'s paypal email not added.'
                                });
                                _sale.save(function(err, sale) { });
                              } else
                                paypal.pay(_paypalemail, _remaining, "Photography Image Payment", function(err, response) {
                                  if (err) {
                                    var _sale = new Sales({
                                      'userid': _imageauthorid,
                                      'payerid': _payerid,
                                      'type': 'Image',
                                      'totalamount': _imageprice,
                                      'adminpercentage': _albumpricepercent,
                                      'totalearnings': _remaining,
                                      'paymentid': result.id,
                                      'paykey': '',
                                      'transactionid': '',
                                      'transactionstatus': '',
                                      'ack': response.responseEnvelope.ack,
                                      'corelationid': response.responseEnvelope.correlationId,
                                      'message': response.error[0].message,
                                    });
                                    _sale.save(function(err, sale) { });
                                  } else {
                                    var _sale = new Sales({
                                      'userid': _imageauthorid,
                                      'payerid': _payerid,
                                      'type': 'Image',
                                      'totalamount': _imageprice,
                                      'adminpercentage': _albumpricepercent,
                                      'totalearnings': _remaining,
                                      'paymentid': result.id,
                                      'paykey': response.payKey,
                                      'transactionid': response.paymentInfoList.paymentInfo[0].transactionId,
                                      'transactionstatus': response.paymentInfoList.paymentInfo[0].transactionStatus,
                                      'ack': response.responseEnvelope.ack,
                                      'corelationid': response.responseEnvelope.correlationId,
                                      'message': '',
                                    });
                                    _sale.save(function(err, sale) { });
                                  }
                                });

                            }
                          });
                        else

                          User.esFindOne({
                            term: {
                              _id: _imageauthorid
                            }
                            // User.findOne({'_id':_imageauthorid
                          }, function(err, author) {
                            let _paypalemail = author.paypalemail;
                            let _albumpricepercent = (_imageprice * _imageadminpercentage) / 100;
                            let _remaining = (_imageprice - _albumpricepercent);
                            if (_paypalemail == '' || _paypalemail === undefined) {
                              let _sale = new Sales({
                                'userid': _imageauthorid,
                                'payerid': _payerid,
                                'type': 'Image',
                                'totalamount': _imageprice,
                                'adminpercentage': _albumpricepercent,
                                'totalearnings': _remaining,
                                'paymentid': result.id,
                                'paykey': '',
                                'transactionid': '',
                                'transactionstatus': '',
                                'ack': 'Success',
                                'corelationid': '',
                                'message': 'Photographer\'s paypal email not added.'
                              });
                              _sale.save(function(err, sale) { });
                            } else
                              paypal.pay(_paypalemail, _remaining, "Photography Image Payment", function(err, response) {
                                if (err) {
                                  var _sale = new Sales({
                                    'userid': _imageauthorid,
                                    'payerid': _payerid,
                                    'type': 'Image',
                                    'totalamount': _imageprice,
                                    'adminpercentage': _albumpricepercent,
                                    'totalearnings': _remaining,
                                    'paymentid': result.id,
                                    'paykey': '',
                                    'transactionid': '',
                                    'transactionstatus': '',
                                    'ack': response.responseEnvelope.ack,
                                    'corelationid': response.responseEnvelope.correlationId,
                                    'message': response.error[0].message,
                                  });
                                  _sale.save(function(err, sale) { });
                                } else {
                                  var _sale = new Sales({
                                    'userid': _imageauthorid,
                                    'payerid': _payerid,
                                    'type': 'Image',
                                    'totalamount': _imageprice,
                                    'adminpercentage': _albumpricepercent,
                                    'totalearnings': _remaining,
                                    'paymentid': result.id,
                                    'paykey': response.payKey,
                                    'transactionid': response.paymentInfoList.paymentInfo[0].transactionId,
                                    'transactionstatus': response.paymentInfoList.paymentInfo[0].transactionStatus,
                                    'ack': response.responseEnvelope.ack,
                                    'corelationid': response.responseEnvelope.correlationId,
                                    'message': '',
                                  });
                                  _sale.save(function(err, sale) { });
                                }
                              });

                          });

                        /* ----------------------------------------------------------*/
                      } else
                        console.log('Not Found');

                    });

                  });
                  /* -------------------------------------*/

                });
              });
              setTimeout(function() {
                if (loop_count_inner == cart.length) Cart.esRemoveAll({
                  'buyer_id': _payerid
                }, function(err, gallery) {

                  res.send({
                    'type': 'success',
                    'msg': 'You have made payment successfully. Please wait for downloading.',
                    _downloadlink
                  });
                });

              }, 1000);
            }
          });

        });
      });

      Cart.esFind({
        term: {
          buyer_id: _payerid
        }
        // Cart.find({'buyer_id':_payerid
      }, function(err, cart) {

        if (err) res.send({
          'type': 'error',
          'msg': 'Some error occurred. Please try again later.'
        });
        else if (cart) {
          let loop_count = 0;
          cart.forEach(function(cartdetails) {
            loop_count = loop_count + 1;
            _downloadlink += `<a href='${cartdetails.downloadlink}' download='mytextdocument${loop_count}'>${cartdetails.downloadlink}</a><br>`;
            _total = parseInt(_total) + parseInt(cartdetails.price);

          });

          setTimeout(function() {
            if (loop_count == cart.length) { }

          }, 1000);

        } else res.send({
          'type': 'error',
          'msg': 'Some error occurred. Please try again later.'
        });

      });

    }
  });
});

router.get('/getallcollection', function(req, res, next) {

  Collections.esFind({
    match_all: {}
  },
    // Collections.find({},
    function(err, gallery) {
      let _is_collection_exist = 0;
      if (err) return res.send('error');
      if (gallery.length > 0) _is_collection_exist = 1;
      else _is_collection_exist = 0;

      res.send({
        'type': 'success',
        'is_collection_exist': _is_collection_exist,
        'allcollections': gallery
      });
    });
});

router.get('/getrandomcollection', routeCache.route({ name: 'getrandomcollection' }), function(req, res, next) {

  Collections.esFind({
    match_all: {}
  },
    // Collections.find({},
    function(err, gallery) {
      let _is_collection_exist = 0;
      if (err) return res.send('error');
      if (gallery.length > 0) _is_collection_exist = 1;
      else _is_collection_exist = 0;

      const randomcollection = shuffle(gallery);
      res.send({
        'type': 'success',
        'is_collection_exist': _is_collection_exist,
        'allcollections': randomcollection
      });
    });
});

router.get('/getsignaturecollection', function(req, res, next) {

  Collections.esFind({
    term: {
      issignatured: true
    }
    // Collections.find({'issignatured':true
  }, function(err, gallery) {
    let _is_collection_exist = 0;
    if (err) return res.send('error');
    if (gallery.length > 0) _is_collection_exist = 1;
    else _is_collection_exist = 0;

    const randomcollection = shuffle(gallery);
    res.send({
      'type': 'success',
      'is_collection_exist': _is_collection_exist,
      'allcollections': randomcollection
    });
  });
});

router.get('/getnoofgallery', function(req, res, next) {

  UserGalleriers.esFind({
    match_all: {}
  },
    // UserGalleriers.find({},
    function(err, galleryfind) {
      if (err) res.send({
        'type': 'error',
        'msg': err
      });
      else res.send({
        'type': 'success',
        'allgallery': galleryfind
      });

    });
});

router.post('/uploadgalleryimage', function(req, res, next) {
  const _public_id = req.body.public_id;
  const _width = req.body.width;
  const _height = req.body.height;
  const _userid = req.body.userid;
  const _url = req.body.url;
  const imageurlsplit = _url.split('/');
  const imageurlsplitconcat = '';
  const editoriallicense = req.body.editoriallicense;
  const commerciallicense = req.body.commerciallicense;
  const albumaddress = req.body.albumaddress;

  const _gallery = new UserGalleriers({
    'imagepublicid': _public_id,
    'imagewidth': _width,
    'imageheight': _height,
    'userid': _userid,
    'comments': [],
    'caption': '',
    'tags': [],
    editoriallicense,
    commerciallicense,
    albumaddress
  });
  _gallery.save(function(err, gallery) {
    if (err) res.send({
      'type': 'error',
      'msg': err
    });
    else res.send({
      'type': 'success',
      'msg': 'Successfully Uploaded'
    });

  });
});

router.post('/deleteImage', function(req, res, next) {
  const _imageid = req.body.imageid;
  const userData = req.session.user;

  UserGalleriers.esFindOne({
    term: {
      imagepublicid: _imageid
    }
    /* UserGalleriers.findOne({
        "imagepublicid": _imageid*/
  }, function(err, galleryexist) {
    if (err) {
      if (err) res.send({
        'type': 'error',
        'msg': err
      });
    } else UserGalleriers.esRemoveAll({
      'imagepublicid': _imageid
    }, function(err, gallery) {
      if (err) res.send({
        'type': 'error',
        'msg': err
      });
      else {
        Likes.esRemoveAll({
          'galleryid': galleryexist._id
        }, function(err, like) { });

        Collections.esFind({
          match_all: {}
        },
          // Collections.find(
          function(err, col) {
            col.forEach(function(data, index) {
              data.images.forEach(function(collec, ind) {
                if (_imageid == collec.publicid) {

                  data.images.id(collec._id).remove();
                  data.save(function(err) {
                    if (err) return handleError(err);
                  });

                }
              });
            });
          });

        const promises = [];

        promises.push(routeCache.del('getlastphotos*', function() { }));
        promises.push(routeCache.del(`getalbums:userid:${userData._id}*`, function() { }));
        promises.push(routeCache.del(`getcollections:userid:${userData._id}*`, function() { }));
        promises.push(routeCache.del('getrandomcollection*', function() { }));

        Promise.all(promises)
          .then(function() {
            res.send({
              'type': 'success',
              'msg': 'Successfully Deleted'
            });
          }).catch(function() {
            res.send({
              'type': 'success',
              'msg': 'Successfully Deleted'
            });
          });

      }
    });

  });
});

router.post('/deletecollectionImage', function(req, res, next) {
  const userData = req.session.user;

  eventBus.emit('collectionDeleteImage', {
    req,
    resp(send) {
      const promises = [];

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

router.post('/deleteCollection', function(req, res, next) {
  const _collectionid = req.body.collectionid;
  const userData = req.session.user;

  Collections.esFindOne({
    term: {
      _id: _collectionid
    }
    // Collections.findOne({'_id':_collectionid
  }, function(err, col) {
    if (err) res.send({
      'type': 'error',
      'msg': err
    });
    else
      if (col) Collections.esRemoveOne({
        '_id': _collectionid
      }, function(error, removedcollection) {
        if (error)
          res.send({
            'type': 'error',
            'msg': error
          });
        else {
          const promises = [];

          promises.push(routeCache.del(`getcollections:userid:${userData._id}*`, function() { }));
          promises.push(routeCache.del('getrandomcollection*', function() { }));

          Promise.all(promises)
            .then(function() {
              res.send({
                'type': 'success',
                'msg': 'Successfully Deleted'
              });
            }).catch(function() {
              res.send({
                'type': 'success',
                'msg': 'Successfully Deleted'
              });
            });

        }
      });
      else res.send({
        'type': 'warning',
        'msg': 'error'
      });

  });
});

router.post('/postcomment', function(req, res, next) {
  const _galleryid = req.body.galleryid;
  const _imageid = req.body.imageid;
  const _username = req.body.username;
  const _userimage = req.body.image;
  const _comment = req.body.comment;
  const _userid = req.body._id;

  UserGalleriers.esFindOne({
    term: {
      _id: _galleryid
    }
    // UserGalleriers.findOne({"_id":_galleryid
  }, function(err, gallery) {
    if (err) res.send({
      'type': 'error',
      'msg': err
    });
    else if (gallery) {
      const comment = gallery.comments.create({
        userid: _userid,
        username: _username,
        userimage: _userimage,
        comment: _comment
      });
      gallery.comments.push(comment);
      UserGalleriers.esUpdateOne({
        '_id': _galleryid
      }, {
        $set: {
          'comments': gallery.comments
        }
      }, function(error, comnt) {
        if (error) res.send({
          'type': 'error',
          'msg': error
        });
        res.send({
          'type': 'success',
          'msg': 'Comment posted successfully'
        });
      });
    } else Albums.esFindOne({
      'bool': {
        'must': [{
          'term': {
            '_id': _galleryid
          }
        }]
      }
      /* Albums.findOne({
           "_id":_galleryid,
           "images.publicid":_imageid
         },{'images.$': 1*/
    }, function(err, useralbum) {
      if (err) res.send({
        'type': 'error',
        'msg': err
      });
      else if (useralbum) {

        const comment = {
          userid: _userid,
          username: _username,
          userimage: _userimage,
          comment: _comment
        };
        useralbum.images[0].comments.push({
          userid: _userid,
          username: _username,
          userimage: _userimage,
          comment: _comment
        });
        useralbum.images[0].comments.push(comment);
        Albums.esUpdateOne({
          '_id': _galleryid,
          'images.publicid': _imageid
        }, {
          $addToSet: {
            'images.$.comments': comment
          }
        }, function(error, comnt) {
          if (error) res.send({
            'type': 'error',
            'msg': error
          });
          res.send({
            'type': 'success',
            'msg': 'Comment posted successfully'
          });
        });
      } else res.send({
        'type': 'error',
        'msg': 'Not Found'
      });

    });

  });
});

router.post('/addcaption', function(req, res, next) {
  const imgList = req.body.imageid;
  const _caption = req.body.caption;
  const _tags = req.body.tags;
  const _price = req.body.price;
  const _isthumbnail = req.body.isthumbnail;
  const _sellonetime = req.body.sellonetime;
  const userData = req.session.user;

  eventBus.emit('albumImgUpdate', {
    imgList,
    _caption,
    _tags,
    _price,
    _isthumbnail,
    _sellonetime,
    req,
    resp(send) {
      const promises = [];
      if (userData && userData._id) {

        promises.push(routeCache.del(`getalbums:userid:${userData._id}*`, function() { }));
        promises.push(routeCache.del(`getcollections:userid:${userData._id}*`, function() { }));
      }
      promises.push(routeCache.del('getnoofalbums*', function() { }));
      promises.push(routeCache.del('getlastphotos*', function() { }));
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

router.get('/getgalleryimagebyuserid/:userid', function(req, res, next) {
  const _userid = req.params.userid;

  UserGalleriers.esFind({
    term: {
      userid: _userid
    }
    /* UserGalleriers.find({
           "userid": _userid*/
  }, function(err, usergallery) {
    if (err) return res.send({
      'type': 'error',
      'msg': err
    });

    else return res.send({
      'type': 'success',
      'msg': usergallery
    });

  });
});

router.get('/getallimages', function(req, res, next) {

  UserGalleriers.esFind({
    match_all: {}
  },
    // UserGalleriers.find({},
    function(err, usergallery) {
      if (err) res.send({
        'type': 'error',
        'msg': err
      });
      res.send({
        'type': 'success',
        'msg': usergallery
      });
    });
});

router.get('/getuserdetails/:userid', function(req, res, next) {
  const _userid = req.params.userid;

  User.esFindOne({
    term: {
      _id: _userid
    }
    /* User.findOne({
           "_id": _userid*/
  }, function(err, user) {
    if (err) res.send({
      'type': 'error',
      'msg': err
    });
    else if (user) {
      const userdetails = {
        loginstatus: user.isloggedin,
        _id: user._id,
        email: user.email,
        name: user.firstname,
        username: user.username,
        image: user.profileimage,
        bio: user.bio,
        fullname: user.fullname,
        link: user.link,
        coverimage: user.coverimage,
        usertype: user.roleid
      };
      res.send({
        'type': 'success',
        'msg': userdetails
      });
    } else res.send({
      'type': 'error',
      'msg': err
    });

  });
});

router.post('/postlike', function(req, res, next) {
  const _userid = req.body.userid;
  const _galleryid = req.body.galleryid;
  const _imageid = req.body.imageid;
  let _is_like_exist = 0;

  Likes.esFindOne({
    'bool': {
      'must': [{
        'term': {
          'galleryid': _galleryid
        }
      }, {
        'term': {
          'imageid': _imageid
        }
      }, {
        'term': {
          'userid': _userid
        }
      }]
    }
    /* Likes.findOne({
          "galleryid": _galleryid,
          "imageid": _imageid,
          "userid":_userid*/
  }, function(err, likeexist) {
    if (err) res.send({
      'type': 'error',
      'msg': err
    });
    if (likeexist) Likes.esRemoveAll({
      'galleryid': _galleryid,
      'imageid': _imageid,
      'userid': _userid
    }, function(error, removedlike) {
      Likes.esFind({
        'bool': {
          'must': [{
            'term': {
              'galleryid': _galleryid
            }
          }, {
            'term': {
              'imageid': _imageid
            }
          }]
        }
        /* Likes.find({
           "galleryid": _galleryid,
           "imageid": _imageid,*/
      }, function(errr, alllikes) {
        if (errr) res.send({
          'type': 'error',
          'msg': errr
        });
        _is_like_exist = 0;
        res.send({
          'type': 'success',
          'is_like_exist': _is_like_exist,
          'totallikes': alllikes.length
        });
      });
    });

    else {
      const _likejoin = new Likes({
        'galleryid': _galleryid,
        'imageid': _imageid,
        'userid': _userid
      });
      _likejoin.save(function(errrr, addedlike) {
        Likes.esFind({
          'bool': {
            'must': [{
              'term': {
                'galleryid': _galleryid
              }
            }, {
              'term': {
                'imageid': _imageid
              }
            }]
          }
          /* Likes.find({
           "galleryid": _galleryid,
           "imageid": _imageid,*/
        }, function(errr, alllikes) {
          if (errr) res.send({
            'type': 'error',
            'msg': errr
          });
          _is_like_exist = 1;
          res.send({
            'type': 'success',
            'is_like_exist': _is_like_exist,
            'totallikes': alllikes.length
          });
        });
      });
    }

  });
});

router.get('/getlikes/:galleryid/:id/:userid', function(req, res, next) {
  const _userid = req.params.userid;
  const _galleryid = req.params.galleryid;
  const _id = req.params.id;
  let _is_like_exist = 0;
  Likes.esFind({
    'bool': {
      'must': [{
        'term': {
          'galleryid': _galleryid
        }
      }, {
        'term': {
          'imageid': _id
        }
      }]
    }
    /* Likes.find({
         "galleryid": _galleryid,
         "imageid":_id*/
  }, function(err, alllikes) {
    if (err) res.send({
      'type': 'error',
      'msg': err
    });
    Likes.esFind({
      'bool': {
        'must': [{
          'term': {
            'userid': _userid
          }
        }, {
          'term': {
            'galleryid': _galleryid
          }
        }, {
          'term': {
            'imageid': _id
          }
        }]
      }
      /* Likes.find({
       "userid": _userid,
       "galleryid": _galleryid,
       "imageid":_id*/
    }, function(error, likeexist) {
      if (likeexist.length > 0) _is_like_exist = 1;
      else _is_like_exist = 0;

      res.send({
        'type': 'success',
        'is_like_exist': _is_like_exist,
        'totallikes': alllikes.length
      });
    });
  });
});

router.get('/getlikeimages/:userid', function(req, res, next) {
  const _userid = req.params.userid;
  const _is_like_exist = 0;

  Likes.esFind({
    term: {
      userid: _userid
    }
    /* Likes.find({
         "userid": _userid*/
  }, function(error, likedimages) {
    if (error) return res.send({
      'type': 'error',
      'msg': error
    });
    res.send({
      'type': 'success',
      likedimages
    });
  });
});

router.get('/getlikesall/:galleryid/:id', function(req, res, next) {
  const _id = req.params.id;
  const _galleryid = req.params.galleryid;

  Likes.esFind({
    'bool': {
      'must': [{
        'term': {
          'galleryid': _galleryid
        }
      }, {
        'term': {
          'imageid': _id
        }
      }]
    }
    /* Likes.find({
          "galleryid": _galleryid,
          "imageid":_id*/
  }, function(err, alllikes) {
    if (err) return res.send({
      'type': 'error',
      'msg': err
    });
    console.log(alllikes);
    res.send({
      'type': 'success',
      'totallikes': alllikes ? alllikes.length : 0
    });
  });
});

router.get('/getcollections/:userid', routeCache.route({ name: 'getcollections' }), function(req, res, next) {
  const userid = req.params.userid;
  const { limit = 0, page = 0 } = req.query;

  Collections.count({ userid }, (err, count) => {
    if (err) return res.send({
      'type': 'error',
      'msg': err
    });

    Collections.find({ userid })
      .sort({ createdate: -1 })
      .skip(page * limit)
      .limit(+limit)
      .exec(function(err, collectionfind) {
        console.log('collectionfind', collectionfind);
        if (err) return res.send({
          'type': 'error',
          'msg': err
        });

        res.send({
          'type': 'success',
          'is_collection_exist': !!collectionfind.length,
          'allcollections': collectionfind,
          count
        });
      });
  });
});

router.post('/addtocollection', function(req, res, next) {
  const userid = req.body.userid;
  const galleryid = req.body.galleryid;
  const collectionid = req.body.collectionid;
  const userData = req.session.user;

  Collections.esFindOne({
    term: {
      _id: collectionid
    }
    /* Collections.findOne({
           "_id":collectionid*/
  }, function(err, usercollection) {
    if (err) res.send({
      'type': 'error',
      'msg': err
    });
    else if (usercollection) UserGalleriers.esFindOne({
      term: {
        _id: galleryid
      }
      /* UserGalleriers.findOne({
             "_id": galleryid*/
    }, function(error, usergallery) {
      if (usergallery) Collections.esFindOne({
        'bool': {
          'must': [{
            'term': {
              '_id': collectionid
            }
          }, {
            'term': {
              'images.publicid': usergallery.imagepublicid
            }
          }]
        }
        /* Collections.findOne({
                  "_id":collectionid,
                  "images.publicid":usergallery.imagepublicid*/
      }, function(err, usercollectionalreadyexist) {
        if (usercollectionalreadyexist)
          res.send({
            'type': 'error',
            'msg': 'Image already exist in this collection.'
          });
        else {
          const addimage = usercollection.images.create({
            publicid: usergallery.imagepublicid,
            galleryid: usergallery._id
          });
          usercollection.images.push(addimage);
          Collections.esUpdateOne({
            '_id': collectionid
          }, {
            $set: {
              'images': usercollection.images
            }
          }, function(error, tg) {
            if (error) res.send({
              'type': 'error',
              'msg': error
            });

            const promises = [];

            promises.push(routeCache.del(`getcollections:userid:${userData._id}*`, function() { }));
            promises.push(routeCache.del('getrandomcollection*', function() { }));

            Promise.all(promises)
              .then(function() {
                res.send({
                  'type': 'success',
                  'msg': 'success'
                });
              }).catch(function() {
                res.send({
                  'type': 'success',
                  'msg': 'success'
                });
              });

          });
        }
      });

    });

  });
});

router.post('/addcollection', function(req, res, next) {
  const userid = req.body.userid;
  const galleryid = req.body.galleryid;
  const collectionname = req.body.collectionname;
  const userData = req.session.user;

  const _imgarr = [];

  Collections.esFindOne({
    'bool': {
      'must': [{
        'term': {
          userid
        }
      }, {
        'term': {
          'name': collectionname
        }
      }]
    }
    /* Collections.findOne({
          "userid":userid,
          "name":collectionname*/
  }, function(err, usercollection) {
    if (err) res.send({
      'type': 'error',
      'msg': err
    });
    else if (usercollection) res.send({
      'type': 'error',
      'msg': 'Collection already exist.'
    });
    else UserGalleriers.esFindOne({
      term: {
        _id: galleryid
      }
      /* UserGalleriers.findOne({
             "_id": galleryid*/
    }, function(error, usergallery) {
      const _collectionjoin = new Collections({
        userid,
        'name': collectionname,
        'images': []
      });
      _collectionjoin.save(function(errr, addedcollection) {

        Collections.esFindOne({
          'bool': {
            'must': [{
              'term': {
                userid
              }
            }, {
              'term': {
                'name': collectionname
              }
            }]
          }
          /* Collections.findOne({
                    "userid":userid,
                    "name":collectionname*/
        }, function(err, usercollectionadded) {
          const addimage = usercollectionadded.images.create({
            publicid: usergallery.imagepublicid,
            galleryid: usergallery._id
          });
          _imgarr.push(addimage);
          Collections.esUpdateOne({
            '_id': usercollectionadded._id
          }, {
            $set: {
              'images': _imgarr
            }
          }, function(error, tg) {
            if (error) res.send({
              'type': 'error',
              'msg': error
            });

            const promises = [];

            promises.push(routeCache.del(`getcollections:userid:${userData._id}*`, function() { }));
            promises.push(routeCache.del('getrandomcollection*', function() { }));

            Promise.all(promises)
              .then(function() {
                res.send({
                  'type': 'success',
                  'msg': 'success'
                });
              }).catch(function() {
                res.send({
                  'type': 'success',
                  'msg': 'success'
                });
              });
          });
        });
      });
    });

  });
});

router.post('/addalbumcollection', function(req, res, next) {
  if (!req.session || !req.session.user) return res.send({
    'type': 'error',
    'msg': 'session is expired'
  });

  const userData = req.session.user;
  const userid = userData._id;
  const collectionname = req.body.collectionname;
  const _imgarr = [];

  Collections.esFindOne({
    'bool': {
      'must': [{
        'term': {
          userid
        }
      }, {
        'term': {
          'name': collectionname
        }
      }]
    }
    /* Collections.findOne({
          "userid":userid,
          "name":collectionname*/
  }, function(err, usercollection) {
    if (err) res.send({
      'type': 'error',
      'msg': err
    });
    else if (usercollection) res.send({
      'type': 'error',
      'msg': 'Collection already exist.'
    });
    else {
      const _collectionjoin = new Collections({
        userid,
        'name': collectionname,
        'images': []
      });
      _collectionjoin.save(function(errr, addedcollection) {
        if (errr) return res.send({
          'type': 'error',
          'msg': errr
        });

        res.send({
          'type': 'success',
          'msg': 'success',
          'collaction': addedcollection
        });
        /* Collections.esFindOne({
         "bool" : {
            "must" : [
              {"term" : { "userid" : userid  }},
              {"term" : { "name" : collectionname  }}
            ]
          }
        //Collections.findOne({"userid":userid,"name":collectionname
         }, function (err, usercollectionadded) {
           var addimage = usercollectionadded.images.create({
             publicid:photopublicid,
             galleryid:galleryid
           });
           _imgarr.push(addimage);
           Collections.esUpdateOne({"_id":usercollectionadded._id},{$set:{'images':_imgarr}},function(error, tg){
                 if (error) res.send({"type":"error","msg":error});

            });
         });
        */

      });
    }
  });
});

router.post('/addalbumtocollection', function(req, res, next) {
  const userData = req.session.user;

  eventBus.emit('collectionAddImage', {
    req,
    resp(send) {
      const promises = [];

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

router.post('/renameCollection', function(req, res, next) {
  const userData = req.session.user;

  eventBus.emit('collectionUpdate', {
    req,
    resp(send) {
      const promises = [];

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

router.post('/makesignatured', function(req, res, next) {
  const collectionid = req.body.collectionid;
  Collections.esFindOne({
    'term': {
      '_id': collectionid
    }
    /* Collections.findOne({
          '_id':collectionid*/
  }, function(err, usercollection) {
    if (err) res.send({
      'type': 'error',
      'msg': err
    });
    else if (usercollection) Collections.esUpdateOne({
      '_id': collectionid
    }, {
      $set: {
        'issignatured': true
      }
    }, function(error, tg) {
      if (error) res.send({
        'type': 'error',
        'msg': error
      });
      res.send({
        'type': 'success',
        'msg': 'success'
      });
    });
    else res.send({
      'type': 'error',
      'msg': 'Collection not found.'
    });

  });
});

router.post('/removesignatured', function(req, res, next) {
  const collectionid = req.body.collectionid;
  Collections.esFindOne({
    'term': {
      '_id': collectionid
    }
    /* Collections.findOne({
          '_id':collectionid*/
  }, function(err, usercollection) {
    if (err) res.send({
      'type': 'error',
      'msg': err
    });
    else if (usercollection) Collections.esUpdateOne({
      '_id': collectionid
    }, {
      $set: {
        'issignatured': false
      }
    }, function(error, tg) {
      if (error) res.send({
        'type': 'error',
        'msg': error
      });
      res.send({
        'type': 'success',
        'msg': 'success'
      });
    });
    else res.send({
      'type': 'error',
      'msg': 'Collection not found.'
    });

  });
});

router.get('/getimagedetails/:galleryid/:id', function(req, res, next) {
  const _id = req.params.id;
  const _galleryid = req.params.galleryid;

  UserGalleriers.findOne({
    'imagepublicid': _id
  }, function(err, usergallery) {
    if (err) return res.send({
      'type': 'error',
      'msg': err.message,
      'error': err
    });

    if (usergallery) {
      console.log('Found user gallery:', usergallery[0]);
      User.esFindOne({
        'term': {
          '_id': usergallery.userid
        }
        /* User.findOne({
         "_id": usergallery.userid */
      }, function(error, user) {
        if (error) return res.send({
          'type': 'error',
          'msg': error.message,
          error
        });

        return res.send({
          'type': 'success',
          'msg': usergallery,
          user
        });
      });
    }

    // NO user gallery found. Searching in Albums
    Albums.findOne({
      '_id': _galleryid
    }, function(err, useralbum) {
      if (err || !useralbum) return res.send({
        'type': 'error',
        'msg': err || 'Not Found'
      });

      useralbum.images.forEach(function(img, ind) {
        if (_id == img.publicid) User.esFindOne({
          'term': {
            '_id': useralbum.userid
          }
        }, function(error, user) {
          const albmdet = {
            '_id': _galleryid,
            'imagepublicid': img.publicid,
            'caption': img.caption,
            'tags': img.tags,
            'comments': img.comments,
            'imagewidth': img.imagewidth,
            'imageheight': img.imageheight,
            'userid': img.userid,
            'fileExtension': img.fileExtension,
            'commerciallicense': useralbum.commerciallicense,
            'editoriallicense': useralbum.editoriallicense,
            'albumaddress': useralbum.albumaddress,
            'price': img.price,
            'images': useralbum.images,
            'soldout': img.soldout,
            'sellonetime': img.sellonetime,
            'album': useralbum
          };

          res.send({
            'type': 'success',
            'msg': albmdet,
            user
          });
        });
      });
    });
  });

  router.get('/getcollectiondetails/:id', function(req, res, next) {
    const _id = req.params.id;

    Collections.esFindOne({
      'term': {
        _id
      }
      /* Collections.findOne({
             "_id": _id*/
    }, function(err, usercollection) {
      if (err) res.send({
        'type': 'error',
        'msg': err
      });
      else if (usercollection) User.esFindOne({
        'term': {
          '_id': usercollection.userid
        }
        /* User.findOne({
             "_id": usercollection.userid*/
      }, function(error, user) {
        res.send({
          'type': 'success',
          'msg': usercollection.images,
          'collectionname': usercollection.name,
          'usrdetls': user
        });
      });
      else res.send({
        'type': 'error',
        'msg': err
      });

    });
  });

  router.post('/updateadminpercentage', function(req, res, next) {
    const adminperc = req.body.adminperc;
    const galleryid = req.body.galleryid;
    const imageid = req.body.imageid;

    UserGalleriers.esFindOne({
      'term': {
        '_id': galleryid.userid
      }
      /* UserGalleriers.findOne({
           '_id':galleryid*/
    }, function(err, usergallery) {
      if (err) res.send({
        'type': 'error',
        'msg': err
      });
      else if (usergallery) UserGalleriers.esUpdateOne({
        '_id': galleryid
      }, {
        $set: {
          'adminpercentage': adminperc
        }
      }, function(error, tg) {
        if (error) res.send({
          'type': 'error',
          'msg': error
        });
        res.send({
          'type': 'success',
          'msg': 'success'
        });
      });
      else res.send({
        'type': 'error',
        'msg': err
      });

    });
  });

  router.post('/addkeywords', function(req, res, next) {
    const _userid = req.body.userid;
    const _keyword = req.body.keyword;
    const _relevant = new Relevant({
      'userid': _userid,
      'keyword': _keyword
    });
    if (_userid != 0) Relevant.esFindOne({
      'bool': {
        'must': [{
          'regexp': {
            'keyword': `.*${es_helper.regTextPrepare(_keyword)}.*`
          }
        }, {
          'term': {
            'userid': _userid
          }
        }]
      }
      /* Relevant.findOne({
           'keyword':new RegExp(_keyword, 'i'),
           'userid':_userid*/
    }, function(error, releventexist) {
      if (error) res.send({
        'type': 'error',
        'msg': error
      });
      else if (releventexist) res.send({
        'type': 'error',
        'msg': 'Already exist'
      });
      else _relevant.save(function(err, relevant) {
        if (err) res.send({
          'type': 'error',
          'msg': err
        });
        else
          res.send({
            'type': 'success',
            'msg': 'Successfully Saved'
          });

      });

    });
    else _relevant.save(function(err, relevant) {
      if (err) res.send({
        'type': 'error',
        'msg': err
      });
      else res.send({
        'type': 'success',
        'msg': 'Successfully Saved'
      });

    });

  });

  router.post('/getkeywords', function(req, res, next) {
    const _userid = req.body.userid;
    Relevant.esFind({
      term: {
        userid: _userid
      }
    },
      function(err, logs) {

        const uniqLogs = [];
        for (const i in logs) {
          const index = _.findIndex(uniqLogs, {
            keyword: logs[i].keyword
          });
          if (!~index) uniqLogs.unshift(logs[i]);

        }
        if (err) res.send({
          'type': 'error',
          'msg': err
        });
        res.send({
          'type': 'success',
          'keywords': uniqLogs
        });
      });
  });

  router.post('/updatedownloadstatus', function(req, res, next) {
    const _imageid = req.body.imgid;
    Downloads.esUpdateOne({
      '_id': _imageid
    }, {
      $set: {
        'status': '0'
      }
    }, function(error, status) {
      if (error) res.send({
        'type': 'error',
        'msg': error
      });
      res.send({
        'type': 'success',
        'msg': 'Status Updated Successfully'
      });
    });
  });
});

module.exports = router;
