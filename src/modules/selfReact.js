const { selfName } = require('../config');

const selfReact = async function (request, { i18n, send }) {
    if (request.input.includes(selfName)) {
        send(i18n('selfReact'));
    }

    return request;
};

module.exports = [selfReact];
