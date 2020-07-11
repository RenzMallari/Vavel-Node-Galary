const mongoose = require('mongoose');
const mongoosastic = require('mongoosastic');
const _ = require('lodash');
const model = require('../components/model');
mongoose.Promise = global.Promise;

const carttotalSchema = mongoose.Schema({
  totalprice: String,
  buyer_id: String
});

carttotalSchema.plugin(mongoosastic);
module.exports = mongoose.model('carttotal', carttotalSchema);
_.extend(module.exports, model);
