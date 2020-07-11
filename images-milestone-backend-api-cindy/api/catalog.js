const express = require('express');
const router = express.Router();
const Tags = require('../models/tagsmodel');
const helper = require('../components/es_helper');
const Relevant = require('../models/relevantmodel');
const routeCache = require('../components/routeCache');

const regTextPrepare = helper.regTextPrepare;

router.get('/getallkeywords', function(req, res) {
  const allkeywords = [];
  Tags.esFind({
    match_all: {}
    // Tags.find({
  }, function(err, keywordfind) {
    if (err) return res.send({ 'type': 'error', 'msg': err });

    if (keywordfind.length) keywordfind.reduce(function(result, current) {
      result[current.keyword] = result[current.keyword] || [];
      result[current.keyword].push(current);
      allkeywords.push(result);
      return result;
    }, {});

    res.send({ 'type': 'success', 'is_keyword_exist': !!keywordfind.length, 'allkeywords': allkeywords[0] });
  });
});

router.get('/gettrendingkeywords', function(req, res, next) {
  let _is_keyword_exist = 0;
  const allkeywords = [];
  Relevant.esFind({
    match_all: {}
    // Relevant.find({
  }, function(err, keywordfind) {
    if (err) res.send({ 'type': 'error', 'msg': err });

    else {
      if (keywordfind.length > 0) {
        _is_keyword_exist = 1;
        keywordfind.reduce(function(result, current) {
          result[current.keyword] = result[current.keyword] || [];
          result[current.keyword].push(current);
          allkeywords.push(result);
          return result;
        }, {});
      }
      else _is_keyword_exist = 0;

      res.send({ 'type': 'success', 'is_keyword_exist': _is_keyword_exist, 'allkeywords': allkeywords[0] });
    }
  });
});

function shuffle(o) {
  for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  return o;
}

router.get('/getexplorekeywords', function(req, res, next) {
  let _is_keyword_exist = 0;
  const allkeywords = [];
  Tags.esFind({
    term: { showinexplore: true }
    // Tags.find({'showinexplore':true
  }, function(err, keywordfind) {
    if (err) res.send({ 'type': 'error', 'msg': err });

    else {
      if (keywordfind.length > 0) {
        _is_keyword_exist = 1;
        keywordfind.reduce(function(result, current) {
          result[current.keyword] = result[current.keyword] || [];
          result[current.keyword].push(current);
          allkeywords.push(result);
          return result;
        }, {});
      }
      else _is_keyword_exist = 0;

      const arr = [];
      for (const x in allkeywords[0]) arr.push(allkeywords[0][x]);

      const randomcatalog = shuffle(arr);
      res.send({ 'type': 'success', 'is_keyword_exist': _is_keyword_exist, 'allkeywords': randomcatalog });
    }
  });
});

router.post('/searchkeywords', function(req, res, next) {
  const _keyword = req.body.keyword;
  if (_keyword == '' || _keyword === undefined) Tags.esFind({
    match_all: {}
  }, function(err, keywordfind) {
    if (err) res.send({ 'type': 'error', 'msg': err });

    else res.send({ 'type': 'success', 'msg': keywordfind });

  });

  else {
    const query = {
      'query_string': {
        'default_field': 'keyword',
        'query': `*${regTextPrepare(_keyword)}*`
      }
    };
    Tags.esFind(query, function(err, keywordfind) {
      if (err) res.send({ 'type': 'error', 'msg': err });

      else res.send({ 'type': 'success', 'msg': keywordfind });

    });
  }
});

router.post('/searchkeywords_load', function(req, res, next) {
  const _keyword = req.body.keyword;
  const allkeywords = [];

  /* var query = {
    "regexp": {
      "keyword":  '.*' + regTextPrepare(_keyword) + '.*'
    }
  };*/

  const query = {
    'query_string': {
      'default_field': 'keyword',
      'query': `*${regTextPrepare(_keyword)}*`
    }
  };

  Tags.esFind(query, function(err, keywordfind) {
    if (err) res.send({ 'type': 'error', 'msg': 0 });

    else {
      if (keywordfind.length) var a = 1;
      else a = 0;

      keywordfind.sort((a,b) => b.logo ? 1 : -1 );

      res.send({ 'type': 'success', 'msg': a, 'albumkeywords': keywordfind });
    }
  });

});

router.post('/searchkeywords_new', function(req, res, next) {
  const _keyword = req.body.keyword;
  const allkeywords = [];

  const query = {
    'query_string': {
      'default_field': 'keyword',
      'query': `*${regTextPrepare(_keyword)}*`
    }
  };

  Tags.esFind(query, function(err, keywordfind) {
    if (err) res.send({ 'type': 'error', 'msg': err });

    else {
      keywordfind.reduce(function(result, current) {
        result[current.keyword] = result[current.keyword] || [];
        result[current.keyword].push(current);
        allkeywords.push(result);
        return result;
      }, {});
      if (keywordfind.length) var a = 'success';
      else a = 'error';

      res.send({ 'type': a, 'albumkeywords': allkeywords[0] });
    }
  });

});

router.post('/searchinkeyword', function(req, res, next) {

  Tags.esFind({
    match_all: {}
    // Tags.find({
  }, function(err, catalog) {
    if (err) res.send({ 'type': 'error', 'msg': err });

    else res.send({ 'type': 'success', 'msg': catalog });

  });
});

router.get('/getcatalogdetails/:keyword', routeCache.route({ name: 'getcatalogdetails' }), function(req, res) {
  const _keyword = req.params.keyword;

  Tags.esFind({
    match_phrase: { keyword: regTextPrepare(_keyword) }
    //  Tags.find({
    //         "keyword": _keyword
  }, function(err, catalog) {
    if (err) res.send({ 'type': 'error', 'msg': err });

    else if (catalog) res.send({ 'type': 'success', 'msg': catalog, 'keyword': regTextPrepare(_keyword) });

    else res.send({ 'type': 'error', 'msg': err });

  });
});

router.post('/showinexplore', function(req, res, next) {
  const key = req.body.key;

  Tags.esFind({
    match: { keyword: regTextPrepare(key) }
    /* Tags.find({
          'keyword':key*/
  }, function(err, catalog) {
    if (err) res.send({ 'type': 'error', 'msg': err });

    else if (catalog) {
      catalog.forEach(function(data, index) {
        Tags.esUpdateOne({ '_id': data._id }, { $set: { 'showinexplore': true } }, function(error, tg) {
          if (error) res.send({ 'type': 'error', 'msg': error });
        });
      });
      res.send({ 'type': 'success', 'msg': 'success' });
    }
    else res.send({ 'type': 'error', 'msg': 'Catalog not found.' });

  });
});

router.post('/removefromexplore', function(req, res, next) {
  const key = req.body.key;

  Tags.esFind({
    match: { keyword: regTextPrepare(key) }
    /* Tags.find({
           'keyword':key*/
  }, function(err, catalog) {
    if (err) res.send({ 'type': 'error', 'msg': err });

    else if (catalog) {
      catalog.forEach(function(data, index) {
        Tags.esUpdateOne({ '_id': data._id }, { $set: { 'showinexplore': false } }, function(error, tg) {
          if (error) res.send({ 'type': 'error', 'msg': error });
        });
      });
      res.send({ 'type': 'success', 'msg': 'success' });
    }
    else res.send({ 'type': 'error', 'msg': 'Catalog not found.' });

  });
});

module.exports = router;
