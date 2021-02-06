const mongoose = require("mongoose");
const config = require("config");

const db = config.get("MONGODBURI");

const ConnectDB = async () => {
  try {
    await mongoose.connect(db, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });
    console.log("Connecting to DB ...");
  } catch (err) {
    console.error("Error in connecting db :", err.message);
  }
};

module.exports = ConnectDB;
