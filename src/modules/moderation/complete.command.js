const command = require('../command');
const needUser = require('../needUser');
const {missions}= require('../missions');

const complete = async function(response, { input, id, db, i18n, telegramClient }) {
    const {isModerator} = response;

    if (!isModerator) {
        throw(i18n('notmoderator'));
    }

    const [, inputCommand, nickname] = input.split(' ');

    const mission = missions.filter(({ command }) => inputCommand === command)[0];

    if (!mission) {
        throw(i18n('noCommand'));
    }

    return new Promise((resolve, reject) => {
        db.users.findOne({telegramUsername: nickname}, (err, completeUser) => {
            if (!completeUser) {
                reject(i18n('noUserNickname', {nickname}));

                return;
            }

            telegramClient.sendMessage(completeUser.telegramId, i18n(mission.complete));

            db.users.update({telegramUsername: nickname}, {
                $set: {
                    balance: completeUser.balance + mission.reward,
                    [`data.${mission.command}`]: {
                        completed: true,
                    },
                }
            });

            response.output = i18n('manualCompleted', {command: mission.command, nickname});
            resolve(response);
        });
    });
};

module.exports = [command('complete'), needUser, complete];
module.exports.moderator = true;
