const isEmpty = require('lodash/isEmpty');
const extend = require('lodash/extend');

function containsLink(msg) {
    // based on how discord recognize URLs
    const URL_REGEXP = /(?:^|\s)(https?:)\/\/[\w.]{2,}/g;

    return !isEmpty(msg.match(URL_REGEXP));
}

const keepLog = async function (response, context) {
    const {
        attachments,
        event,
        from,
        id,
        input,
        insertLog,
    } = context;

    const query = {
        date: new Date(),
        event,
        userId: id,
        client: from,
    };

    if (event === 'message') {
        extend(query, {
            message: input,
            hasLinks: containsLink(input),
            hasAttachments: !isEmpty(attachments.array()),
        });
    }

    await insertLog(query);

    return response;
};

const getLog = async function (response, { query, from, getAll }) {
    if (query === 'getLog' && from === 'http') {
        const logs = await getAll('logs');

        response.data = logs;
    }

    return response;
};

module.exports = [keepLog, getLog];
