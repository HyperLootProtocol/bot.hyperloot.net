const isInteger = require('lodash/isInteger');
const command = require('../command.filter');

const status = async function (request, context) {
    const { i18n, getModuleData, send } = context;
    const { lvl, value, nextLvl } = await getModuleData('exp', context);

    if (!isInteger(lvl) || !value || !isInteger(nextLvl)) {
        throw (i18n('statusError'));
    } else {
        send(i18n('status', { lvl, value, nextLvl }));
    }

    return request;
};

module.exports = [command('status'), status];
