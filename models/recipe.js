const mongoose = require("mongoose");
require("mongoose-type-url");
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true },
  date: { type: Date, required: true },
});

const RecipeSchema = new Schema({
  title: { type: String, required: true, maxlength: 50 },
  chef: { type: Schema.Types.ObjectId, ref: "User", required: true },
  posted_date: { type: Date, required: true },
  updated_date: { type: Date },
  body: { type: String, required: true, minlength: 10 },
  heading: { type: String, required: true },
  comments: [{ type: CommentSchema, default: [] }],
  likes: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
  labels: [{ type: Schema.Types.ObjectId, ref: "Label", default: [] }],
  images: [{ type: String, default: null }],
});

//Virtual for recipe's  URL
RecipeSchema.virtual("url").get(function () {
  return "/post/" + this._id;
});

//Export model
module.exports = mongoose.model("Recipe", RecipeSchema);
