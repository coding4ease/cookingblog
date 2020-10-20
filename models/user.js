const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const moment = require("moment");

const permissions = [
  "add_recipe",
  "edit_recipe",
  "delete_recipe",
  "assign_category",
  "assign_label",
  "delete_label",
  "delete_category",
  "all",
];
const UserSchema = new Schema({
  first_name: { type: String, required: true, minLength: 2, maxlength: 50 },
  family_name: { type: String, maxlength: 50 },
  email: { type: String, required: true },
  address: { type: String, maxlength: 100 },
  phone: { type: Number, required: true },
  user_name: { type: String, required: true },
  permissions: [
    { type: String, required: true, enum: permissions, default: "all" },
  ],
  recipes_uploaded: { type: Schema.Types.ObjectId, ref: "Recipe" },
  created_at: { type: Date, required: true },
});

UserSchema.virtual("url").get(function () {
  return "/user/" + this._id;
});

module.exports = mongoose.model("User", UserSchema);
