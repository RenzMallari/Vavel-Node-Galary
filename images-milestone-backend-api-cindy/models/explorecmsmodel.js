const mongoose = require('mongoose');
const mongoosastic = require('mongoosastic');
const _ = require('lodash');
const model = require('../components/model');
mongoose.Promise = global.Promise;

const explorecmsSchema = mongoose.Schema({
  title: String,
  subtitle: String,
  usertitle: String,
  usercontent: String,
  userbuttonvalue: String,
  photographertitle: String,
  photographercontent: String,
  photographerbuttonvalue: String,
  belowtitle: String,
  belowuserbuttonvalue: String,
  belowphotographerbuttonvalue: String,
  signaturecollectiontitle: String,
  signaturecollectionsubtitle: String,
  edit: Number
});

explorecmsSchema.plugin(mongoosastic);
module.exports = mongoose.model('explorecms', explorecmsSchema);
_.extend(module.exports, model);
