const eventBus = require('../components/eventBus');

const ftpClient = require('ftp');
const ftpAccess = require('../config/ftp_access');

const _ = require('lodash');
const async = require('async');

const mongoose = require('mongoose');
const UserAlbum = require('../models/useralbumsmodel');
const Tags = require('../models/tagsmodel');
const Likes = require('../models/likesmodel');
const Collections = require('../models/usercollectionsmodel');
const UserGalleriers = require('../models/usergalleriesmodel');

const Albums = UserAlbum;

eventBus.onSeries('albumImgAdd', function(obj, next) {
  UserAlbum.esFindOne(
    {
      'bool': {
        'must': [
          { 'term': { 'userid': obj.userData._id } },
          { 'term': { '_id': obj.req.params.albumId } }
        ]
      }
    },
    function(err, currentAlbum) {
      if (err) {
        obj.callback && obj.callback({ 'type': 'error', 'msg': 'Some error occurred. Please try again later.' });
        return next();
      }
      else if (currentAlbum) {
        const img = {
          publicid: obj.fileId,
          fileExtension: obj.fileExtension,
          userid: obj.userData._id,
          caption: '',
          imagewidth: obj.dimensions.width,
          imageheight: obj.dimensions.height,
          comments: [],
          tags: []
        };
        currentAlbum.images.unshift(img);
        UserAlbum.esUpdateOne({ _id: mongoose.Types.ObjectId(currentAlbum._id) }, currentAlbum, function(err, album) {
          stream = UserAlbum.synchronize({ _id: mongoose.Types.ObjectId(currentAlbum._id) });
          stream.on('close', function() {
            obj.fileInfo.data = img;
            obj.fileInfo.albumId = obj.req.params.albumId;

            obj.rezultSend.files[0] = obj.fileInfo;
            obj.callback && obj.callback(JSON.stringify(obj.rezultSend));
            next();
          });
        });
      }
      else {
        obj.callback && obj.callback({ 'type': 'error', 'msg': 'Some error occurred. Please try again later.' });
        return next();
      }
    });
});

const deleteFtpImg = function(name, fileExtension, callback) {
  const client = new ftpClient();
  client.on('ready', function() {
    async.parallel({
      delBunch(callback) {
        client.delete(`/photoImages/bunch/${name}.${fileExtension}`, function(err) {
          callback(err);
        });
      },
      delThumbnail(callback) {
        client.delete(`/photoImages/thumbnail/${name}.${fileExtension}`, function(err) {
          callback(err);
        });
      }
    }, function(err, rez) {
      client.end();
      callback && callback();
    });
  });

  client.connect(ftpAccess);
};

eventBus.onSeries('albumImgDelete', function(obj, next) {
  Tags.esRemoveAll({ 'galleryid': obj._albumid, 'imageid': obj._imageid }, function(err, gallery) { });
  Likes.esRemoveAll({ 'galleryid': obj._albumid, 'imageid': obj._imageid }, function(err, like) { });

  Collections.esFind({ match_all: {} },
    function(err, col) {
      col.forEach(function(data, index) {
        _.remove(data.images, { publicid: obj._imageid });
        Collections.esUpdateOne({ _id: data._id }, data, function() { });
      });
    });
  UserAlbum.esFindOne({
    term: { _id: obj._albumid }
  },

    function(err, data) {

      const rezDel = _.remove(data.images, function(n) {
        return n.publicid == obj._imageid;
      });

      UserAlbum.esUpdateOne({ _id: data._id }, data, function(err, data1) {

        stream = UserAlbum.synchronize({ _id: mongoose.Types.ObjectId(data._id) });
        stream.on('close', function() {

          if (err) {
            handleError(err);
            return next();
          }
          obj.callback && obj.callback({ 'type': 'success', 'msg': 'Successfully Deleted', 'imgId': obj._imageid });

          next();

          if (rezDel && rezDel[0]) deleteFtpImg(rezDel[0].publicid, rezDel[0].fileExtension, function() {
          });

        });
      });
    });
});

eventBus.onSeries('albumImgUpdate', function(obj, next) {
  const imgList = obj.imgList;
  // console.log(imgList)
  const _caption = obj._caption;
  const _tags = obj._tags;
  const _price = obj._price;
  const _isthumbnail = obj._isthumbnail;
  const _sellonetime = obj._sellonetime;

  const req = obj.req;

  function updateImage(_galleryid, _imageid, _caption, price, _tags, _isthumbnail, _sellonetime, callback) {
    let _tagarr = [];

    UserGalleriers.esFindOne({
      term: { _id: _galleryid }
    }, function(err, gallery) {
      if (gallery) {
        Tags.esRemoveAll({ 'galleryid': _galleryid, 'imageid': _imageid }, function(err, removedtags) { });
        if (req.body.tags.length != 0 && req.body.tags != undefined) for (let i = 0; i < req.body.tags.length; i++) {
          const addtag = gallery.tags.create({
            tag: req.body.tags[i].tag.trim()
          });
          _tagarr.push(addtag);

          const _tagjoin = new Tags({
            'galleryid': _galleryid,
            'imageid': _imageid,
            'fileExtension': gallery.fileExtension,
            'height': gallery.imageheight,
            'width': gallery.imagewidth,
            'date': gallery.createdate.getTime(),
            'keyword': req.body.tags[i].tag.trim()
          });

          _tagjoin.save(function(err, addedtags) {
          });
        }

        _tagarr = gallery.tags;

        UserGalleriers.esUpdateOne({ '_id': _galleryid }, { $set: { 'caption': _caption, 'tags': _tagarr } }, function(error, tg) {

          if (error) return callback({ 'type': 'error', 'msg': error });

          UserGalleriers.esFindOne({
            term: { _id: _galleryid }
          }, function(errr, gallerydetails) {
            callback(null, { 'type': 'success', 'msg': 'Tags added successfully', gallerydetails });
          });
        });
      }
      else {
        Tags.esRemoveAll({ 'galleryid': _galleryid, 'imageid': _imageid }, function(err, removedtags) { });

        Albums.esFindOne({
          'bool': {
            'must': [
              { 'term': { '_id': _galleryid } }
            ]
          }
        }, function(err, useralbum) {
          if (err) return callback({ 'type': 'error', 'msg': err });

          else if (useralbum) {
            const index = _.findIndex(useralbum.images, { 'publicid': _imageid });
            if (req.body.tags && Array.isArray(req.body.tags)) for (const i in req.body.tags) {
              const _tagjoin = new Tags({
                'galleryid': _galleryid,
                'imageid': _imageid,
                'fileExtension': useralbum.images[index].fileExtension,
                'height': useralbum.images[index].imageheight,
                'width': useralbum.images[index].imagewidth,
                'date': (new Date(useralbum.images[index].adddate)).getTime(),
                'keyword': req.body.tags[i].tag.trim()
              });
              _tagjoin.save(function(err, addedtags) {

              });
              _tagarr.push({
                tag: req.body.tags[i].tag.trim()
              });
            }

            useralbum.images[index].tags = _tagarr;

            useralbum.images[index].caption = _caption;
            _sellonetime = _sellonetime || false;
            useralbum.sellonetime = _sellonetime;
            if (_isthumbnail) {
              useralbum.thumbnail = useralbum.images[index];
              if (useralbum.images && useralbum.images.length) useralbum.images = useralbum.images.map((e, i) => {
                if (i === index) e.isthumbnail = true;
                else e.isthumbnail = false;
                return e;
              });

            }
            Albums.esUpdateOne({ '_id': _galleryid }, useralbum, function(error, comnt) {
              // console.log('comnt', comnt)
              const stream = UserAlbum.synchronize({ '_id': mongoose.Types.ObjectId(_galleryid) });
              stream.on('close', function() {
                if (error) return callback({ 'type': 'error', 'msg': error });

                const albmdet = {
                  '_id': _galleryid,
                  'imagepublicid': useralbum.images[index].publicid,
                  'caption': useralbum.images[index].caption,
                  'tags': useralbum.images[index].tags,
                  'comments': useralbum.images[index].comments,
                  'imagewidth': useralbum.images[index].imagewidth,
                  'imageheight': useralbum.images[index].imageheight,
                  'userid': useralbum.images[index].userid,
                  'isthumbnail': useralbum.images[index].isthumbnail,
                  'sellonetime': useralbum.images[index].sellonetime
                };
                callback(null, { 'type': 'success', 'msg': 'Tags added successfully', 'gallerydetails': albmdet });
              });
            });
          }
          else callback({ 'type': 'error', 'msg': 'Not Found' });
        });
      }
    });
  }

  if (_.isArray(imgList)) {
    const countImgList = imgList.length;
    async.map(imgList,
      function(item, callback) {
        Albums.esFindOne({
          // 'term': { 'images.publicid': item }
          'nested': {
            'path': 'images',
            'query': {
              'bool': {
                'must': [
                  {
                    'term': {
                      'images.publicid': item
                    }
                  }
                ]
              }
            }
          }

        }, function(err, album) {
          if (err) return callback(err);

          if (!album) return callback({ 'type': 'error', 'msg': `No album find for items ${item}` });

          if (countImgList == 1) Tags.esRemoveAll({ 'galleryid': album._id, 'imageid': item }, function(err, removedtags) { });

          const index = _.findIndex(album.images, { 'publicid': item });
          if (req.body.tags && Array.isArray(req.body.tags)) for (const i in req.body.tags) {
            const _tagjoin = new Tags({
              'galleryid': album._id,
              'imageid': item,
              'fileExtension': album.images[index].fileExtension,
              'height': album.images[index].imageheight,
              'width': album.images[index].imagewidth,
              'date': (new Date(album.images[index].adddate)).getTime(),
              'keyword': req.body.tags[i].tag.trim()
            });
            _tagjoin.save(function(err, addedtags) {

            });
          }

          album.thumbnail = album.images[index];
          if (album.images && album.images.length) album.images = album.images.map((e, i) => {
            if (index === i) e.isthumbnail = true;

            else e.isthumbnail = false;
            return e;
          });

          return callback(null, { album, img: item });
        });
      },
      function(err, zez) {
        if (err) {
          obj.resp && obj.resp(err);
          return next();
        }
        const finarr = [];

        while (zez.length) {
          const list = _.remove(zez, function(o) {
            return o.album._id === zez[0].album._id;
          });

          for (const i in list) {

            var index = _.findIndex(list[0].album.images, { publicid: list[i].img });
            if (~index) {
              if (countImgList == 1) list[0].album.images[index].tags = _tags;

              else list[0].album.images[index].tags = _.uniq(list[0].album.images[index].tags.concat(_tags));

              list[0].album.images[index].caption = _caption;
              list[0].album.images[index].price = _price || {};
              list[0].album.images[index].isthumbnail = true;
              list[0].album.images[index].sellonetime = _sellonetime || false;
              list[0].album.thumbnail = list[0].album.images[index];
              if (list[0].album.images && list[0].album.images.length) list[0].album.images = list[0].album.images.map((e, i) => {
                if (i !== index) e.isthumbnail = false;
                else e.isthumbnail = true;

                return e;
              });

              // console.log(list[0].album.images[index].isthumbnail)
            }
          }
          finarr.unshift(list[0].album);
        }
        async.each(finarr,
          function(item, callback) {

            Albums.esUpdateOne({ '_id': item._id }, item, function(error, comnt) {
              if (error) return callback({ 'type': 'error', 'msg': error });

              callback();
            });
          },
          function(err) {
            if (err) {

              obj.resp && obj.resp(err);
              return next();
            }
            obj.resp && obj.resp({ 'type': 'success', 'msg': 'Tags added successfully' });
            next();
          });

      });
  }
  else Albums.esFindOne({
    'nested': {
      'path': 'images',
      'query': {
        'bool': {
          'must': [
            {
              'term': {
                'images.publicid': imgList
              }
            }
          ]
        }
      }
    }
  },
    function(err, album) {
      console.log('album', album);
      if (err) {
        obj.resp && obj.resp(err);
        return next();
      } if (album) updateImage(album._id, imgList, _caption, _price, _tags, _isthumbnail, _sellonetime, function(err, rez) {
        if (err) {
          obj.resp && obj.resp(err);
          return next();
        }
        obj.resp && obj.resp(rez);
        next();
      });

      else {
        obj.resp && obj.resp({ 'type': 'error', 'msg': 'Not Found' });
        return next();
      }
    });

});

eventBus.onSeries('albumUpdate', function(obj, next) {
  const userid = obj.req.body.userid;
  const albumid = obj.req.body.albumid;
  const albumname = obj.req.body.albumname;
  const albumprice = obj.req.body.albumprice;
  const albumkeyword = obj.req.body.albumkeyword;
  const albumcountry = obj.req.body.albumcountry;
  const albumcity = obj.req.body.albumcity;
  const albumaddress = obj.req.body.albumaddress;
  const lng = obj.req.body.lng;
  const lat = obj.req.body.lat;
  const date = obj.req.body.date;
  // if(date) date = new Date(date).getTime()
  const _tagexp = [];
  UserAlbum.esFindOne({
    'bool': {
      'must': [
        { 'term': { userid } },
        // { "term": { "name": albumname } }
        { 'term': { '_id': albumid } }
      ],
      // 'must_not': {
        // "term": { "_id": albumid }
      // }
    }
  }, function(err, useralbum) {
    if (err) {
      obj.resp && obj.resp({ 'type': 'error', 'msg': err.message, 'error': err });
      return next();
    }
    else if (!useralbum) {
      // obj.resp && obj.resp({ "type": "error", "msg": "Album already exist." });
      obj.resp && obj.resp({ 'type': 'error', 'msg': 'Album not found.' });
      return next();
    }
    else UserAlbum.esFindOne({
      term: { _id: albumid }
    }, function(err, updateuseralbum) {
      console.log('updateuseralbum', updateuseralbum);
      for (let j = 0; j < albumkeyword.length; j++) _tagexp.push({ tag: albumkeyword[j].tag.trim() });

      UserAlbum.esUpdateOne({ '_id': albumid }, {
        $set: {
          date, 'name': albumname, lat, lng,
          albumaddress, albumcity, albumcountry,
          'price': albumprice, 'tags': _tagexp
        }
      }, function(error, tg) {
        stream = UserAlbum.synchronize({ '_id': mongoose.Types.ObjectId(albumid) });
        stream.on('close', function() {
          if (error) {
            obj.resp && obj.resp({ 'type': 'error', 'msg': error.message, error });
            return next();
          }
          obj.resp && obj.resp({ 'type': 'success', 'msg': 'success', 'album': tg });
          return next();
        });
      });
    });

  });
});

eventBus.onSeries('uploadTag', function(obj, next) {
  const req = obj.req;
  const { _id, type } = obj;
  const name = obj.name;
  Tags.findOne({
    _id: mongoose.Types.ObjectId(_id)
  },
    function(err, tag) {
      console.log(tag, _id, type);
      if (err) {
        obj.resp && obj.resp({ 'type': 'error', 'msg': err });
        return next();
      }
      else Tags.findOneAndUpdate({
        _id: mongoose.Types.ObjectId(_id)
      }, {
        $set: {
          [type]: name
        }
      }, { upsert: true }, function(err, result) {

        if (err) {
          obj.resp && obj.resp({ 'type': 'error', 'msg': err });
          return next();
        }
        else {
          console.log(result);
          obj.resp && obj.resp({ 'type': 'success', 'msg': result });
          next();
        }
      });

    });

});
eventBus.onSeries('albumDelete', function(obj, next) {
  const req = obj.req;
  const _albumid = req.body.albumid;

  UserAlbum.esFindOne({ term: { _id: _albumid } },
    function(err, albm) {

      if (err) {
        obj.resp && obj.resp({ 'type': 'error', 'msg': err });
        return next();
      }
      else

        if (albm) {
          const conditionList = [];
          const imgIdnList = [];
          for (const i in albm.images) {
            conditionList.unshift({ 'term': { 'images.publicid': albm.images[i].publicid } });
            imgIdnList.unshift(albm.images[i].publicid);
            deleteFtpImg(albm.images[i].publicid, albm.images[i].fileExtension,
              function() {
              });
          }

          Tags.esRemoveAll({ 'galleryid': _albumid }, function(err, gallery) {
          });
          Likes.esRemoveAll({ 'galleryid': _albumid }, function(err, like) {
          });

          if (conditionList.length) Collections.esFind(
            {
              'filtered': {
                'filter': {
                  'or': conditionList
                }
              }
            },

            function(err, col) {
              if(col && col.length > 0) {
                col.forEach(function(data, index) {

                  const evens = _.remove(data.images, function(img) {
                    return !!(~_.indexOf(imgIdnList, img.publicid));
                  });

                  Collections.esUpdateOne({ _id: data._id }, data, function(err, col) { });
                });
              }
            });

          UserAlbum.esRemoveOne({ '_id': _albumid }, function(error, removedalbum) {
            stream = UserAlbum.synchronize({ '_id': mongoose.Types.ObjectId(_albumid) });
            stream.on('close', function() {
              if (error) {
                obj.resp && obj.resp({ 'type': 'error', 'msg': error });
                return next();
              }
              else {
                obj.resp && obj.resp({ 'type': 'success', 'msg': 'Successfully Deleted', 'album': removedalbum });
                return next();
              }
            });
          });
        }
        else {
          obj.resp && obj.resp({ 'type': 'warning', 'msg': 'error' });
          return next();
        }

    });
});
