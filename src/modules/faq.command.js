const route = require('./route');
const CMD = 'faq';

faqCmd = async function(response, { input, i18n }) {
    response.output = i18n('faq');

    return response;
};

module.exports = [route(CMD), faqCmd];
module.exports.command = CMD;
