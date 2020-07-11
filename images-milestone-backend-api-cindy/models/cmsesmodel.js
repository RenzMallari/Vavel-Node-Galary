const mongoose = require('mongoose');
const mongoosastic = require('mongoosastic');
const _ = require('lodash');
const model = require('../components/model');
mongoose.Promise = global.Promise;

const cmsSchema = mongoose.Schema({
  pagename: String,
  pagetitle: String,
  pagecontent: String

});

cmsSchema.plugin(mongoosastic);
module.exports = mongoose.model('cmses', cmsSchema);
_.extend(module.exports, model);
