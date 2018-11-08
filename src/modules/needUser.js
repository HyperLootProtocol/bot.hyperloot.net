const isEmpty = require('lodash/isEmpty');

module.exports = async function(response, { i18n }) {
    const {user} = response;

    if (isEmpty(user)) {
        throw(i18n('noLogged'));
    }

    return response;
};
