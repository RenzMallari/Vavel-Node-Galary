const mongoose = require('mongoose');
const mongoosastic = require('mongoosastic');
const _ = require('lodash');
const model = require('../components/model');
mongoose.Promise = global.Promise;

const contactusSchema = mongoose.Schema({
  email: String,
  subject: String,
  descriptions: String,
  senddate: { type: Date, default: Date.now },
  isreply: { type: Boolean, default: false },
  attachments: String
});

contactusSchema.plugin(mongoosastic);
module.exports = mongoose.model('contactus', contactusSchema);
_.extend(module.exports, model);
