const command = require('./command');

const status = async function (response, context) {
    const { i18n, getModuleData } = context;
    const { lvl, value, nextLvl } = await getModuleData('exp', context);

    if (!lvl || !value || !nextLvl) {
        throw (i18n('statusError'));
    } else {
        response.output = i18n('status', { lvl, value, nextLvl });
    }

    return response;
};

module.exports = [command('status'), status];
