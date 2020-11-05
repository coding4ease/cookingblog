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
const UserSchema = new Schema(
  {
    first_name: {
      type: String,
      required: [true, "First name should be provided"],
      minLength: [2, "Too small first name"],
      maxlength: 50,
    },
    family_name: { type: String, maxlength: 50 },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    address: { type: String, maxlength: 100 },
    phone: { type: Number, required: [true, "Phone no is mandatory"] },
    user_name: { type: String, required: [true, "Enter a user name"] },
    permissions: [
      { type: String, required: true, enum: permissions, default: "all" },
    ],
    recipes_uploaded: { type: Schema.Types.ObjectId, ref: "Recipe" },
  },
  { timestamps: true }
);

UserSchema.virtual("url").get(function () {
  return "/user/" + this._id;
});

UserSchema.statics.findByUsername = function (name) {
  return this.find({ user_name: name });
};

module.exports = mongoose.model("User", UserSchema);
