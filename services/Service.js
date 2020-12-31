const mongoose = require("mongoose");

module.exports = class Services {
  constructor(model) {
    this.model = model;
    this.create = this.create.bind(this);
    this.get = this.get.bind(this);
    this.getAll = this.getAll.bind(this);
    this.delete = this.delete.bind(this);
    this.update = this.update.bind(this);
  }

  async getAll(query, callback) {
    let { skip, limit } = query;

    skip = skip ? Number(skip) : 0;
    limit = limit ? Number(limit) : 0;

    delete query.limit;
    delete query.skip;

    if (query._id) {
      try {
        query._id = new mongoose.mongo.ObjectId(query._id);
      } catch (err) {
        console.log("not able to generate mongoose id with content", query._id);
      }
    }
    try {
      let items = await this.model.find(query).skip(skip).limit(limit);
      let total = await this.model.count();

      return callback(null, { data: items, total: total });
    } catch (err) {
      return callback({ err, status: 500 });
    }
  }

  create(data) {
    return new Promise((resolve, reject) => {
      this.model.create(data, function (err, createdDocument) {
        if (err) reject({ err, status: 500 });
        else resolve(createdDocument);
      });
    });
  }

  async update(id, data, callback) {
    try {
      let updatedDocument = await this.model.findByIdAndUpdate(id, data, {
        new: true,
      });
      return callback(null, updatedDocument);
    } catch (err) {
      return callback({ err, status: 500 });
    }
  }

  async get(id, callback) {
    try {
      let document = await this.model.findById(id);
      if (!document) {
        return callback({ message: "User Id not found", status: 404 });
      } else {
        return callback(null, document);
      }
    } catch (err) {
      return callback({ err, status: 500 });
    }
  }

  async delete(id, callback) {
    try {
      let deletedDocument = await this.model.findByIdAndDelete(id);
      if (!deletedDocument) {
        return callback({ message: "User Id not found", status: 404 });
      } else {
        return callback(null, deletedDocument);
      }
    } catch (err) {
      return callback({ err, status: 500 });
    }
  }
};
