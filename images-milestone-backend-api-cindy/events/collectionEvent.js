const eventBus = require('../components/eventBus');

const _ = require('lodash');
const async = require('async');
const mongoose = require('mongoose');

const Collections = require('../models/usercollectionsmodel');
const Albums = require('../models/useralbumsmodel');

eventBus.onSeries('collectionUpdate', function(obj, next) {
  const req = obj.req;
  const userid = req.body.userid;
  const collectionid = req.body.collectionid;
  const collectionname = req.body.collectionname;

  Collections.esFindOne({
    'bool': {
      'must': [
        { 'term': { userid } },
        { 'term': { 'name': collectionname } }
      ],
      'must_not': [
        { 'term': { '_id': collectionid } }
      ]
    }
  }, function(err, usercollection) {
    if (err) {
      obj.resp && obj.resp({ 'type': 'error', 'msg': err });
      return next();
    }
    else if (usercollection) {
      obj.resp && obj.resp({ 'type': 'error', 'msg': 'Collection already exist.' });
      return next();
    }
    else Collections.esUpdateOne({ '_id': collectionid }, { $set: { 'name': collectionname } }, function(error, tg) {
      stream = Collections.synchronize({ '_id': mongoose.Types.ObjectId(collectionid) });
      stream.on('close', function() {
        if (error) {
          obj.resp && obj.resp({ 'type': 'error', 'msg': error });
          return next();
        }
        obj.resp && obj.resp({ 'type': 'success', 'msg': 'success', 'collaction': tg });
        return next();
      });
    });

  });
});

eventBus.onSeries('collectionDeleteImage', function(obj, next) {
  const req = obj.req;
  const _imageid = req.body.imageid;
  const _collectionid = req.body.collectionid;

  Collections.esFindOne({
    term: { _id: _collectionid }
  }, function(err, col) {
    _.remove(col.images, { publicid: _imageid });
    Collections.esUpdateOne({ _id: _collectionid }, col, function(err, collact) {
      stream = Collections.synchronize({ '_id': mongoose.Types.ObjectId(_collectionid) });
      stream.on('close', function() {
        if (err) {
          obj.resp && obj.resp({ 'type': 'error', 'msg': err });
          return next();
        }
        obj.resp && obj.resp({ 'type': 'success', 'msg': 'Successfully Deleted', 'collection': collact });
        return next();
      });
    });
  });
});

eventBus.onSeries('collectionAddImage', function(obj, next) {
  const req = obj.req;
  const userid = req.body.userid;
  const galleryid = req.body.galleryid;
  const collectionid = req.body.collectionid;
  const photopublicid = req.body.photopublicid;

  function updateCollaction(usercollection, galleryid, photopublicid, userid, collectionid, callback) {
    Albums.esFindOne({
      'nested': {
        'path': 'images',
        'query': {
          'bool': {
            'must': [
              {
                'term': {
                  'images.publicid': photopublicid
                }
              }
            ]
          }
        }
      }
    }, function(err, album) {
      if (err || !album) return callback && callback({
        type: 'error',
        msg: 'Image not found'
      });

      Collections.esFindOne({
        'bool': {
          'must': [
            { 'term': { '_id': collectionid } },
            { 'term': { 'images.publicid': photopublicid } }
          ]
        }
      }, function(err, usercollectionalreadyexist) {
        if (usercollectionalreadyexist) return callback && callback({
          type: 'error',
          msg: 'Image already exist in this collection.'
        });

        const index = _.findIndex(album.images, { publicid: photopublicid });
        usercollection.images.push({
          publicid: photopublicid,
          galleryid,
          fileExtension: album.images[index].fileExtension
        });
        Collections.esUpdateOne({ '_id': collectionid }, { $set: { 'images': usercollection.images } }, function(error, tg) {
          const stream = Collections.synchronize({ '_id': mongoose.Types.ObjectId(collectionid) });

          stream.on('close', function() {
            if (error) return callback && callback({
              type: 'error',
              msg: error
            });
          });

          callback && callback(null, { 'type': 'success', 'msg': 'success', 'collaction': usercollection });
        });
      });

    });
  }

  function updateCollactionArray(usercollection, photopublicid, userid, collectionid, callback) {
    photopublicid = _.filter(photopublicid, function(pid) {
      return !~_.findIndex(usercollection.images, { publicid: pid });
    });

    if (_.isEmpty(photopublicid)) return callback({ 'type': 'error', 'msg': 'Images already exist in this collection.' });

    async.map(photopublicid,
      function(pid, callb) {
        Albums.esFindOne({
          'term': { 'images.publicid': pid }
        },
          function(err, album) {
            if (err) return callb(err);

            if (album) {
              const index = _.findIndex(album.images, { publicid: pid });
              return callb(null, { galleryid: album._id, publicid: pid, fileExtension: album.images[index].fileExtension });
            }
            else return callb({ 'type': 'error', 'msg': 'Image not found' });

          });
      },
      function(err, rez) {
        if (err) return callback(err);

        usercollection.images = _.concat(usercollection.images, rez);

        Collections.esUpdateOne({ '_id': collectionid }, { $set: { 'images': usercollection.images } }, function(error, tg) {
          if (error) return callback && callback({ 'type': 'error', 'msg': error });

          callback && callback(null, { 'type': 'success', 'msg': 'success', 'collaction': usercollection });
        });
      });
  }

  Collections.esFindOne({
    'term': { '_id': collectionid }
  }, function(err, usercollection) {
    if (err) {
      obj.resp && obj.resp({ 'type': 'error', 'msg': err });
      return next();
    }

    if (usercollection) if (_.isArray(photopublicid)) {
      updateCollactionArray(usercollection, photopublicid, userid, collectionid, function(err, rez) {
        if (err) {
          obj.resp && obj.resp(err);
          return next();
        }

        obj.resp && obj.resp(rez);
        return next();
      });
    } else {
      updateCollaction(usercollection, galleryid, photopublicid, userid, collectionid, function(err, rez) {
        if (err) {
          obj.resp && obj.resp(err);
          return next();
        }
        obj.resp && obj.resp(rez);
        return next();
      });
    }

  });
});
