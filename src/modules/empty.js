const isEmpty = require('lodash/isEmpty');

module.exports = async function (request, { i18n }) {
    if (isEmpty(request.output) && !request.error) {
        // request.error = i18n('empty'); // [1]

        throw (i18n('empty')); // [2]
    }

    return request;
};
