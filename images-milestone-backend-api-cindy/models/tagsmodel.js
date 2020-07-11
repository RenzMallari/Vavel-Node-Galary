const mongoose = require('mongoose');
const mongoosastic = require('mongoosastic');
const _ = require('lodash');
const model = require('../components/model');
mongoose.Promise = global.Promise;

const tagSchema = mongoose.Schema({
  galleryid: String,
  imageid: String,
  keyword: String,
  height: String,
  width: String,
  logo: String,
  fileExtension: String,
  date: Number,
  created_at: { type: Number, default: Date.now },
  showinexplore: { type: Boolean, default: false },
  isofficial: { type: Boolean, default: false }
});

tagSchema.plugin(mongoosastic);
const Tag = mongoose.model('tags', tagSchema);
// Tag.createMapping({
//   'settings': {
//     'index': {
//       'analysis': {
//         'filter': {
//           'asciifolding_filter': {
//             'type': 'asciifolding',
//             'preserve_original': true
//           }
//         },
//         'analyzer': {
//           'asciifolding_analyzer': {
//             'tokenizer': 'standard',
//             'filter': ['lowercase', 'asciifolding_filter']
//           }
//         }
//       }
//     }
//   },
//   'mappings': {
//     '_default_': {
//       '_all': {
//         'enabled': false
//       },
//       'properties': {
//         'keyword': {
//           'type': 'string',
//           'analyzer': 'asciifolding_analyzer'
//         }
//       }
//     }
//   }
// }, (err) => {
//   err && console.log('Tags model', err);
// });

module.exports = Tag;

_.extend(module.exports, model);
