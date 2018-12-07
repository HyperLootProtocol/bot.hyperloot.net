const command = require('./command');

const pong = async function(response, { input, i18n }) {
    response.output = i18n('pong');

    return response;
};

module.exports = [command('pong'), pong];
