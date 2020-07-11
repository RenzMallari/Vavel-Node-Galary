const mongoose = require('mongoose');
const mongoosastic = require('mongoosastic');
const _ = require('lodash');
const model = require('../components/model');

mongoose.Promise = global.Promise;

const usersubscriptionimagesSchema = mongoose.Schema({
  authorid: String,
  userid: String,
  imageid: String,
  date: { type: Date, default: Date.now },
  datetimestamp: Number
});

usersubscriptionimagesSchema.plugin(mongoosastic);
// eslint-disable-next-line max-len
module.exports = mongoose.model('usersubscriptionimages', usersubscriptionimagesSchema);
_.extend(module.exports, model);
