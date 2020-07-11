const es_helper = require('../components/es_helper');
const async = require('async');

module.exports.esUpdateOne = function(query, data, callback) {
  this.findOneAndUpdate(query, data, { upsert: true, new: true },
    function(err, result) {
      // stream = salf.synchronize(query);
      // stream.on('close', function(){
      callback && callback(err, result);
      // });
    });
};

module.exports.esUpdateAll = function(query, data, callback) {
  const salf = this;
  this.find(query, function(err, list) {
    if (!err) async.each(list,
      function(item, callb) {
        salf.findOneAndUpdate({ _id: item._id }, data, function(err, data) {
          callb(err, data);
        });
      }, function(err, rezult) {
        // stream = salf.synchronize(query);
        // stream.on('close', function(){
        callback && callback(err, rezult);
        // });
      });

    else
      // stream = salf.synchronize(query);
      // stream.on('close', function(){
      callback && callback(err, null);
    // });

  });
};

module.exports.esRemoveOne = function(query, callback) {
  this.findOneAndRemove(query, function() {
    // stream = salf.synchronize(query);
    // stream.on('close', function(){
    callback && callback();
    // });
  });
};

module.exports.esRemoveAll = function(query, callback) {
  const salf = this;
  this.find(query, function(err, list) {
    if (!err) async.each(list, function(item, callb) {
      salf.findOneAndRemove({ _id: item._id }, function(err, data) {
        callb(err, data);
      });
    }, function(err, rezult) {
      // stream = salf.synchronize(query);
      // stream.on('close', function(){
      callback && callback(err, rezult);
      // });
    });

    else
      // stream = salf.synchronize(query);
      // stream.on('close', function(){
      callback && callback(err, rezult);
    // });

  });
};

module.exports.esFindOne = function(query, callback) {
  this.search(query, function(err, data) {
    if (err) {
      console.log(data);
      return callback && callback(err, null);
    }
    es_helper.findFirstModel(data, function(ready, data) {
      if (ready) callback && callback(err, data);
      else callback && callback(err, null);

    });
  });
};

module.exports.esFind = function(query, callback) {
  // console.log(query)
  this.search(query, function(err, data) {
    if (err) return callback && callback(err, null);

    es_helper.findAllModels(data, function(ready, data) {
      callback && callback(err, data);
    });
  });
};

module.exports.esRawFind = function(query, options, callback) {
  this.search(query, options, function(err, data) {
    if (err) return callback && callback(err, null);

    es_helper.findAllModels(data, function(ready, data) {
      callback && callback(err, data);
    });
  });
};

module.exports.esSave = function(document, callback) {
  document.save(function(err, data) {
    if (err) return callback && callback(err, null);

    document.on('es-indexed', function() {
      console.log('document indexed');
      return callback && callback(err, data);
    });
  });

};
