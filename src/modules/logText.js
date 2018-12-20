const reduce = require('lodash/reduce');
const extend = require('lodash/extend');

const MIN_LENGTH = 10;
const conditions = [
    msg => msg.length < MIN_LENGTH,
    msg => msg.includes(' '),
];

module.exports = async function logText(response, context) {
    const { input, setModuleData, getModuleData } = context;
    const msgFit = reduce(
        conditions,
        (acc, condition) => condition(input),
        true,
    );

    const { allCounter, fitCounter } = await getModuleData('log', context);

    const query = {
        allCounter: allCounter + 1,
        lastMsgData: new Date(),
    };

    if (msgFit) {
        extend(query, {
            fitCounter: fitCounter + 1,
        });
    }

    await setModuleData('log', context, query);

    return response;
};
