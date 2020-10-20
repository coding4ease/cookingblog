const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LabelSchema = new Schema({
  name: { type: String, required: true, unique: true },
  created_date: { type: Date, required: true },
});

module.exports = mongoose.model("Label", LabelSchema);
