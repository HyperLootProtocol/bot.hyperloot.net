const trimStart = require('lodash/trimStart');
const { PREFIX } = require('../config');

module.exports = async function (response, { input }) {
    // TODO: limit length of msg?
    if (!input.startsWith(`${PREFIX}`)) {
        return null;
    }

    const [cmd, ...args] = input.split(' ');

    response.cmd = trimStart(cmd, '/');
    response.args = args;

    return response;
};
