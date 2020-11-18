const mongoose = require("mongoose");

//Set up mongoose connection
const connectDB = async () => {
  const mongoDB = process.env.DB_CONNECTION;
  mongoose.connect(mongoDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const db = mongoose.connection;
  db.on("connected", function () {
    console.log("Successfully connected to db");
  });
  db.on("error", function () {
    console.error.bind(console, "MongoDB connection error:");
    process.exit(1);
  });
  db.on("close", function () {
    console.error.bind(console, "MongoDB service closed");
    process.exit();
  });
  db.on("disconnected", function () {
    console.error.bind(console, "MongoDB is not connected");
    process.exit(1);
  });
};

module.exports = connectDB;
