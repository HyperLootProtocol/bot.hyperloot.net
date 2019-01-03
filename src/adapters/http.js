const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const debug = require('debug')('bot:adapter:http');

const { port } = require('../config');

const server = express();

const httpAdapter = () => {};

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

    server.use(cors());
    server.use(bodyParser.urlencoded({ extended: false }));
    server.use(bodyParser.json());

    server.listen(port, () => {
        debug(`express listnening port: ${port}`);
    });
};

module.exports = httpAdapter;
