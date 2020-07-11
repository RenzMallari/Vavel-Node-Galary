const mongoose = require('mongoose');
const mongoosastic = require('mongoosastic');
const _ = require('lodash');
const model = require('../components/model');
mongoose.Promise = global.Promise;

const purchasecmsSchema = mongoose.Schema({
  title: String,
  content: String,
  edit: Number
});

purchasecmsSchema.plugin(mongoosastic);
module.exports = mongoose.model('purchasecms', purchasecmsSchema);
_.extend(module.exports, model);
