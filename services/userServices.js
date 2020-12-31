const mongoose = require("mongoose");
const Services = require("../services/Service");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("../middlewares/authenticate");
const e = require("express");
const saltRounds = 10;

class UserServices {
  async register(data, callback) {
    try {
      console.log(data);
      let duplicateUserEmail = await User.model.userEmailExists(data.email);
      if (duplicateUserEmail.length == 1) {
        return callback({
          message: "User email already exists",
          status: 403,
        });
      }
    } catch (error) {
      console.log(error);
      return callback({
        message: "Internal error",
        status: 500,
        error,
      });
    }
    User.model
      .findByUserName(data.user_name)
      .then((user) => {
        if (user) {
          return callback({
            message: "User name already exists",
            status: 403,
          });
        } else {
          console.log(data);
          let newUser = new User.model({
            first_name: data.first_name,
            family_name: data.family_name,
            address: data.address,
            phone: data.phone,
            user_name: data.user_name,
            password: data.password,
            email: data.email,
            permissions: data.permissions,
            recipes_uploaded: data.recipes_uploaded,
          });
          newUser
            .hashPassword(data.password)
            .then((hash) => {
              newUser.password = hash;
              User.create(newUser)
                .then((user) => {
                  console.log(user);
                  delete user.password;
                  return callback(null, { user });
                })
                .catch((error) => {
                  return callback({
                    message: "User creation failed",
                    error,
                    status: 500,
                  });
                });
            })
            .catch((error) => {
              return callback({
                message: "Internal server error",
                error,
                status: 500,
              });
            });
        }
      })
      .catch((error) => {
        return callback({
          message: "Internal Server Error",
          error,
          status: 500,
        });
      });
  }

  async login(data, callback) {
    let { username, password } = data;
    User.findUserForLogin({
      username,
      password,
    })
      .then((user) => {
        if (user) {
          user
            .validPassword(password)
            .then(async (result) => {
              if (result) {
                user = {
                  username: user.user_name,
                  permissions: user.permissions,
                };
                let token = await jwt.generateToken(user);
                return callback(null, { message: "Login Successful", token });
              } else {
                return callback({
                  message: "Password is incorrect",
                  status: 401,
                });
              }
            })
            .catch((error) => {
              return callback({
                message: "Internal Server Error",
                status: 500,
                error,
              });
            });
        } else {
          return callback({
            message: "User not found",
            status: 404,
          });
        }
      })
      .catch((error) => {
        return callback({
          message: "Internal Server Error",
          error,
          status: 500,
        });
      });
  }

  async checkUserPassword(data) {
    let { password, username } = data;
    User.model.findByUserName(username).then((user) => {
      bcrypt.compare(password, user.password, function (err, result) {
        return result;
      });
    });
  }

  async update(id, data, callback) {
    User.update(id, data)
      .then((user) => {
        if (user) {
          return callback(null, user);
        } else {
          return callback({ message: "User not found", status: 404 });
        }
      })
      .catch((error) => {
        callback({ message: "User update failed", status: 500, error });
      });
  }

  async changePassword(data, callback) {
    let { password, username, newPassword } = data;
    console.log(data);
    User.model
      .findByUserName(username)
      .then((user) => {
        console.log(user);
        if (user) {
          if (user.validPassword(password)) {
            user
              .hashPassword(newPassword)
              .then((hash) => {
                user.password = hash;
                user.save(function (err, result) {
                  if (err) {
                    return callback({
                      message: "Password change failed",
                      status: 500,
                    });
                  } else {
                    return callback(null, result);
                  }
                });
              })
              .catch((error) => {
                return callback({
                  message: "Password hashing failed",
                  status: 500,
                  error,
                });
              });
          } else {
            return callback({ message: "Password is incorrect", status: 401 });
          }
        } else {
          return callback({ message: "User not found", status: 404 });
        }
      })
      .catch((error) => {
        return callback({ message: "Internal Error", error, status: 500 });
      });
  }

  async getAllUsers(callback) {
    User.getAll({})
      .then(({ data, total }) => {
        if (!data) {
          return callback({ message: "There are no users", status: 404 });
        }
        let users = data.map((user) => {
          console.log(Object.getOwnPropertyNames(user));
          delete user["permissions"];
          console.log(user);
          return user;
        });
        return callback(null, { users, total });
      })
      .catch((err) => {
        callback({ message: "Internal Error", error });
      });
  }

  async delete(id, callback) {
    User.delete(id)
      .then((deletedDocument) => {
        if (deletedDocument) {
          return callback(null, deletedDocument);
        }
        return callback({ message: "User not found", status: 404 });
      })
      .catch((error) => {
        return callback({ message: "User removal failed", error, status: 500 });
      });
  }
}
module.exports = UserServices;
