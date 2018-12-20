const reduce = require('lodash/reduce');
const extend = require('lodash/extend');

const MIN_LENGTH = 10;
const conditions = [
    msg => msg.length < MIN_LENGTH,
    msg => msg.includes(' '),
];

module.exports = async function (response, { input, DB, id }) {
    const users = new DB('users');
    const selector = { discordId: id };

    const msgFit = reduce(
        conditions,
        (acc, condition) => condition(input),
        true,
    );

    // TODO one request/query
    const incQuery = {
        'data.log.allCounter': 1,
    };

    const setQuery = {
        'data.log.lastMsgData': new Date(),
    };

    if (msgFit) {
        extend(incQuery, { 'data.log.fitCounter': 1 });
    }

    await users.inc(selector, incQuery);
    await users.set(selector, setQuery);

    return response;
};
