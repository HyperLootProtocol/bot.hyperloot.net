const isEmpty = require('lodash/isEmpty');
const command = require('../command.filter');

const echo = async function (request, { i18n, send, getModuleData }) {
    const { setup } = await getModuleData('echo');

    if (!isEmpty(setup)) {
        send(setup);
    } else {
        send(i18n('empty'));
    }

    return request;
};

const setupEcho = async function (request, { i18n, send, updateModuleData }) {
    const { args: { setup } } = request;

    updateModuleData('echo', { setup });

    send(i18n('done'));

    return request;
};

module.exports = [
    [command('echo'), echo],
    [command('echo setup'), setupEcho],
];
