const trimStart = require('lodash/trimStart');
const { PREFIX_SOC } = require('../config');

module.exports = async function (response, { input }) {
    // TODO: limit length of msg?
    if (!input.startsWith(`${PREFIX_SOC}`)) {
        return null;
    }

    const [cmd, ...args] = input.split(' ');
    // TODO: get prefix from config
    response.cmd = trimStart(cmd, '!');
    response.args = args;

    return response;
};

const checkReaction = async function (reaction, response) {
    const [expectedCmd, ...expectedArgs] = reaction.split(' ');
    const { cmd, args } = response;

    if (cmd !== expectedCmd) {
        return null;
    }

    const newArgs = {};
    for (let i = 0; i < expectedArgs.length; i++) {
        newArgs[expectedArgs[i]] = args[i];
    }

    response.args = newArgs;

    return response;
};

module.exports = function (reaction) {
    return async function (response, options) {
        return checkReaction(reaction, response, options);
    };
};
