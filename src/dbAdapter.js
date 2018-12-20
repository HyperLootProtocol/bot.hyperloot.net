const { db } = require('./db');

class DbAdapter {
    constructor(collection) {
        this.collection = db[collection];
    }

    async _update(selector, query) {
        return new Promise((resolve, reject) => {
            this.collection.update(selector, query, (err, result) => {
                if (err) {
                    reject(err);
                }
                resolve(result);
            });
        });
    }

    async get(selector) {
        return new Promise((resolve, reject) => {
            this.collection.findOne(selector, (err, result) => {
                if (err) {
                    reject(err);
                }
                resolve(result);
            });
        });
    }

    async set(selector, query) {
        return this._update(selector, {
            $set: query,
        });
    }

    async inc(selector, query) {
        return this._update(selector, {
            $inc: query,
        });
    }

    async insert(query) {
        return this.collection.insert(query);
    }
}

module.exports = DbAdapter;
