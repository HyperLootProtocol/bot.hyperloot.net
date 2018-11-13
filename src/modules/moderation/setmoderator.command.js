const command = require('../command');
const needUser = require('../needUser');

const setmoderator = async function(response, { input, id, db, i18n }) {
    const {isModerator} = response;

    if (!isModerator) {
        throw(i18n('notmoderator'));
    }

    const [, nickname] = input.split(' ');

    return new Promise((resolve, reject) => {
        db.users.findOne({telegramUsername: nickname}, (err, user) => {
            if (!user) {
                reject(i18n('noUserNickname', {nickname}));
            }

            db.users.update({telegramUsername: nickname}, {
                $set: {
                    isModerator: true,
                }
            });

            response.output = i18n('setModerator', {nickname});
            resolve(response);
        });
    });
};

module.exports = [command('setmoderator'), needUser, setmoderator];
module.exports.moderator = true;
