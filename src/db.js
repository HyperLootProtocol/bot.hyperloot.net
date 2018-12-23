const lodashGet = require('lodash/get');
const merge = require('lodash/merge');
const isEmpty = require('lodash/isEmpty');
const cloneDeep = require('lodash/cloneDeep');
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
async function update(collection, selector, query) {
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
    return update(collection, selector, {
        $set: query,
    });
}

// async function inc(collection, selector, query) {
//     return update(collection, selector, {
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

async function getModuleData(moduleName, { user } = {}) {
    if (!user) {
        const res = await get('global', { moduleName });
        return res || {};
    }

    return lodashGet(user, `data.${moduleName}`, {});
}

async function updateModuleData(moduleName, query, { user } = {}) {
    // TODO PLEASE STOP PLEASE REWORK IT PLEASE!
    const currentData = await getModuleData(moduleName, { user });
    const isCurrentDataEmpty = isEmpty(currentData);
    const actualQuery = merge(currentData, query);
    console.log('updateModuleData', moduleName, currentData, query, actualQuery)

    if (!user) {
        if (isCurrentDataEmpty) { // $setOrInsert???
            return insert('global', {
                moduleName,
                ...actualQuery,
            });
        }

        return set('global', { moduleName }, actualQuery);
    }

    return set('users', {
        discordId: user.discordId,
    }, {
        [`data.${moduleName}`]: actualQuery,
    });
}

module.exports = {
    getUser,
    getModuleData,
    updateModuleData,

    // Unsafe be carefuly!
    get,
    set,
    update,
    insert,
};
