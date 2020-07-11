const mongoose = require('mongoose');
const mongoosastic = require('mongoosastic');
const _ = require('lodash');
const model = require('../components/model');
mongoose.Promise = global.Promise;

const brandcmsSchema = mongoose.Schema({
  title: String,
  content: String,
  edit: Number
});

brandcmsSchema.plugin(mongoosastic);
module.exports = mongoose.model('brandcms', brandcmsSchema);
_.extend(module.exports, model);
