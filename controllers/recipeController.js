const { body, validationResult, check } = require("express-validator");
const validator = require("validator");
const { URL, parse } = require("url");
const Recipe = require("../models/recipe");
const User = require("../models/user");
const Label = require("../models/label");
const { resolve } = require("path");
const { options } = require("../app");
const e = require("express");

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

//Display all recipes
exports.recipes_list = function (req, res, next) {
  Recipe.find()
    .populate("chef likes labels")
    .exec(function (err, list_recipes) {
      if (err) {
        return next(err);
      }
      res.status(200).send(list_recipes);
    });
};

exports.recipe_create = [
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
    .withMessage("Title should be min 2 characters and max 50 characters long")
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

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Inside errors");
      res.status(400).send({ errors: errors.array() });
    } else {
      console.log(req.body.labels);
      Label.find({ name: { $in: req.body.labels } }).exec(async function (
        err,
        existing_labels
      ) {
        const dbLabels = existing_labels.map((elem) => elem.name);
        let labelIds = existing_labels.map((elem) => elem._id);
        let labelsToCreate = req.body.labels.filter(
          (elem) => !dbLabels.includes(elem)
        );
        if (labelsToCreate) {
          labelsToCreate = labelsToCreate.map((label) => ({
            name: label,
            created_date: new Date(),
          }));

          try {
            let result = await Label.insertMany(labelsToCreate, {
              rawResult: true,
            });
            if (result.insertedCount > 0) {
              labelIds = labelIds.concat(Object.values(result.insertedIds));
            }
          } catch (e) {
            console.log("couldnot create few labels" + String(e));
          }
        }
        var recipeinstance = new Recipe({
          title: req.body.title,
          chef: req.body.chef,
          posted_date: new Date(),
          updated_date: new Date(),
          body: req.body.body,
          heading: req.body.heading ? req.body.heading : req.body.title,
          labels: labelIds,
          images: req.body.images,
        });
        console.log(recipeinstance);
        recipeinstance.save(function (err) {
          if (err) {
            console.log(err);
            console.log("Inside save error");
            return next(err);
          }
          res.status(200).json({ recipe: recipeinstance });
        });
      });
    }
  },
];

exports.recipe_detail = function (req, res, next) {
  Recipe.findById(req.params.id)
    .populate("chef likes labels")
    .exec(function (err, recipe_detail) {
      if (err) {
        return next(err);
      }
      res.status(200).send(recipe_detail);
    });
};

exports.recipe_update = [
  (req, res, next) => {
    const requestId = req.params.id;
    next();
  },
  body("title")
    .trim()
    .isLength({ max: 50 })
    .withMessage("Title should be max 50 characters long")
    .withMessage("Non-alphanumeric characters not allowed in title")
    .escape(),
  body("chef")
    .trim()
    .escape()
    .custom((value) => {
      return User.findById(value).then((user) => {
        if (!user) {
          return Promise.reject("Only registered users can upload recipes");
        }
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

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Inside errors");
      res.status(400).send({ errors: errors.array() });
    } else {
      console.log(req.body.labels);
      Label.find({ name: { $in: req.body.labels } }).exec(async function (
        err,
        existing_labels
      ) {
        const dbLabels = existing_labels.map((elem) => elem.name);
        const labelIds = existing_labels.map((elem) => elem._id);
        let labelsToCreate = req.body.labels.filter(
          (elem) => !dbLabels.includes(elem)
        );
        if (labelsToCreate) {
          labelsToCreate = labelsToCreate.map((label) => ({
            name: label,
            created_date: new Date(),
          }));

          try {
            let result = await Label.insertMany(labelsToCreate, {
              rawResult: true,
            });
            console.log(result);
            if (result.insertedCount > 0) {
              labelIds = labelIds.concat(Object.values(result.insertedIds));
            }
          } catch (e) {
            console.log("couldnot create few labels" + String(e));
          }
        }
        Recipe.updateOne(
          { _id: req.params.id },
          {
            $set: {
              title: req.body.title,
              chef: req.body.chef,
              body: req.body.body,
              heading: req.body.heading ? req.body.heading : req.body.title,
              labels: labelIds,
              images: req.body.images,
            },
            $currentDate: { updated_date: true },
          },
          function (err, recipeDetail) {
            if (err) {
              return next(err);
            } else {
              res.status(200).json({ recipe: recipeDetail });
            }
          }
        );
      });
    }
  },
];
