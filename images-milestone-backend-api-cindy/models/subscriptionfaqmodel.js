const mongoose = require('mongoose');
const mongoosastic = require('mongoosastic');
const _ = require('lodash');
const model = require('../components/model');
mongoose.Promise = global.Promise;

const subscriptionfaqSchema = mongoose.Schema({
  question: String,
  answer: String
});

subscriptionfaqSchema.plugin(mongoosastic);
module.exports = mongoose.model('subscriptionfaqs', subscriptionfaqSchema);
_.extend(module.exports, model);
