const isArray = require('lodash/isArray');
const isFunction = require('lodash/isFunction');
const invariant = require('invariant');

const db = require('./db');
const { lang } = require('./config');
const { i18nFactory } = require('./i18n');


module.exports = class App {
    // TODO: PASS context functions in constructor, dont inject itself here)
    constructor() {
        this.modules = [];

        // setup context here
        this.context = {
            i18n: i18nFactory(lang),
            ...db,
        };
    }

    use(module) {
        // TODO: additional initialization, (support factory modules and modules with metadata)
        this.modules.push(module);

        // for chaining :)
        return this;
    }

    async process({ input = '', handle, ...context }) {
        invariant(isFunction(handle), 'handle must be function');

        // reference for response object, in future need add here comments
        // and additional universal (non-client-locked) fields
        let response = {
            output: '',
            stack: [],
            // attachments: [],
            // stack: {
            //   [moduleName]: { ... ??? }
            // },
            // ...
        };

        // TODO: i prefer to check it before inject here!
        // let context = {
        //     id: '',
        //     input: '',
        //     handle: () => {}
        // }

        let user = {};

        if (context.id) {
            user = await db.getUser(context.id);
        }

        response = await this._execute(this.modules, response, {
            ...this.context,
            ...context, // Dirty need some standard structure
            user,
            input,
            // handle,
        });

        // after all modules we call one
        handle(response, context);

        return this;
    }

    async _execute(module, response, context) {
        invariant(isArray(module) || isFunction(module), 'module should be array or function');

        if (isArray(module)) {
            for (let i = 0; i < module.length; i++) {
                let _response = response;

                try {
                    _response = await this._execute(module[i], response, context);
                } catch (error) {
                    response.error = error;
                    console.error('error', error);

                    break;
                }

                if (_response === null) {
                    break;
                } else {
                    // eslint-disable-next-line no-param-reassign
                    response = _response;
                }
            }

            return response;
        }

        // if module is simple executor
        response.stack.push(module.name);
        return module(response, context);
    }
};
