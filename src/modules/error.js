
module.exports = async function error(request, { i18n, send }) {
    if (request.error) {
        const output = request.error || i18n('otherError');

        send({
            embed: {
                title: i18n('error'),
                description: output,
            },
        });
    }

    return request;
};
