const command = require('./command');

const terms = async function(response, { input, i18n }) {
    response.output = i18n('terms');

    return response;
};

module.exports = [command('terms'), terms];
