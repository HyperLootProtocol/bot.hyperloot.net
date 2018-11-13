const WAValidator = require('wallet-address-validator');

const needUser = require('./needUser');
const command = require('./command');

const balanceCmd = async function(response, { input, db, id, i18n }) {
    const { user, args } = response;
    const { ethAdress } = args;

    if (!ethAdress) {
        response.output = i18n('eth', { ethAdress: user.eth });

        return response;
    }

    const isValid = WAValidator.validate(ethAdress, 'ETH');

    if (!isValid) {
        throw(i18n('ethError', { ethAdress }))
    }

    db.users.update({ telegramId: id }, {
        $set: {
            eth: ethAdress,
        },
    });

    response.output = i18n('ethUpdated', { ethAdress });

    return response;
};

module.exports = [command('eth'), needUser, balanceCmd];
