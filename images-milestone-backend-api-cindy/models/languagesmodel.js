const mongoose = require('mongoose');
const mongoosastic = require('mongoosastic');
const _ = require('lodash');
const model = require('../components/model');
mongoose.Promise = global.Promise;

const languagesSchema = mongoose.Schema({
  languagename: String,
  languageshostname: String,
  isactive: { type: Boolean, default: true },
  isdeleted: { type: Boolean, default: false }

});

languagesSchema.plugin(mongoosastic);
module.exports = mongoose.model('languages', languagesSchema);
_.extend(module.exports, model);
