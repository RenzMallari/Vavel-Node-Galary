const eventBus = require('../components/eventBus');
const mongoose = require('mongoose');
const User = require('../models').user;

const ObjectId = mongoose.Types.ObjectId;

eventBus.onSeries('userUpdate', function(obj) {
  User.esUpdateOne({ _id: ObjectId(obj.userData._id) }, obj.data, () => {
    obj.callback && obj.callback(JSON.stringify(obj.data));
  });
});
