
const {admin} = require('../../config');

module.exports = async function(response, { db, id, username }) {
    return new Promise((resolve, reject) => {
        db.users.findOne({telegramId: id}, (err, user) => {
            response.isModerator = (user && user.isModerator) || username === admin;
            // TODO: test and probabbly refactor this
            response.skipChain = !response.isModerator;

            resolve(response);
        });
    });
};
