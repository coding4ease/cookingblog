const { body, check, validationResult } = require("express-validator");
const validator = require("validator");
const Recipe = require("../models/recipe");
const User = require("../models/user");
const Label = require("../models/label");
const { resolve } = require("path");
const { options } = require("../app");
const e = require("express");
const {
  recipeValidationRules,
  validate,
} = require("./validators/recipe_validator");

//Validation for recipe

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
  recipeValidationRules(),
  validate,

  (req, res, next) => {
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
  check("params")
    .isMongoId()
    .custom(async (id, { req }) => {
      try {
        let recipe = await (await Recipe.findById(id)).populated("label");
        console.log(recipe);
        if (!recipe) {
          res.status(400).json({ message: "Recipe not found" });
          return;
        }
        let keys = Object.keys(req.body);
        for (let key of keys) {
          recipe[key] = req.body[key];
        }
        req.body = recipe;
        console.log(recipe);
      } catch (err) {
        return next(err);
      }
    }),

  recipeValidationRules(),
  validate,

  (req, res, next) => {
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
  },
];
