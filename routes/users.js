var express = require("express");
var router = express.Router();
const user_controller = require("../controllers/userController");

//GET users home page
router.get("/", user_controller.users_list);

//POST request for creating a user.
router.post("/", user_controller.userCreate);

//DELETE request to delete user
router.delete("/:id", function () {});

//PUT request to update a user
router.put("/:id", function () {});

//GET request for one user
router.get("/:id", user_controller.user_detail);

module.exports = router;
