const command = require('../command.filter');

const ping = async function (request, { i18n, pong, send }) {
    // we init pong in __INIT__
    send(i18n('ping', { pong }));

    return request;
};

ping.__INIT__ = function (context) {
    // here we can init some methods here

    return {
        ...context,
        pong: true,
    };
};

module.exports = [command('ping'), ping];
