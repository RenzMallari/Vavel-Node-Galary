const mongoose = require('mongoose');
const mongoosastic = require('mongoosastic');
const _ = require('lodash');
const model = require('../components/model');

mongoose.Promise = global.Promise;

const teammembersSchema = mongoose.Schema({
  image: String,
  name: String,
  designation: String
});

teammembersSchema.plugin(mongoosastic);
module.exports = mongoose.model('teammembers', teammembersSchema);
_.extend(module.exports, model);
