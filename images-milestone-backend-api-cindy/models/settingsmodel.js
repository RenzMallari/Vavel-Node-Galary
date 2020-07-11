const mongoose = require('mongoose');
const mongoosastic = require('mongoosastic');
const _ = require('lodash');
const model = require('../components/model');
mongoose.Promise = global.Promise;

const settingsSchema = mongoose.Schema({
  adminpercentage: String,
  adminpercentageperimage: String,
  adminemail: String,
  adminpaypalid: String,
  adminphonenumber: String,
  facebook: String,
  twitter: String,
  instagram: String,
  contactno: String,
  contactemail: String,
  copyright: String,
  noscriptcontent: String,
  image: String,
  edit: Number
});

settingsSchema.plugin(mongoosastic);
module.exports = mongoose.model('settings', settingsSchema);
_.extend(module.exports, model);
