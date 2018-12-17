const reduce = require('lodash/reduce');
const extend = require('lodash/extend');

const MIN_LENGTH = 10;
const conditions = [
    msg => msg.length < MIN_LENGTH,
    msg => msg.includes(' '),
];

module.exports = async function (response, { input, db, id }) {
    const msgFit = reduce(
        conditions,
        (acc, condition) => condition(input),
        true,
    );

    // TODO one request/query
    const updateQuery = {
        $inc: {
            'data.log.allCounter': 1,
        },
    };

    const setQuery = {
        $set: {
            'data.log.lastMsgData': new Date(),
        },
    };

    if (msgFit) {
        extend(updateQuery.$inc, { 'data.log.fitCounter': 1 });
    }

    db.users.update({ discordId: id }, updateQuery);
    db.users.update({ discordId: id }, setQuery);

    return response;
};
