const { PREFIXsoc } = require('../config');

module.exports = pattern => function reactions(response, { input }) {
    const [definedReactions, ...definedArgs] = pattern.split(' ');
    const [rawReactions, ...rawArgs] = input.split(' ');

    if (!rawReactions.startsWith(`${PREFIXsoc}`)) {
        return null;
    }

    if (rawReactions.substring(1) !== definedReactions) {
        return null;
    }

    const parsedArgs = definedArgs.reduce((result, item, index) => {
        const _result = {
            ...result,
            [item]: rawArgs[index],
        };

        if (item.startsWith('...')) {
            delete _result[item];
            const restName = item.substring(3);

            _result[restName] = rawArgs.slice(index);
        }

        return _result;
    }, {});


    response.rawArgs = rawArgs || [];
    response.cmd = definedReactions;
    response.args = parsedArgs;

    return response;
};
