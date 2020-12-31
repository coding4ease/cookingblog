var express = require("express");
var router = express.Router();
const userController = require("../controllers/userController");
const rules = require("../middlewares/validate");
const jwt = require("../middlewares/authenticate");

//GET users home page
router.get("/", userController.getUsers);

//POST request for creating a user.
router.post("/", rules.validate("createUser"), userController.createUser);

//POST request for user login
router.post("/login", userController.login);

//DELETE request to delete user
router.delete("/:id", jwt.authenticateToken, userController.deleteUser);

//PUT request to update a user
router.put("/:id", userController.updateUser);

//PUT request to change the password for a user
router.put(
  "/:id/change-password",
  jwt.authenticateToken,
  userController.changePassword
);

//GET request for one user
router.get("/:id", userController.user_detail);

module.exports = router;
