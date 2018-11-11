const needUser = require('./needUser');
const command = require('./command');

const CMD = 'balance';

const balanceCmd = async function(response, { i18n }) {
    const {user} = response;

    response.output = i18n('balance', { balance: user.balance });

    return response;
};

module.exports = [command(CMD), needUser, balanceCmd];
