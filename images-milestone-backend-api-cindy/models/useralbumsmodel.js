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
  commentdate: {
    type: Date,
    default: Date.now
  }
});
const keywordSchema = mongoose.Schema({
  tag: {
    type: String,
    es_type: 'keyword'
  }
});
const tagSchema = mongoose.Schema({
  tag: String,
  adddate: {
    type: Date,
    default: Date.now
  }
});
const imageSchema = mongoose.Schema({
  publicid: String,
  fileExtension: String,
  userid: String,
  adddate: {
    type: Date,
    default: Date.now
  },
  caption: String,
  imagewidth: String,
  imageheight: String,
  comments: [commentSchema],
  tags: [keywordSchema],
  adminpercentage: {
    type: String,
    default: 0
  },
  price: mongoose.Schema.Types.Mixed,
  isthumbnail: {
    type: Boolean,
    default: false
  },
  sellonetime: {
    type: Boolean,
    default: false
  },
  soldout: {
    type: Boolean,
    default: false
  }
});

imageSchema.set('redisCache', true);
imageSchema.set('expires', 120);

const albumSchema = mongoose.Schema({
  userid: String,
  name: String,
  price: Number,
  currency: {
    es_type: 'text',
    type: String,
    default: 'USD'
  },
  photosetid: String,
  adminpercentage: {
    type: Number,
    default: 0,
    es_type: 'integer'
  },
  createdate: {
    type: Date,
    default: Date.now
  },
  date: String,
  thumbnail: {
    type: imageSchema
  },
  images: {
    type: [imageSchema],
    es_type: 'nested'
  },
  tags: {
    type: [tagSchema],
    es_type: 'nested'
  },
  editoriallicense: {
    type: String,
    default: ''
  },
  commerciallicense: {
    type: String,
    default: ''
  },
  albumaddress: {
    type: String,
    default: ''
  },
  albumcountry: {
    type: String,
    default: ''
  },
  albumcity: {
    type: String,
    default: ''
  },
  lat: {
    type: Number,
    default: null,
    es_type: 'double'
  },
  lng: {
    type: Number,
    default: null,
    es_type: 'double'
  }
});

albumSchema.set('redisCache', true);
albumSchema.set('expires', 120);

albumSchema.plugin(mongoosastic);
module.exports = mongoose.model('useralbums', albumSchema);
_.extend(module.exports, model);
