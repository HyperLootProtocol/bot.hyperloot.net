const trimStart = require('lodash/trimStart');
const {PREFIX} = require('../config');

module.exports = async function(response, {input}) {
    // TODO: limit length of msg?
    if (input.startsWith(`${PREFIX}`)) {
        const [cmd, ...args] = input.split(' ');

        response.cmd = trimStart(cmd, '/');
        response.args = args;
    } else {
        response.skipChain = true;
    }

    return response;
};
