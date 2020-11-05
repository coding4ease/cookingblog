const { body, validationResult, sanitizeBody } = require("express-validator");
const User = require("../models/user");
const Recipe = require("../models/recipe");
const userService = require("../services/userService");

//Display all users
exports.users_list = function (req, res, next) {
  User.find().exec(function (err, list_users) {
    if (err) {
      return next(err);
    }
    res.status(200).json(list_users);
  });
};

exports.userCreate = (req, res) => {
  const body = req.body;
  if (User.findByUsername) {
    throw new Error("User name already exist");
  }
};

exports.user_detail = (req, res, next) => {
  Promise.all({
    user: User.findById(req.params.id),
    recipes: Recipe.find({ chef: req.params.id }),
  })
    .then((result) => {
      if (result.user) {
        result.recipes.length > 0
          ? res.status(200).send(result)
          : res.status(200).send({ user: result.user });
      } else {
        res.status(404).send({ message: "User not found" });
      }
    })
    .catch((err) => {
      next(err);
    });
};
