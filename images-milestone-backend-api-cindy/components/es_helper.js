module.exports.findFirstModel = function (result, callback) {
  if (result.hits && result.hits.hits && result.hits.hits[0]) {
    var res = result.hits.hits[0]._source;
    res._id = result.hits.hits[0]._id;
    return callback(true, res);
  }

  callback(false, null);
}

module.exports.findAllModels = function (result, callback) {
  if (result.hits && result.hits.hits) {
    const list = result.hits.hits.map(r => {
      return { ...r._source, ...{ _id: r._id } }
    })

    return callback(!!list.length, list);
  }

  callback(false, null);
}

module.exports.regTextPrepare = function (str) {
  return str.replace(/([\\.?+*|{}\[\]()"#@&<>~])/g, "\\$1");
}