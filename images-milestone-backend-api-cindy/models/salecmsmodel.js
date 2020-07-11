const mongoose = require('mongoose');
const mongoosastic = require('mongoosastic');
const _ = require('lodash');
const model = require('../components/model');
mongoose.Promise = global.Promise;

const salecmsSchema = mongoose.Schema({
  title: String,
  content: String,
  edit: Number
});

salecmsSchema.plugin(mongoosastic);
module.exports = mongoose.model('salecms', salecmsSchema);
_.extend(module.exports, model);
