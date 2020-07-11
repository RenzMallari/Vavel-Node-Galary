const mongoose = require('mongoose');
const mongoosastic = require('mongoosastic');
const _ = require('lodash');
const model = require('../components/model');
mongoose.Promise = global.Promise;

const commentSchema = mongoose.Schema({
  userid: String,
  username: String,
  userimage: String,
  comment: String,
  commentdate: { type: Date, default: Date.now }
});

const tagSchema = mongoose.Schema({
  tag: String
});

const usergallerySchema = mongoose.Schema({
  userid: String,
  imagepublicid: String,
  imagewidth: String,
  imageheight: String,
  currency: { type: String, default: 'USD' },
  createdate: { type: Date, default: Date.now },
  comments: [commentSchema],
  caption: String,
  tags: [tagSchema],
  editoriallicense: { type: String, default: '' },
  commerciallicense: { type: String, default: '' },
  albumaddress: { type: String, default: '' },
  adminpercentage: { type: String, default: 0 },
  sellonetime: {
    type: Boolean,
    default: false
  },
  soldout: {
    type: Boolean,
    default: false
  }
});

usergallerySchema.set('redisCache', true);
usergallerySchema.set('expires', 120);

usergallerySchema.plugin(mongoosastic);
module.exports = mongoose.model('usergalleries', usergallerySchema);
_.extend(module.exports, model);
