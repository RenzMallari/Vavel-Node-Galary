const mongoose = require('mongoose');
const mongoosastic = require('mongoosastic');
const _ = require('lodash');
const model = require('../components/model');
mongoose.Promise = global.Promise;

const cartSchema = mongoose.Schema({
  seller_id: String,
  seller_name: String,
  gallery_id: String,
  image_id: String,
  image_extension: String,
  price: String,
  currency: { type: String, default: 'USD' },
  symbol: { type: String, default: '$' },
  buyer_id: String,
  type: String,
  imagewidth: String,
  imageheight: String,
  imagedpi: String,
  downloadlink: String,
  startdate: { type: Date, default: Date.now },
  status: Number,
  image_publicid: String,
  sellonetime: {
    type: Boolean,
    default: false
  },
  soldout: {
    type: Boolean,
    default: false
  }
});

cartSchema.plugin(mongoosastic);
module.exports = mongoose.model('cart', cartSchema);
_.extend(module.exports, model);
