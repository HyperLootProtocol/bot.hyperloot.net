const defaults = require('lodash/defaults');
const extend = require('lodash/extend');
const reduce = require('lodash/reduce');

const MIN_LENGTH = 10;
const conditions = [
    msg => msg.length < MIN_LENGTH,
    msg => msg.includes(' '),
];

module.exports = async function logText(response, context) {
    const {
        input,
        setModuleData,
        getModuleData,
        user,
    } = context;

    const msgFit = reduce(
        conditions,
        (acc, condition) => condition(input),
        true,
    );

    let data = await getModuleData('log', { user });
    data = defaults(data, {
        allCounter: 0,
        fitCounter: 0,
    });

    const query = {
        allCounter: data.allCounter + 1,
        lastMsgData: new Date(),
    };

    if (msgFit) {
        extend(query, {
            fitCounter: data.fitCounter + 1,
        });
    }

    await setModuleData('log', query, { user });

    return response;
};
