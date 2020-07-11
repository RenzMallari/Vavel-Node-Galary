const Promise = require("bluebird");
const models = require("../models");

const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/img", { useMongoClient: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function() {
  console.log("Mongo connected...");

  reindex();
});

function reindex() {
  const queue = [];

  for (const name in models) queue.push(models[name]);

  console.log(`Reindex ${queue.length} models`);

  Promise.each(queue, function(model) {
    return new Promise(function(resolve, reject) {
      model.createMapping(err => {
        if (err) return reject(err);

        const stream = model.synchronize();
        const name = model.collection.collectionName;
        let count = 0;

        stream.on("data", () => {
          count++;
        });

        stream.on("close", () => {
          console.log(`${count} documents indexed from model ${name}`);
          resolve();
        });

        stream.on("error", err => {
          console.log(`error with ${name} model: ${err}`);
          reject(err);
        });
      });
    });
  })
    .then(() => {
      console.log("All collections have been indexed");
      process.exit();
    })
    .catch(error => {
      console.log("-----------------------------error");
      console.log(error);
    });
}
