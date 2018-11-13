const command = require('../command');
const needUser = require('../needUser');

const get = async function(response, { input, id, db, i18n }) {
    const {isModerator} = response;

    if (!isModerator) {
        throw(i18n('notmoderator'));
    }

    return new Promise((resolve, reject) => {
        db.moderation.findOne({}, (err, task) => {
            if (!task) {
                reject(i18n('noTasks'));

                return;
            }

            const {username, command, answer} = task;

            db.moderation.remove({_id: task._id});
            db.users.update({telegramId: id}, {
                $set: {
                    pendingModeration: task,
                }
            });

            response.output = `mission: ${command}\nuser: @${username}\nanswer: ${answer}`;
            resolve(response);
        });
    });
};

module.exports = [command('get'), needUser, get];
module.exports.moderator = true;
