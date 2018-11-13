const command = require('./command');

const ping = async function(response, { input }) {
    response.output = 'PONG';

    return response;
};

module.exports = [command('ping'), ping];
