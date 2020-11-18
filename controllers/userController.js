const { checkBody, validationResult } = require("express-validator");
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

module.exports.createUser = (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }
    let response = {};
    userServices.register(req.body, function (err, result) {
      if (err) {
        response.data = err.error;
        response.message = err.message;
        response.success = false;
        res.status(err.status).send(response);
      } else {
        response.data = result;
        response.success = true;
        res.status(201).send(response);
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports.login = (req, res, next) => {
  try {
    let response = {};
    userServices.login(
      { username: req.body.user_name, password: req.body.password },
      function (err, result) {
        if (err) {
          response.succes = false;
          response.data = err.error;
          response.message = err.message;
          res.status(err.status).send(response);
        } else {
          response.success = true;
          response.data = result;
          res.status(200).send(response);
        }
      }
    );
  } catch (err) {
    next(err);
  }
};

exports.updateUser = (req, res, next) => {
  try {
    let response = {};
    req.check;
    userServices.update(req.id);
  } catch (err) {
    next(err);
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
