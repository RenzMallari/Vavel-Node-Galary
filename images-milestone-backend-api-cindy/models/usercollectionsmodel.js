const mongoose = require('mongoose');
const mongoosastic = require('mongoosastic');
const _ = require('lodash');
const model = require('../components/model');

mongoose.Promise = global.Promise;

const gallerySchema = mongoose.Schema({
  publicid: String,
  galleryid: String,
  fileExtension: String,
  adddate: { type: Date, default: Date.now }
});

const collectionSchema = mongoose.Schema({
  userid: String,
  name: String,
  createdate: { type: Date, default: Date.now },
  images: [gallerySchema],
  issignatured: { type: Boolean, default: false }
});

collectionSchema.set('redisCache', true);
collectionSchema.set('expires', 120);

collectionSchema.plugin(mongoosastic);
module.exports = mongoose.model('usercollections', collectionSchema);
_.extend(module.exports, model);
