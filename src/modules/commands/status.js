const isInteger = require('lodash/isInteger');
const command = require('../command.filter');

const status = async function (request, context) {
    const { i18n, getModuleData, send } = context;
    const { lvl, value } = await getModuleData('exp', { user: request.user });
    console.log('lvl, value', lvl, value);

    if (!isInteger(lvl) || !value) {
        throw (i18n('statusError'));
    } else {
        send({
            embed: {
                title: i18n('lvl'),
                description: i18n('status', { lvl, value }),
            },
        });
    }

    return request;
};

module.exports = [command('status'), status];
