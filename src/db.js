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


module.exports = {
    db,
};
