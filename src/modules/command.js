// const trimStart = require('lodash/trimStart');
const { PREFIX } = require('../config');

module.exports = pattern => function command(response, { input }) {
    const [definedCommand, ...definedArgs] = pattern.split(' ');
    const [rawCommand, ...rawArgs] = input
        .trim()
        .replace(/\s+(?=([^"]*"[^"]*")*[^"]*$)/g, '|')
        .replace(/['"]/g, '')
        .split('|');

    if (!rawCommand.startsWith(`${PREFIX}`)) {
        return null;
    }

    if (rawCommand.substring(1) !== definedCommand) {
        return null;
    }


    if (!pattern.includes('...') && rawArgs.length !== definedArgs.length) {
        return null;
    }

    if (pattern.includes('...') && rawArgs.length < definedArgs.length) {
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
    response.cmd = definedCommand;
    response.args = parsedArgs;

    return response;
};
