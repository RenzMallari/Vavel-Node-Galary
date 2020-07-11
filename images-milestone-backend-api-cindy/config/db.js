const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/img', { useMongoClient: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(callback) {
  console.log('open', 'mongodb://localhost:27017/img');
});

