const mongoose = require('mongoose');
const mongoosastic = require('mongoosastic');
const _ = require('lodash');
const model = require('../components/model');
mongoose.Promise = global.Promise;

const subscriptionSchema = mongoose.Schema({
  subscriptionname: String,
  description: String,
  amount: String,
  noofimages: String,
  isactive: { type: Boolean, default: true },
  ispopular: { type: Boolean, default: false }
});

subscriptionSchema.plugin(mongoosastic);
module.exports = mongoose.model('subscriptions', subscriptionSchema);
_.extend(module.exports, model);
