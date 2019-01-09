const debug = require('debug')('bot:app');
const isArray = require('lodash/isArray');
const isFunction = require('lodash/isFunction');
const cloneDeep = require('lodash/cloneDeep');
const bind = require('lodash/bind');
const invariant = require('invariant');

module.exports = class App {
    constructor(modules = [], context = {}) {
        this.modules = modules;

        this.context = {
            ...context,
            process: bind(this.process, this),
        };
    }

    use(module) {
        if (module) {
            this.modules.push(module);
            this.context = this._init(module, this.context);
        }

        // for chaining :)
        return this;
    }

    async process({ input = '', handle, ...data }) {
        invariant(isFunction(handle), 'handle must be function');

        // reference for response object, in future need add here comments
        // and additional universal (non-client-locked) fields
        let response = {
            output: '',
            stack: [],
            reactions: [],
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

        if (data.id) {
            user = await this.context.getUser(data.id);
        }

        const context = {
            ...this.context,
            ...data, // Dirty need some standard structure
            user,
            input,
            // handle,
        };

        response = await this._execute(this.modules, response, context);

        // after all modules we call one
        handle(response, context);

        return this;
    }

    _init(module, context) {
        if (isArray(module)) {
            for (let i = 0; i < module.length; i++) {
                try {
                    // eslint-disable-next-line no-param-reassign
                    context = this._init(module[i], context);
                } catch (error) {
                    console.error('error', error);

                    break;
                }
            }

            return context;
        }

        if (!module || !isFunction(module.__INIT__)) {
            return context;
        }


        const _tmpContext = cloneDeep(context);
        const _context = module.__INIT__(context);

        debug(`module '${module.name}' inited`);

        if (!_context) {
            return _tmpContext;
        }

        return _context;
    }

    async _execute(module, response, context) {
        invariant(isArray(module) || isFunction(module), 'module should be array or function');

        if (isArray(module)) {
            for (let i = 0; i < module.length; i++) {
                let _response = cloneDeep(response);

                try {
                    _response = await this._execute(module[i], response, context);
                } catch (error) {
                    console.error('error', error);
                    response.error = error;

                    break;
                }

                if (!_response) {
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
