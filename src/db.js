const lodashGet = require('lodash/get');
const extend = require('lodash/extend');
const mongo = require('mongojs');

const { mongoURI } = require('./config');

const USERS = 'users';
const MODERATION = 'moderation';

const db = mongo(mongoURI, [USERS, MODERATION]);

db.on('error', (err) => {
    console.log('database error', err);
});

db.on('connect', () => {
    console.log('database connected');
});

// Basic operations
async function _update(collection, selector, query) {
    return new Promise((resolve, reject) => {
        db[collection].update(selector, query, (err, result) => {
            if (err) {
                reject(err);
            }

            resolve(result);
        });
    });
}

async function get(collection, selector) {
    return new Promise((resolve, reject) => {
        db[collection].findOne(selector, (err, result) => {
            if (err) {
                reject(err);
            }

            resolve(result);
        });
    });
}

async function set(collection, selector, query) {
    return _update(collection, selector, {
        $set: query,
    });
}

// async function inc(collection, selector, query) {
//     return _update(collection, selector, {
//         $inc: query,
//     });
// }

async function insert(collection, query) {
    return db[collection].insert(query);
}

// high lvl methods
async function getUser(userId) {
    let user = await get('users', { discordId: userId });

    if (!user) {
        user = { discordId: userId };

        insert('users', user);
    }

    return user;
}

async function getModuleData(moduleName, { user }) {
    return lodashGet(user, `data.${moduleName}`, {});
}

async function setModuleData(moduleName, { user }, query) {
    // todo remove get
    const currentData = await getModuleData(moduleName, { user });
    const actualQuery = extend(currentData, query);

    return set('users', {
        discordId: user.discordId,
    }, {
        [`data.${moduleName}`]: actualQuery,
    });
}

module.exports = {
    getUser,
    getModuleData,
    setModuleData,

    // Unsafe be carefuly!
    get,
    set,
    insert,
};
