const mongoose = require('mongoose');
const mongoosastic = require('mongoosastic');
const _ = require('lodash');
const model = require('../components/model');
mongoose.Promise = global.Promise;

const teamsSchema = mongoose.Schema({
  title: String,
  subtitle: String,
  content: String,
  contentbelow: String,
  edit: Number
});

teamsSchema.plugin(mongoosastic);
module.exports = mongoose.model('teams', teamsSchema);
_.extend(module.exports, model);
