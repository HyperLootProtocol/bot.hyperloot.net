const needUser = require('./needUser');
const command = require('./command');

const balance = async function(response, { i18n }) {
    const {user} = response;

    response.output = i18n('balance', { balance: user.balance });

    return response;
};

module.exports = [command('balance'), needUser, balance];
