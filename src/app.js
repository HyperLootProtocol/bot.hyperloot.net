// Inner kitchen our bot service

const isArray = require('lodash/isArray');
const isFunction = require('lodash/isFunction');
const {db} = require('./db');
const {i18nFactory} = require('./i18n');

module.exports = function() {
    const i18n = i18nFactory();
    let modules = [];

    const self = {
        register(executors) {
            modules = [...executors];

            return self;
        },
        async process({ input = '', ...options }) {
            const commands = modules
                .filter(module => module.command)
                .map(({ command, moderator }) => ({
                    command,
                    moderator,
                    help: i18n(`command.${command}`, { strict: true })
                }));


            let response = {
                output: '',
            };

            for (const executor of modules) {

                try {
                    await executeSubchain(executor, response, {
                        ...options,
                        i18n,
                        input,
                        db,
                        commands,
                    });
                } catch (error) {
                    response.error = error;
                    console.error(error);
                }
            }

            options.handle(response);

            return self;
        }
    };

    return self;
};

async function executeSubchain(executor, response, options) {
    if (isArray(executor)) {
        response.skipChain = false;

        for (let i = 0; i < executor.length; i++) {
            await executeSubchain(executor[i], response, options);

            if (response.skipChain)
                break;
        }

        return response;
    }

    if (isFunction(executor)) {
        return await executor(response, options)
    }

    throw(options.i18n('badSubchain'));
}
