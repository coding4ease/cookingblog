const mongoose = require("mongoose");

module.exports = class DatabaseServices {
  constructor(model) {
    this.model = model;
    this.create = this.create.bind(this);
    this.get = this.get.bind(this);
    this.getAll = this.getAll.bind(this);
    this.delete = this.delete.bind(this);
    this.update = this.update.bind(this);
  }

  queryExecute(query) {
    return new Promise(async (resolve, reject) => {
      query.then((result) => resolve(result)).catch(reject);
    });
  }

  execute(query) {
    return new Promise(async (resolve, reject) => {
      try {
        let result = await this.model.find(query);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  }

  findById(id) {
    return new Promise(async (resolve, reject) => {
      try {
        let document = await this.model.findById(id);
        resolve(document);
      } catch (err) {
        reject(err);
      }
    });
  }

  getAll(query) {
    return new Promise(async (resolve, reject) => {
      let { skip, limit } = query;

      skip = skip ? Number(skip) : 0;
      limit = limit ? Number(limit) : 0;

      delete query.limit;
      delete query.skip;

      if (query._id) {
        try {
          query._id = new mongoose.mongo.ObjectId(query._id);
        } catch (err) {
          console.log(
            "not able to generate mongoose id with content",
            query._id
          );
        }
      }
      try {
        let items = await this.model.find(query).skip(skip).limit(limit);
        let total = await this.model.countDocuments();
        resolve({ data: items, total: total });
      } catch (err) {
        reject(err);
      }
    });
  }

  create(data) {
    return new Promise((resolve, reject) => {
      this.model.create(data, function (err, createdDocument) {
        if (err) reject(err);
        else resolve(createdDocument);
      });
    });
  }

  update(id, data) {
    return new Promise(async (resolve, reject) => {
      try {
        let updatedDocument = await this.model.findByIdAndUpdate(id, data, {
          new: true,
          runValidators: true,
        });
        resolve(updatedDocument);
      } catch (err) {
        reject(err);
      }
    });
  }

  get(id) {
    return new Promise(async (resolve, reject) => {
      try {
        let document = await this.model.findById(id);
        resolve(document);
      } catch (err) {
        reject(err);
      }
    });
  }

  delete(id) {
    return new Promise(async (resolve, reject) => {
      try {
        let deletedDocument = await this.model.findByIdAndDelete(id);
        resolve(deletedDocument);
      } catch (err) {
        reject(err);
      }
    });
  }
};
