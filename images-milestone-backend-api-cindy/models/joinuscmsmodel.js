const mongoose = require('mongoose');
const mongoosastic = require('mongoosastic');
const _ = require('lodash');
const model = require('../components/model');
mongoose.Promise = global.Promise;

const joinuscmsSchema = mongoose.Schema({
  joinmodaltitle: String,
  usertitle: String,
  usercontent: String,
  userbuttonvalue: String,
  photographertitle: String,
  photographercontent: String,
  photographerbuttonvalue: String,
  title: String,
  subtitle: String,
  formbelowcontent: String,
  rightimage: String,
  righttitle: String,
  rightcontent: String,
  edit: Number
});

joinuscmsSchema.plugin(mongoosastic);
module.exports = mongoose.model('joinuscms', joinuscmsSchema);
_.extend(module.exports, model);
