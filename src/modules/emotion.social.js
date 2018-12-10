const {text, pictures} = require('./emotion-list.json');
const {SOCIAL_PREFIX} = require('../config');

// TODO: любая эмоция может быть командой. любая команда может быть эмоцией
// TODO: получаю эмоцию-команду и беру из пула сообщение и картинку
const emotionSocial = async function(response, { username, input, i18n }) {
    if (input[0] !== SOCIAL_PREFIX) {
        return response;
    }

    const emotionName = input.split(` `)[0];

    const emotion = i18n(emotionName);
    const message = text[emotion];
    const picture = pictures[emotion];

    if (message && picture) {
        response.output = `${message} ${picture}`;
    }

    return response;
};

const command = pattern => function command(response, { input }) {
    const [definedCommand, ...definedArgs] = pattern.split(' ');
    const [rawCommand, ...rawArgs] = input.split(' ');

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

module.exports = [command('status'), emotionSocial];
