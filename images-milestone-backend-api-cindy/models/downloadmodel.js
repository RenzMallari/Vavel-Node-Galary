const mongoose = require('mongoose');
const mongoosastic = require('mongoosastic');
const _ = require('lodash');
const model = require('../components/model');
mongoose.Promise = global.Promise;

const downloadSchema = mongoose.Schema({
  seller_id: String,
  seller_name: String,
  gallery_id: String,
  image_id: String,
  image_publicid: String,
  buyer_id: String,
  type: String,
  imagewidth: String,
  imageheight: String,
  imagedpi: String,
  downloadlink: String,
  startdate: { type: Date, default: Date.now },
  status: Number,
  downloadtype: { type: String, default: 'cart', lowercase: true }
});

downloadSchema.plugin(mongoosastic);
module.exports = mongoose.model('download', downloadSchema);
_.extend(module.exports, model);
