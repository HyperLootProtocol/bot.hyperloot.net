const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const debug = require('debug')('bot:adapter:http');

const { port } = require('../config');

const server = express();

const httpAdapter = () => {};

httpAdapter.__INIT__ = function (context) {
    server.use('/api', (req, res) => {
        context.process({
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


    server.use(express.static('dist'));

    server.listen(port, () => {
        debug(`express listnening port: ${port}`);
    });
    
    return {
        ...context,
        expressServer: server,
    }
};

module.exports = httpAdapter;
