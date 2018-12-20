const reaction = require('./reaction');

const lick = async function (response, { i18n }) {
    response.output = i18n('lick');

    return response;
};

module.exports = [reaction('lick'), lick];
