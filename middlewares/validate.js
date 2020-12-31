const { body } = require("express-validator");

exports.validate = (method) => {
  switch (method) {
    case "createUser": {
      return [
        body("first_name")
          .trim()
          .isLength({ min: 2, max: 50 })
          .withMessage(
            "First name should be min 2 characters and max 50 characters long"
          ),
        body("family_name")
          .trim()
          .optional()
          .isLength({ max: 50 })
          .withMessage("Family name should be maximum 50 characters long"),
        body("email").trim().isEmail().withMessage("Email is not valid"),
        body("password").trim().isString().withMessage("Password is required"),
        body("address")
          .trim()
          .isLength({ max: 100 })
          .withMessage("Address should be less than 100 characters long"),
        body("phone", "Phone no is required")
          .trim()
          .isNumeric()
          .withMessage("Phone no is not valid"),
        body("user_name")
          .trim()
          .isAlphanumeric()
          .withMessage("user name is mandatory and should be alphanumeric"),
      ];
    }
  }
};
