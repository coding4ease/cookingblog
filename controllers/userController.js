const { body, validationResult, sanitizeBody } = require("express-validator");
const User = require("../models/user");
const Recipe = require("../models/recipe");

//Display all users
exports.users_list = function (req, res, next) {
  User.find().exec(function (err, list_users) {
    if (err) {
      return next(err);
    }
    res.status(200).json(list_users);
  });
};

exports.user_create = [
  body("first_name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage(
      "First name is mandatory and should be between 2 and 50 characters long"
    )
    .isAlphanumeric()
    .withMessage("First name has non-alpha numeric characters"),
  body("family_name")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage("Family name should have less than 50 characters")
    .isAlphanumeric()
    .withMessage("Family name has non-alpha numeric characters"),
  body("email")
    .trim()
    .isEmail()
    .withMessage("Invalid Email")
    .normalizeEmail()
    .escape()
    .custom((email) => {
      return User.findOne({ email: email }).then((user) => {
        if (user) {
          console.log(user);
          return Promise.reject("User email is already present");
        }
      });
    }),
  body("address")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage("Address shouln't exceed 100 characters"),
  body("phone").trim().isMobilePhone().withMessage("Phone no is not valid"),
  body("user_name")
    .trim()
    .escape()
    .custom((value) => {
      return User.findOne({ user_name: value }).then((user) => {
        if (user) {
          console.log(user);
          return Promise.reject("Username is already taken");
        }
      });
    }),

  sanitizeBody("first_name").trim().escape(),
  sanitizeBody("family_name").trim().escape(),
  sanitizeBody("email").trim().escape(),
  sanitizeBody("address").escape(),
  sanitizeBody("phone").trim().escape(),
  sanitizeBody("user_name").trim().escape(),

  (req, res, next) => {
    console.log("Inside req");
    const errors = validationResult(req);
    let userinstance = User({
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      email: req.body.email,
      address: req.body.address,
      phone: req.body.phone,
      user_name: req.body.user_name,
      permissions: ["all"],
      created_at: new Date(),
    });

    if (!errors.isEmpty()) {
      res.status(400).send({ errors: errors.array() });
    } else {
      userinstance.save(function (err) {
        if (err) {
          return next(err);
        }
        res.status(200).send({ message: "user created" });
      });
    }
  },
];

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
