const { body, validationResult } = require("express-validator");
const User = require("../../models/user");
const { URL, parse } = require("url");

//function to check if valid url
function checkValidURL(string) {
  try {
    let protocols = ["https"];
    new URL(string);
    const parsed = parse(string);
    return protocols
      ? parsed.protocol
        ? protocols.map((x) => `${x.toLowerCase()}:`).includes(parsed.protocol)
        : false
      : true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

//recipe validation
const recipeValidationRules = (req, res) => {
  return [
    (req, res, next) => {
      if (!(req.body.labels instanceof Array)) {
        if (typeof req.body.labels === "undefined") req.body.labels = [];
        else req.body.labels = new Array(req.body.labels);
      }
      if (!(req.body.images instanceof Array)) {
        if (typeof req.body.images === "undefined") req.body.images = [];
        else req.body.images = new Array(req.body.images);
      }
      next();
    },
    body("title")
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage(
        "Title should be min 2 characters and max 50 characters long"
      )
      .escape(),
    body("chef")
      .trim()
      .escape()
      .custom((value) => {
        return User.findById(value)
          .then((user) => {
            if (!user) {
              return Promise.reject("Only registered users can upload recipes");
            }
          })
          .catch((err) => {
            throw new Error("Id is not proper");
          });
      }),
    body("body")
      .trim()
      .isLength({ min: 10 })
      .withMessage("Recipe should be atleast 10 characters long")
      .escape(),
    body("heading").trim().optional({ checkFalsy: true }).escape(),
    body("images")
      .isArray()
      .custom((array, { req }) => {
        console.log(array);
        console.log(array.every(checkValidURL));
        if (!array.every(checkValidURL)) {
          throw new Error("Image url is not valid");
        }
        console.log(req.body.images);
        return true;
      }),
    body("images.*").trim(),
    body("labels.*", "Invalid Label").trim().isLength({ min: 1 }).escape(),
  ];
};

//validateResult
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  console.log("Inside errors");
  res.status(400).send({ errors: errors.array() });
};

module.exports = {
  recipeValidationRules,
  validate,
};
