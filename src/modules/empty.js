
module.exports = async function (response, { i18n }) {
    if (response.output === '' && !response.error) {
        // response.error = i18n('empty'); // [1]

        throw (i18n('empty')); // [2]
    }

    return response;
};
