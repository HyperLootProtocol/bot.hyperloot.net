const command = require('../command.filter');

const ping = async function (response, { i18n, pong }) {
    // we init pong in __INIT__
    response.output = i18n('ping', { pong });

    return response;
};

ping.__INIT__ = function (context) {
    // here we can init some methods here

    return {
        ...context,
        pong: true,
    };
};

module.exports = [command('ping'), ping];
