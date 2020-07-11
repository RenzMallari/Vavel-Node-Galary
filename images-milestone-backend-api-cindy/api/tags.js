const express = require('express');
const mongoose = require('mongoose');
const models = require('../models');
const router = express.Router();
const ftpClient = require('ftp');
const ftpAccess = require('../config/ftp_access');
const fs = require('fs');
const routeCache = require('../components/routeCache');
require('../events/albumEvent');
const multer = require('multer');

const _upload = multer({
  storage: multer.diskStorage({
    destination: `${__dirname}/uploads/tags/`,
    filename(req, file, cb) {
      let ext = '';
      switch (file.mimetype) {
      case 'image/jpg':
        ext = '.jpg';
        break;
      case 'image/jpeg':
        ext = '.jpeg';
        break;
      case 'image/png':
        ext = '.png';
        break;
      case 'image/gif':
        ext = '.gif';
        break;
      }
      const { type, _id } = req.params;

      cb(null, `${type}-${_id}-${Date.now()}${ext}`);
    }
  }),
  limits: { fileSize: 1000000 }
});

const Tags = models.tags;

router.use('/upload/:_id', _upload.single('file'), function(req, res, next) {

  if (req.file && req.file.path && req.file.filename) {
    const fileExtension = req.file.filename.split('.').pop().toLowerCase();
    const { _id } = req.params;
    const name = `logo-${_id}.${fileExtension}`;

    const client = new ftpClient();
    client.on('ready', function() {

      client.delete(`/photoImages/bunch/${name}`, function(err) {
        if (err) console.log('delete image', err);
        // return res.send({ "type": "error", "msg": err.message, 'err': err });

        client.put(req.file.path, `/photoImages/bunch/${name}`, function(err) {
          if (err) return res.send({ 'type': 'error', 'msg': err.message, err });

          else {
            if (fs.existsSync(req.file.path)) fs.unlink(req.file.path, function(err) {
              if (err) console.log('err delete', err);
              else console.log('File deleted');
            });

            client.end();
            Tags.esUpdateOne({
              _id: mongoose.Types.ObjectId(_id)
            }, {
              $set: { 'logo': name }
            }, function(err, result) {
              if (err) return res.send({ 'type': 'error', 'msg': err.message, err });

              else return res.send({ 'type': 'success', 'msg': result });

            });

          }

        });

      });

    });
    client.connect(ftpAccess);
  }
  else res.send({
    'type': 'error',
    'msg': 'Can not upload'
  });

});
router.post('/create', function(req, res) {
  const { keyword, isofficial, showinexplore } = req.body;
  Tags.create({
    showinexplore,
    keyword,
    isofficial,
    date: Date.now()
  }, function(err, result) {
    if (err) res.send({ 'type': 'error', 'msg': err.message, err });

    else res.send({ 'type': 'success', 'msg': result });

  });
});

router.get('/adminlist', function(req, res) {
  const { search = '', limit = 10, page = 1, isofficial } = req.query;

  const skip = parseInt(page - 1) * limit;
  let query = {
    $or: [
      { keyword: new RegExp(search, 'i') }
    ]
  };

  if (isofficial) query = Object.assign(query, { isofficial });

  Tags.count(query).then(sum => {
    Tags.find(query).sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit))
      .then((results = []) => {
        res.send({
          'type': 'success',
          'listtags': results,
          'total': sum,
          'totalPage': Math.ceil(sum / limit)
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

router.post('/official/:_id', function(req, res) {

  const { _id } = req.params;
  const { isofficial } = req.body;

  Tags.esUpdateOne({
    _id
  }, {
    $set: { isofficial }
  }, function(err, result) {
    if (err) res.send({
      'type': 'error',
      'error': err,
      'msg': err.message
    });

    else res.send({
      'type': 'success',
      'msg': result
    });

  });
});

router.post('/update/:_id', function(req, res) {

  const { _id } = req.params;
  const { isofficial, logo, image, keyword } = req.body;
  Tags.esUpdateOne({
    _id
  }, {
    $set: { isofficial, logo, image, keyword }
  }, function(err, result) {
    if (err) res.send({
      'type': 'error',
      'error': err,
      'msg': err.message
    });

    else {
      console.log('update tag', result);
      res.send({
        'type': 'success',
        'msg': result
      });
    }
  });
});

router.get('/listtags', routeCache.route({ name: 'getalltags' }), function(req, res) {
  Tags.aggregate([
    {
      '$group': {
        _id: '$keyword',
        tag: { '$first': '$$ROOT' },
        count: { $sum: 1 },
        list_tags: { $push: '$$ROOT' }
      }
    }, {
      $sort: {
        count: -1
      }
    }

  ], (err, results) => {
    if (err) return res.send({
      'type': 'error',
      'msg': err
    });

    res.send({
      'type': 'success',
      'listtags': results
    });

  });
});

router.get('/tag-with-logo', routeCache.route({ name: 'tag-with-logo' }), function(req, res) {
  const { tag } = req.query;

  Tags.findOne({
    'keyword': tag,
    'logo': { $ne: null }
  }, (err, result) => {
    if (err) return res.send({
      'type': 'error',
      'msg': err
    });

    res.send({
      'type': 'success',
      'logo': result && result.logo || null
    });

  });
});

module.exports = router;
