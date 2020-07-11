const mongoose = require("mongoose");
const mongoosastic = require("mongoosastic");
const _ = require("lodash");
const model = require("../components/model");
mongoose.Promise = global.Promise;

const saleSchema = mongoose.Schema({
  userid: String,
  payerid: String,
  type: String,
  totalamount: String,
  currency: String,
  adminpercentage: String,
  totalearnings: String,
  paymentid: String,
  paykey: String,
  transactionid: String,
  transactionstatus: String,
  ack: String,
  corelationid: String,
  message: String,
  paydate: { type: Date, default: Date.now }
});

saleSchema.set("redisCache", true);
saleSchema.set("expires", 120);

saleSchema.plugin(mongoosastic);
module.exports = mongoose.model("sales", saleSchema);
_.extend(module.exports, model);
