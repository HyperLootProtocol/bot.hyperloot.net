const command = require('./command');
const CMD = 'faq';

faqCmd = async function(response, { input, i18n }) {
    response.output = i18n('faq');

    return response;
};

module.exports = [command(CMD), faqCmd];
