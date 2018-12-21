// const trimStart = require('lodash/trimStart');
const { PREFIX } = require('../config');

module.exports = rawCommand => (response, { input }) => {
    const [command, ...argData] = rawCommand.split(' ');
    const [cmd, ...rawArgs] = input.trim().replace(/\s+(?=([^"]*"[^"]*")*[^"]*$)/g, '|').replace(/['"]/g, '').split('|');

    if (!rawCommand.startsWith(`${PREFIX}`)) {
        return null;
    }

    if (rawCommand.substring(1) !== definedCommand) {
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
