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
            // TODO: remove
            // const commands = modules
            //     .filter(module => module.command)
            //     .map(({ command, moderator }) => ({
            //         command,
            //         moderator,
            //         help: i18n(`command.${command}`, { strict: true })
            //     }));


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
                    });
                } catch (error) {
                    response.error = error;
                    console.error(error);
                }
            }

            options.handle(response, options.data);

            return self;
        }
    };

    return self;
};

async function executeSubchain(executor, response, options) {
    if (isArray(executor)) {
        for (let i = 0; i < executor.length; i++) {
            const response = await executeSubchain(executor[i], response, options);

            if (response) {
                break;
            }
        }

        return response;
    }

    if (isFunction(executor)) {
        return await executor(response, options)
    }

    throw(options.i18n('badSubchain'));
}
