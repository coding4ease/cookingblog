const jwt = require("jsonwebtoken");

module.exports.generateToken = (payload) => {
  console.log(payload);
  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1d" },
      function (err, token) {
        if (err) {
          reject({ message: "Token Generation failed" });
        } else {
          console.log(token);
          resolve(token);
        }
      }
    );
  });
};

module.exports.authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token == null)
      return res.status(401).send({ message: "Authentication token missing" });
    let user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = user;
    next();
  } catch (error) {
    res.status(401).send({ message: "Invalid authentication token" });
  }
};
