const mongoose = require('mongoose');
const mongoosastic = require('mongoosastic');
const _ = require('lodash');
const model = require('../components/model');

mongoose.Promise = global.Promise;

const faqSchema = mongoose.Schema({
  questions: String,
  answer: String,
  isDeleted: { type: Boolean, default: false }
});

faqSchema.plugin(mongoosastic);
module.exports = mongoose.model('faq', faqSchema);
_.extend(module.exports, model);
