const mongoose = require('mongoose');
const mongoosastic = require('mongoosastic');
const _ = require('lodash');
const model = require('../components/model');
mongoose.Promise = global.Promise;

const brandlistSchema = mongoose.Schema({
  image: String,
  isactive: { type: Boolean, default: true }
});

brandlistSchema.plugin(mongoosastic);
module.exports = mongoose.model('brandlists', brandlistSchema);
_.extend(module.exports, model);
