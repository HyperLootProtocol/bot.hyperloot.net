const command = require('./command');

const help = async function(response, { input, i18n }) {
    const { isModerator } = response;

    // TODO: help message
    // response.output = commands
    //     .filter(command => command.help)
    //     .filter(command => isModerator || !command.moderator)
    //     .map(command => i18n('help', { PREFIX, ...command }))
    //     .join('\n');
    response.output = 'help stub';

    return response;
};

module.exports = [command('help'), help];
