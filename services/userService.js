const User = require("../models/user");

module.exports = class User {
  async create(data, callback) {
    try {
      let user = await User.create({ data });
      return callback(null, user);
    } catch (err) {
      return callback(err);
    }
  }
  async update(data, callback) {}
};
