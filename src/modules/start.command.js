const {PREFIX} = require('../config');

module.exports = async function(response, { input, username, id, db, commands, i18n }) {
    if (response.user) {
        response.output = i18n('startHey', { username });
        console.log('debug', response.user)
    }

    if (!response.user) {
        const newUser = {
            telegramId: id,
            telegramUsername: username,
            isModerator: false,
            pending: false,
            balance: 0,
            data: {
                // key: { }
            },
        };
        db.users.insert(newUser);

        const help = commands
            .filter(command => command.help)
            .map(command => i18n('help', { PREFIX, ...command }))
            .join('\n');

        response.user = newUser;
        response.output = `${i18n('startHey', { username })} \n\n ${i18n('start')} \n\n ${help}`;
    }

    return response;
};

module.exports.command = 'start';
