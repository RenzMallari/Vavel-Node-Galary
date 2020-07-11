const mongoose = require('mongoose');
const mongoosastic = require('mongoosastic');
const _ = require('lodash');
const model = require('../components/model');
mongoose.Promise = global.Promise;

const likeSchema = mongoose.Schema({
  galleryid: String,
  imageid: String,
  userid: String
});

likeSchema.plugin(mongoosastic);
module.exports = mongoose.model('likes', likeSchema);
_.extend(module.exports, model);
