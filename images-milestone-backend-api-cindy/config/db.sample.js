var mongoose = require('mongoose');
//mongoose.connect('mongodb://104.237.135.59/img');

mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost/img', { useMongoClient: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(callback) {
    console.log("open", process.env.MONGO_URL || 'mongodb://localhost/img');
});
