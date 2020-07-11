const mongoose = require('mongoose');
const mongoosastic = require('mongoosastic');
const _ = require('lodash');
const model = require('../components/model');

mongoose.Promise = global.Promise;

const userSchema = mongoose.Schema({
  roleid: String,
  facebookid: String,
  instagramid: String,
  email: { type: String, es_type: 'keyword' },
  firstname: String,
  middlename: String,
  lastname: String,
  companyname: String,
  username: { type: String },
  fullname: String,
  link: String,
  bio: String,
  verified: { type: Boolean },
  password: { type: String, es_index: false },
  profileimage: String,
  coverimage: String,
  phonenumber: String,
  addressline1: String,
  addressline2: String,
  paypalemail: String,
  watermark1: { type: String, default: '' },
  watermark2: { type: String, default: '' },
  is_watermark1_uploaded: { type: Number, default: 0 },
  is_watermark2_uploaded: { type: Number, default: 0 },
  margedwatermark1: { type: String, default: '' },
  margedwatermark2: { type: String, default: '' },
  city: String,
  state: String,
  country: String,
  verificationcode: String,
  adminpercentage: String,
  currency: { type: String, default: 'USD' },
  isfeatured: { type: Boolean, default: false },
  isactive: { type: Boolean, default: true },
  isdeleted: { type: Boolean, default: false },
  isadmin: { type: Boolean, default: false },
  isloggedin: { type: Boolean, default: false },
  lastloggedindate: { type: Date, default: Date.now },
  createdate: { type: Date, default: Date.now }
});

userSchema.set('redisCache', true);
userSchema.set('expires', 120);

userSchema.plugin(mongoosastic);
module.exports = mongoose.model('users', userSchema);
_.extend(module.exports, model);
