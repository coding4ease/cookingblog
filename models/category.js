const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
  name: { type: String, required: true },
  recipes: [{ type: Schema.Types.ObjectId, required: true }],
  created_date: { type: Date, required: true },
  created_by: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

module.exports = mongoose.model("Category", CategorySchema);
