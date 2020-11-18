const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const moment = require("moment");
const bcrypt = require("bcrypt");
const DatabaseServices = require("../models/databaseOps");

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
      minlength: [2, "Too small first name"],
      maxlength: 50,
    },
    family_name: { type: String, maxlength: 50 },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    password: { type: String },
    address: { type: String, maxlength: 100 },
    phone: { type: String, required: [true, "Phone no is mandatory"] },
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

UserSchema.methods.hashPassword = function (password) {
  return bcrypt.hash(password, 10);
};

UserSchema.method("validPassword", function (password) {
  return bcrypt.compare(password, this.password);
});

UserSchema.statics.findByUserName = function (name) {
  return this.findOne({ user_name: name });
};

UserSchema.static("userEmailExists", function (email) {
  return this.find({ email: email });
});

const User = mongoose.model("User", UserSchema);

class UserDB extends DatabaseServices {
  constructor(model) {
    super(model);
  }

  findByEmail(email) {
    return new Promise(async (resolve, reject) => {
      try {
        let documents = await this.model.find({ email: email });
        resolve(documents);
      } catch (err) {
        reject(err);
      }
    });
  }

  findUserForLogin(data) {
    return new Promise(async (resolve, reject) => {
      try {
        let user = await this.model.findOne({
          $or: [{ user_name: data.username }, { phone: data.phone }],
        });
        resolve(user);
      } catch (err) {
        reject(err);
      }
    });
  }
}

module.exports = new UserDB(User);
