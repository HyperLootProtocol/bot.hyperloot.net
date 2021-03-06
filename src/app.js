const debug = require('debug')('bot:app');
const get = require('lodash/get');
const isArray = require('lodash/isArray');
const isFunction = require('lodash/isFunction');
const isEmpty = require('lodash/isEmpty');
const isString = require('lodash/isString');
const isObject = require('lodash/isObject');
const cloneDeep = require('lodash/cloneDeep');
const bind = require('lodash/bind');
const concat = require('lodash/concat');
const invariant = require('invariant');

const ADAPTER_DELIMITER = '//';
// const ID_DELIMITER = '#';

class Destination {
    constructor({
        adapter, // literal, adapter key (unique) for back-call
        path = [], // full path WHERE happen event
        id, // per request, like artifact what keep and transfer information about call source
        name, // human readable
    }) {
        invariant(!isEmpty(adapter), 'adapter must be present');
        invariant(isArray(path), 'path must be array');
        // must sanitize!

        this._adapter = adapter;
        this._path = path;
        this._id = id;
        this._name = name;
    }

    get adapter() {
        return this._adapter;
    }

    get path() {
        return this._path;
    }

    get id() {
        return this._id;
    }

    get name() {
        return this._name;
    }

    // static fromString(destination) {
    //     const [adapter, rest] = destination.split(ADAPTER_DELIMITER);
    //     const [rawPath, id] = rest.split(ID_DELIMITER);
    //     const path = rawPath.split('/');

    //     return new Destination({
    //         adapter,
    //         path,
    //         id,
    //     })
    // }

    static toString({ adapter, path }) {
        let destination = '';
        const pathString = path.join('/');

        destination += `${adapter}${ADAPTER_DELIMITER}`;
        destination += pathString;

        // if (id) {
        //     destination += `${ID_DELIMITER}${id}`;
        // }

        return destination;
    }

    toString() {
        return Destination.toString(this);
    }
}

class App {
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

    async _handle(output, request, context) {
        let _output = output;

        if (isEmpty(_output)) {
            _output = '';
        }

        if (isArray(_output)) {
            const _handleMapper = localOutput => this._handle(
                localOutput,
                request,
                context,
            );

            return Promise.all(_output.map(_handleMapper));
        }

        if (isString(_output)) {
            _output = { to: request.from, message: _output };
        }

        if (isObject(_output) && !_output.to) {
            _output = { to: request.from, ..._output };
        }

        if (String(_output.to) === String(request.from)) {
            return context._handleDirect(_output, request, context);
        }

        // or HandleTo section
        const handlerId = _output.to.adapter;
        const handler = context._handlers[handlerId];

        invariant(isFunction(handler), 'handleTo must be a function');

        return handler(_output, request, context);
    }

    async process({
        input = '',
        from,
        userId,
        _handleDirect,
        ...data
    }) {
        // start prepare "process specific" data, in future, need clear all inputed data!
        let user = {};

        // need rework later!
        if (userId && isFunction(this.context.getUser)) {
            const userData = get(data, 'userData', {});

            user = await this.context.getUser(userId, userData);

            // dirty hack! if user upd his data but our storage dont know it...
            user = {
                ...user,
                ...userData,
            };
        }

        // request, per "process" state
        // mutable structure
        let request = {
            userId,
            input,
            from: new Destination(from),

            ...data, // Dirty need some standard structure !!!
            user,
            output: [],
            // stack: [],
        };

        // send as request mutation func
        const _send = (message) => {
            invariant(!isEmpty(message), 'send: message must contain something!');

            if (isArray(message)) {
                request.output = concat(request.output, message);
            } else {
                request.output.push(message);
            }
        };

        // context, methods
        // and immutable part
        const context = {
            // prepared, system context
            ...this.context,

            // some procces-specific part of context
            send: _send,
            _handleDirect,
        };

        // exept stack
        context.stack = [{
            key: 'init',
            request: cloneDeep(request),
        }];

        request = await this._execute(this.modules, request, context);

        // after all modules we call one
        await this._handle(request.output, request, context);

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

    async _execute(module, request, context) {
        invariant(isArray(module) || isFunction(module), 'module should be array or function');

        if (isArray(module)) {
            for (let i = 0; i < module.length; i++) {
                let _request = cloneDeep(request);

                try {
                    _request = await this._execute(module[i], request, context);
                } catch (error) {
                    console.error('Error', error, _request);
                    request.error = error;

                    break;
                }

                if (!_request) {
                    break;
                } else {
                    // eslint-disable-next-line no-param-reassign
                    request = _request;
                }
            }

            return request;
        }

        // if module is simple executor
        context.stack.push({
            key: module.name,
            request,
        });

        return module(request, context);
    }
}

module.exports = App;
module.exports.Destination = Destination;
