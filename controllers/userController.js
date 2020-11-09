const { body, validationResult, sanitizeBody } = require("express-validator");
const User = require("../models/user");
const Recipe = require("../models/recipe");
const Service = require("../services/userServices");
const userServices = new Service(User);

//Display all users
module.exports.users_list = function (req, res, next) {
  User.find().exec(function (err, list_users) {
    if (err) {
      return next(err);
    }
    res.status(200).json(list_users);
  });
};

module.exports.userCreate = (req, res) => {
  try {
    let response = {};
    console.log(req.body);
    userServices.register(req.body, function (err, result) {
      if (err) {
        response.data = err.data;
        response.success = false;
        res.status(err.status).send(response);
      } else {
        response.data = result;
        response.success = true;
        res.status(200).send(response);
      }
    });
  } catch (err) {
    res.status(500).send("Some error occured");
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
