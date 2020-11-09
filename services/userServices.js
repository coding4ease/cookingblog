const mongoose = require("mongoose");
const Services = require("../services/Service");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const saltRounds = 10;

class UserServices extends Services {
  constructor(model) {
    super(model);
  }

  async register(data, callback) {
    try {
      let email = data.email;
      if (this.model.userEmailExists()) {
        return callback({ message: "User email already exists", status: 403 });
      }
      this.model
        .findOne({ user_name: data.user_name })
        .then((user) => {
          if (user) {
            return callback({
              message: "User name already exists",
              status: 403,
            });
          } else {
            bcrypt.hash(data.password, saltRounds, (err, hash) => {
              this.create(this, {
                first_name: data.first_name,
                family_name: data.family_name,
                address: data.address,
                phone: data.phone,
                user_name: data.user_name,
                password: hash,
              })
                .then((user) => {
                  let result_user = {
                    first_name: user.first_name,
                    family_name: user.family_name,
                  };
                  return callback(null, user);
                })
                .catch((err) => {
                  return callback({
                    message: "User creation failed",
                    data: err,
                    status: 500,
                  });
                });
            });
          }
        })
        .catch((err) => {
          return callback({
            message: "Internal Server Error",
            data: err,
            status: 500,
          });
        });
    } catch (err) {
      return callback({
        message: "Internal Server Error",
        data: err,
        status: 500,
      });
    }
  }
}

module.exports = UserServices;
