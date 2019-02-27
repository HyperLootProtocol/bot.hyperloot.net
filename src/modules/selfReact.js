const { selfName } = require('../config');

const selfReact = async function (request, { i18n, send }) {
    console.log('111', request.input);
    if (request.input.includes(selfName)) {
        send(i18n('selfReact'));
    }

    return request;
};

module.exports = [selfReact];
