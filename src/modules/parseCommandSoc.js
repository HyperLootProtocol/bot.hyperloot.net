const trimStart = require('lodash/trimStart');
const { PREFIX_SOC } = require('../config');

module.exports = async function (response, { input }) {
    // TODO: limit length of msg?
    if (!input.startsWith(`${PREFIX_SOC}`)) {
        return null;
    }

    const [cmd, ...args] = input.split(' ');
    // TODO: get prefix from config
    response.cmd_soc = trimStart(cmd, '!');
    response.args = args;

    return response;
};
