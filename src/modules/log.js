const isEmpty = require('lodash/isEmpty');
const extend = require('lodash/extend');

function containsLink(msg) {
    // based on how discord recognize URLs
    const URL_REGEXP = /(?:^|\s)(https?:)\/\/[\w.]{2,}/g;

    return !isEmpty(msg.match(URL_REGEXP));
}

const keepLog = async function (request, context) {
    const {
        event,
        from,
        userId,
        input,
    } = request;

    const {
        insertLog,
    } = context;

    const query = {
        date: new Date(),
        event,
        userId,
        client: from[0],
        from,
    };

    if (event === 'message') {
        extend(query, {
            message: input,
            hasLinks: containsLink(input),
        });
    }

    await insertLog(query);

    return request;
};

const getLog = async function (request, { getAll }) {
    const { query, from } = request;

    if (query === 'getLog' && from[0] === 'http') {
        const logs = await getAll('logs');

        request.data = logs;
    }

    return request;
};

module.exports = [keepLog, getLog];
