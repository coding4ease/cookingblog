const express = require("express");
const router = express.Router();
const recipe_controller = require("../controllers/recipeController");

/// POST ROUTES ///

//GET recipes home page
router.get("/", recipe_controller.recipes_list);

//POST request for creating a post
router.post("/", recipe_controller.recipe_create);

//POST request to delete post
router.delete("/:id", function () {});

//PUT request to update a post
router.put("/:id", function () {});

//GET request for one post
router.get("/:id", recipe_controller.recipe_detail);

module.exports = router;
