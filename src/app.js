const isArray = require('lodash/isArray');
const isFunction = require('lodash/isFunction');

const {db} = require('./db');
const {i18nFactory} = require('./i18n');


module.exports = class App {
    constructor() {
        this.modules = [];

        // setup context here
        this.context = {
            i18n: i18nFactory(),
            db,
        };
    }

    use(module) {
        this.modules.push(module);

        return this;
    }

    async process({ input = '', ...options }) {
        let response = {
            output: '',
        };

        for (const executor of this.modules) {
            try {
                await this._execute(executor, response, {
                    ...this.context,
                    ...options, // Dirty need some standard structure
                    input,
                });
            } catch (error) {
                response.output = error;
                console.error(error);
            }
        }

        options.handle(response, options.data);

        return this;
    }

    async _execute(executor, response, options) {
        if (isArray(executor)) {
            for (let i = 0; i < executor.length; i++) {
                const res = await this._execute(executor[i], response, options);

                if (res === null) {
                    break;
                }
            }

            return response;
        }

        if (isFunction(executor)) {
            return await executor(response, options)
        }

        throw(this.context.i18n('badSubchain'));
    }
}
