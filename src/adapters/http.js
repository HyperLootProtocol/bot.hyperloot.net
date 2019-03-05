const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const debug = require('debug')('bot:adapter:http');

const discordAdapter = require('./discord');
const { discord: { broadcastChannelId } } = require('../config');
const { port } = require('../config');

const server = express();

const httpAdapter = () => {};

const REDIRECT_MAP = {
    google: 'http://google.com',
};

httpAdapter.__INIT__ = function (ctx) {
    server.use('/api', (req, res) => {
        ctx.process({
            input: req.query.message,
            from: ['http'],

            _handleDirect(message, request, context) {
                res.json({ message, request, context });
            },

            // dirty, but working
            ...req.query,
        });
    });

    // TODO: dirty one, move it...anywhere
    server.get('/redirect', (req, res) => {
        const { target } = req.query;
        const redirectUrl = REDIRECT_MAP[target];

        ctx.process({
            from: ['http'],
            _handleDirect(message, request) {
                res.redirect(redirectUrl);
                discordAdapter.handler({
                    message: request.output,
                    embed: request.output && request.output.embed,
                    to: ['http', broadcastChannelId],
                    reactions: request.reactions,
                });
            },
            ...req.query,
        });
    });

    server.use(cors());
    server.use(bodyParser.urlencoded({ extended: false }));
    server.use(bodyParser.json());

    server.use(express.static('dist'));

    server.listen(port, () => {
        debug(`express listnening port: ${port}`);
    });

    return {
        ...ctx,

        // tmp solution... but i hvnt another now
        // use context.express.use in __INIT__ to register endpoints...
        express: server,
    };
};

module.exports = httpAdapter;
