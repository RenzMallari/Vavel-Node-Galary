const express = require('express');
const router = express.Router();
const braintree = require('braintree');

const Downloads = require('../models/downloadmodel');
const Cart = require('../models/cartmodel');
const Settings = require('../models/settingsmodel');
const Payments = require('../models/paymentmodel');
const UserGalleriers = require('../models/usergalleriesmodel');
const paypal = require('./paypal.js');
const User = require('../models/usersmodel');
const Sales = require('../models/salemodel');
const UserAlbum = require('../models/useralbumsmodel');

const gateway = braintree.connect({
  environment: braintree.Environment.Production,
  merchantId: 'x4q6nmjq6v2chs3g',
  publicKey: 'vjzjdyg4ng8h4x84',
  privateKey: '9b249f801707fd275f123225318424f5'
});

router.get('/client_token', function(req, res) {
  gateway.clientToken.generate({}, function(err, response) {
    res.send(response.clientToken);
  });
});

router.post('/checkouts', function(req, res) {
  let transactionErrors;
  const nonce = req.body.payment_method_nonce;
  const type = req.body.type;
  const _payerid = req.body.user_id;
  const _localid = req.body.local_id;
  let downloadList = [];

  if (type === 'album') processAlbum();
  else processCarts();

  function brainTreePay(amount, callback) {
    gateway.transaction.sale({
      amount,
      paymentMethodNonce: nonce,
      options: {
        submitForSettlement: true
      }
    }, (err, result) => {
      if (err) return callback(err);
      if (!result.success) return callback(result);

      callback(null, result);
    });
  }

  function createSaleRecord(userid, totalamount, adminpercentage, totalearnings, paymentid, response) {
    response = response || {};
    response.responseEnvelope = response.responseEnvelope || {
      ack: 'unknown',
      correlationId: 'unknown'
    };
    response.paymentInfoList = response.paymentInfoList || {};
    response.paymentInfoList.paymentInfo = response.paymentInfoList.paymentInfo || [{
      transactionId: 'unknown',
      transactionStatus: 'Rejected'
    }];
    const _sale = new Sales({
      userid,
      'payerid': _payerid,
      'type': 'image',
      totalamount,
      adminpercentage,
      totalearnings,
      paymentid,
      'paykey': response.payKey,
      'transactionid': response.paymentInfoList.paymentInfo[0].transactionId,
      'transactionstatus': response.paymentInfoList.paymentInfo[0].transactionStatus,
      'ack': response.responseEnvelope.ack,
      'corelationid': response.responseEnvelope.correlationId,
      'message': 'Success'
    });
    _sale.save();
  }

  function createPaymentRecord(userid, payerid, totalamount, paymentid) {
    const _payment = new Payments({
      userid,
      payerid,
      // 'payerphone': _phonenumber,
      'type': 'image',
      totalamount,
      paymentid,
      'status': 'Approved'
    });
    _payment.save();
  }

  // eslint-disable-next-line max-len
  function createDownloadRecord(galleryid, imageId, buyerId, type, downloadlink, imagePublicid) {
    const _downloads = new Downloads({
      'gallery_id': galleryid,
      'image_id': imageId,
      'buyer_id': buyerId,
      'image_publicid': imagePublicid,
      'status': '1',
      type, downloadlink
    });
    return _downloads.save();
  }

  function processPayment(cartdetails) {
    const _galleryid = cartdetails.gallery_id;
    const _imageid = cartdetails.image_id;
    const _soldout = cartdetails.soldout;
    // const _seller_name = cartdetails.seller_name;
    const _imageprice = cartdetails.price;

    const result = {
      transaction: { id: Date.now() }
    };

    UserGalleriers.findOneAndUpdate({ 'imagepublicid': _imageid }, {
      $set: {
        'soldout': _soldout
      }
    }, function(err, usergallery) {

      if (err) res.send({
        'type': 'error',
        'msg': err.message,
        'error': err
      });
      else if (usergallery && usergallery.userid) {
        // var _imageadminpercentage = usergallery.adminpercentage;
        const _imageauthorid = usergallery.userid;
        createPaymentRecord(_imageauthorid, cartdetails.buyer_id, _imageprice, result.transaction.id);

        User.esFindOne({ term: { _id: _imageauthorid } }, function(err, author) {
          const _authoradminpercentage = Number(author.adminpercentage);
          const _paypalemail = author.paypalemail;
          //
          if (!_paypalemail)
            // brainTreePay(_imageprice);
            return;

          //
          if (_authoradminpercentage) {
            const _adminTaken = (_imageprice * _authoradminpercentage) / 100;
            const _remaining = (_imageprice - _adminTaken);
            paypal.pay(_paypalemail, _remaining, 'Photography Image Payment', function(err, response) {
              // console.log('paypal', response)
              createSaleRecord(_imageauthorid, _imageprice, _adminTaken, _remaining, result.transaction.id, response);
            });
            // brainTreePay(_imageprice);
          } else Settings.findOne({ edit: 1 }, function(err, settings) {
            const _adminpercentage = settings.adminpercentage;
            const _adminTaken = (_imageprice * _adminpercentage) / 100;
            const _remaining = (_imageprice - _adminTaken);
            paypal.pay(_paypalemail, _remaining, 'Photography Image Payment', function(err, response) {
              createSaleRecord(_imageauthorid, _imageprice, _adminTaken, _remaining, result.transaction.id, response);
            });
            // brainTreePay(_imageprice);
          });

        });
      } else
        // Albums.esFindOne({
        //     "bool": { "must": [{ "term": { "_id": _galleryid } }, { "term": { "images.publicid": _imageid, "images.soldout": _soldout } }] }

        UserAlbum.esUpdateOne({
          '_id': _galleryid,
          'images.publicid': _imageid
        }, {
          $set: {
            'images.$.soldout': _soldout
          }
        }, function(err, img) {
          if (err) res.send({
            'type': 'error',
            'msg': err.message,
            'error': err
          });

          else if (img && img.userid) {

            // console.log('Albums img', img.images)
            // var _imageadminpercentage = img.adminpercentage;
            const _imageauthorid = img.userid;

            createPaymentRecord(_imageauthorid, cartdetails.buyer_id, _imageprice, result.transaction.id);

            User.esFindOne({ term: { _id: _imageauthorid } }, function(err, author) {
              // User.findOne({_id: _imageauthorid}, function(author) {
              const _authoradminpercentage = Number(author.adminpercentage);
              const _paypalemail = author.paypalemail;

              //
              if (!_paypalemail)
                // brainTreePay(_imageprice);
                return;

              //
              if (_authoradminpercentage) {
                const _adminTaken = (_imageprice * _authoradminpercentage) / 100;
                const _remaining = (_imageprice - _adminTaken);
                paypal.pay(_paypalemail, _remaining, 'Photography Image Payment', function(err, response) {
                  createSaleRecord(_imageauthorid, _imageprice, _adminTaken, _remaining, result.transaction.id, response);
                });
                // brainTreePay(_imageprice);
              } else Settings.findOne({ edit: 1 }, function(err, settings) {
                const _adminpercentage = settings.adminpercentage;
                const _adminTaken = (_imageprice * _adminpercentage) / 100;
                const _remaining = (_imageprice - _adminTaken);
                paypal.pay(_paypalemail, _remaining, 'Photography Image Payment', function(err, response) {
                  createSaleRecord(_imageauthorid, _imageprice, _adminTaken, _remaining, result.transaction.id, response);
                });
                // brainTreePay(_imageprice);
              });

            });
          }
          else res.send({
            'type': 'error',
            'msg': 'Not found'
          });

        });

    });
  }

  function processCarts() {
    Cart.find({
      buyer_id: _localid || _payerid
    }, function(err, carts) {
      // console.log('process cart', carts)
      downloadList = [];
      let totalamount = 0;
      carts.forEach(function(cartdetails) {
        if (!cartdetails.soldout) {
          if (cartdetails.sellonetime) cartdetails.soldout = true;

          downloadList.push(createDownloadRecord(cartdetails.gallery_id, cartdetails.image_id, _payerid || cartdetails.buyer_id, 'image', cartdetails.downloadlink, cartdetails.image_publicid));
          totalamount += Number(cartdetails.price);
          processPayment(cartdetails);
        }
      });
      if (totalamount) brainTreePay(totalamount, (err) => {
        if (err) return res.status(500).send(err);

        Promise.all(downloadList)
          .then(() => {
            Cart.esRemoveAll({
              'buyer_id': _localid || _payerid
            }, function() {
              res.send({
                'type': 'success',
                'msg': 'You have made payment successfully. Please wait for downloading.'
              });
            });
          });
      });
    });
  }

  function processAlbum() {
    const _albumid = req.body.albumid;

    downloadList = [];
    UserAlbum.esFindOne({
      term: {
        _id: _albumid
      }
    }, function(err, useralbum) {
      // console.log('album process:', useralbum)
      if (err || !useralbum) return res.status(500).send(err);

      const albumprice = Number(useralbum.price);

      if (albumprice) brainTreePay(albumprice, (err) => {
        if (err) return res.status(500).send(err);

        albumPaid(albumprice, _albumid, useralbum);
      });
    });
  }

  function albumPaid(albumprice, albumid, useralbum) {
    User.esFindOne({ term: { _id: useralbum.userid } }, function(err, author) {
      if (err || !author) {
        res.send({
          'type': 'error',
          'msg': 'Album author not found.'
        });
        return;
      }
      const _paypalemail = author.paypalemail;
      let _adminPercentage = Number(useralbum.adminpercentage) || 30;

      if (!_paypalemail) _adminPercentage = 100;

      const _adminTaken = albumprice ? (albumprice * _adminPercentage) / 100 : 0;
      const _remaining = albumprice ? (albumprice - _adminTaken) : 0;

      useralbum.images = useralbum.images.filter(e => !e.soldout);
      downloadList = [createPaymentRecord(useralbum.userid, _payerid, useralbum.price, Date.now())];

      useralbum.images.forEach(function(image) {
        if (!image.soldout) {
          if (image.sellonetime) image.soldout = true;
          downloadList.push(createDownloadRecord(albumid, image.publicid, _payerid, 'album', `https://stock.vavel.com/s/photoImages/bunch/${image.publicid}.${image.fileExtension.toLowerCase()}`, image.publicid));
        }
      });

      Promise.all(downloadList)
        .then((resultDownload) => {
          if (_remaining && _paypalemail) paypal.pay(_paypalemail, _remaining, 'Album Image Payment', function(err, response) {
            if (err) {
              console.log('paypal.pay err', err);

              if (err.message === 'Response ack is Failure. Check the response for more info') {

                _adminPercentage = 100;

                const _adminTaken = (albumprice * _adminPercentage) / 100;
                const _remaining = (- _adminTaken);

                createSaleRecord(useralbum.userid, albumprice, _adminTaken, _remaining, Date.now(), response);
                res.send({
                  'type': 'success',
                  'msg': {
                    _paypalemail,
                    _remaining
                  }
                });
              }
              else res.send({
                'type': 'error',
                'error': 'Hello denis',
                'msg': err.message
              });

            } else {
              createSaleRecord(useralbum.userid, albumprice, _adminTaken, _remaining, Date.now(), response);
              res.send({
                'type': 'success',
                'msg': {
                  _paypalemail,
                  _remaining
                }
              });
            }
          });
          else res.send({
            'type': 'success',
            'msg': {
              _paypalemail,
              _remaining
            }
          });

        });
    });
  }
});

module.exports = router;
