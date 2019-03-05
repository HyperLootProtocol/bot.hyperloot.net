const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const debug = require('debug')('bot:adapter:http');

const discordAdapter = require('./discord');
const { port } = require('../config');

const server = express();

const httpAdapter = () => {};

const REDIRECT_MAP = {
    google: 'http://google.com',
};

httpAdapter.__INIT__ = function ({ process }) {
    server.use('/api', (req, res) => {
        process({
            input: req.query.message,
            from: 'http',
            handle(response, context) {
                res.json({ response, context });
            },
            ...req.query,
        });
    });

    // TODO: dirty one, move it...anywhere
    server.get('/redirect', (req, res) => {
        const { target } = req.query;
        const redirectUrl = REDIRECT_MAP[target];

        process({
            from: 'http',
            handle(response, context) {
                res.redirect(redirectUrl);
                discordAdapter.handle(response, context);
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
};

module.exports = httpAdapter;
