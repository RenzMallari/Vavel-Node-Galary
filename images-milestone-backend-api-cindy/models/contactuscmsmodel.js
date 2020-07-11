const mongoose = require('mongoose');
const mongoosastic = require('mongoosastic');
const _ = require('lodash');
const model = require('../components/model');
mongoose.Promise = global.Promise;

const contactuscmsSchema = mongoose.Schema({
  title: String,
  subtitle: String,
  formtitle: String,
  formbelowtext: String,
  edit: Number
});

contactuscmsSchema.plugin(mongoosastic);
module.exports = mongoose.model('contactuscms', contactuscmsSchema);
_.extend(module.exports, model);
