const mongoose = require('mongoose');
const mongoosastic = require('mongoosastic');
const _ = require('lodash');
const model = require('../components/model');
mongoose.Promise = global.Promise;

const relevantSchema = mongoose.Schema({
  userid: String,
  keyword: String,
  date: { type: Date, default: Date.now }
});

relevantSchema.plugin(mongoosastic);
module.exports = mongoose.model('relevant', relevantSchema);
_.extend(module.exports, model);
