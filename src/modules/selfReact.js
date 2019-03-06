const { selfName } = require('../config');

const selfReact = async function (request, { i18n, send }) {
    const { input, userId: id } = request;

    if (request.input.includes(selfName)) {
        send(i18n('selfReact', { input, id }));
    }

    return request;
};

module.exports = [selfReact];
