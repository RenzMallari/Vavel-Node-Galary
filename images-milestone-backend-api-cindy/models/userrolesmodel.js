const mongoose = require('mongoose');
const mongoosastic = require('mongoosastic');
const _ = require('lodash');
const model = require('../components/model');

mongoose.Promise = global.Promise;

const userRoleSchema = mongoose.Schema({
  rolename: String,
  isactive: { type: Boolean, default: true },
  isdeleted: { type: Boolean, default: false }
});

userRoleSchema.plugin(mongoosastic);
module.exports = mongoose.model('userroles', userRoleSchema);
_.extend(module.exports, model);
