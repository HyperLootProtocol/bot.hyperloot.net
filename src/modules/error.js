
module.exports = async function(response, { i18n }) {
    if (response.error) {
        response.output = response.error || i18n('otherError');
    }

    return response;
};

