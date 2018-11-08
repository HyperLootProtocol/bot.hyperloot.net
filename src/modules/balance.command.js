const needUser = require('./needUser');
const route = require('./route');

const CMD = 'balance';

const balanceCmd = async function(response, { i18n }) {
    const {user} = response;

    response.output = i18n('balance', { balance: user.balance });

    return response;
};

module.exports = [route(CMD), needUser, balanceCmd];
module.exports.command = CMD;
