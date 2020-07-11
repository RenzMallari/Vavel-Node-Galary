const mongoose = require('mongoose');
const mongoosastic = require('mongoosastic');
const _ = require('lodash');
const model = require('../components/model');

mongoose.Promise = global.Promise;

const usersubscriptionSchema = mongoose.Schema({
  userid: String,
  subscriptionid: String,
  subscriptionname: String,
  amount: String,
  userphone: String,
  noofimages: Number,
  startdate: { type: Date, default: Date.now },
  startdatetimestamp: Number,
  enddate: { type: Date },
  enddatetimestamp: Number
});

usersubscriptionSchema.plugin(mongoosastic);
module.exports = mongoose.model('usersubscriptions', usersubscriptionSchema);
_.extend(module.exports, model);
