const mongoose = require('mongoose');
const mongoosastic = require('mongoosastic');
const config = require('../config/db');
const _ = require('lodash');
const model = require('../components/model');
mongoose.Promise = global.Promise;

const subscriptioncmsSchema = mongoose.Schema({
  title: String,
  subtitle: String,
  image: String,
  edit: Number
});

subscriptioncmsSchema.plugin(mongoosastic);
module.exports = mongoose.model('subscriptioncms', subscriptioncmsSchema);
_.extend(module.exports, model);
