const mongoose = require('mongoose');
const mongoosastic = require('mongoosastic');
const _ = require('lodash');
const model = require('../components/model');
mongoose.Promise = global.Promise;

const paymentSchema = mongoose.Schema({
  userid: String,
  payerid: String,
  payerphone: String,
  type: String,
  totalamount: String,
  currency: String,
  paymentid: String,
  status: String,
  paydate: { type: Date, default: Date.now }
});

paymentSchema.plugin(mongoosastic);
module.exports = mongoose.model('payments', paymentSchema);
_.extend(module.exports, model);
