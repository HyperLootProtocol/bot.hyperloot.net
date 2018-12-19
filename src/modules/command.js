// const trimStart = require('lodash/trimStart');
const { PREFIX } = require('../config');

module.exports = rawCommand => (response, { input }) => {
    const [command, ...argData] = rawCommand.split(' ');
    const [cmd, ...rawArgs] = input.split(' ');

    if (!cmd.startsWith(`${PREFIX}`)) {
        return null;
    }

    if (cmd.substring(1) !== command) {
        return null;
    }

    const parsedArgs = argData.reduce((result, item, index) => {
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
    response.cmd = command;
    response.args = parsedArgs;

    return response;
};
