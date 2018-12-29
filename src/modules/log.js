const isEmpty = require('lodash/isEmpty');
const extend = require('lodash/extend');

function containsLink(msg) {
    // based on how discord recognize URLs
    const URL_REGEXP = /(?:^|\s)(https?:)\/\/[\w.]{2,}/g;

    return !isEmpty(msg.match(URL_REGEXP));
}

module.exports = async function log(response, context) {
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
