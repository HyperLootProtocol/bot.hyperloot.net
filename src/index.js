
const express = require('express');
const isString = require('lodash/isString');
const isObject = require('lodash/isObject');
const isArray = require('lodash/isArray');
const isEmpty = require('lodash/isEmpty');

const expressApp = express();

const Discord = require('discord.js');
const { discord: discordCfg } = require('./config');

const discordBot = new Discord.Client();

const db = require('./db');
const App = require('./app');

const instance = new App({ db });

const quiz = require('./modules/quiz');

const addExp = require('./modules/addExp');
// const empty = require('./modules/empty');
const error = require('./modules/error');
const event = require('./modules/event');
const logText = require('./modules/logText');
const updateExp = require('./modules/updateExp');
const autoReaction = require('./modules/autoReaction');

// commands initializers
const pong = require('./modules/pong.command');
const status = require('./modules/status.command');

instance.use([
    [
        event('message'),
        addExp(1),
        autoReaction,
        logText,
    ],

    pong,
    status,
    quiz,

    // empty,

    updateExp,

    error,
]);

// web api, i use it for local testing
// http://localhost:3000/api?message=/ping
expressApp.use('/api', (req, res) => {
    instance.process({
        input: req.query.message,
        from: 'json',
        handle(response, context) {
            res.json({ response, context });
        },
        ...req.query,
    });
});

// discord bot here
if (discordCfg.authToken) {
    discordBot.on('ready', () => {
        console.log('Discord bot is ready to serve!');
    });

    discordBot.on('message', (msg) => {
        // anti-bot + anti-self-loop
        if (msg.author.bot) {
            return;
        }

        const handle = (context) => {
            const { output, reactions } = context;

            // TODO rework!
            if (!isEmpty(reactions)) {
                reactions.forEach((reaction) => {
                    msg
                        .react(reaction)
                        .catch((e) => {
                            console.error(e.message);
                        });
                });
            }

            if (isEmpty(output)) {
                return;
            }

            // TODO: need check permissions!
            // simple case, output as answer
            if (isString(output)) {
                msg.channel
                    .send(output)
                    .catch((e) => {
                        console.error(e.message);
                    });
            }

            // send several messages
            if (isArray(output)) {
                output.forEach(_output => handle({
                    ...context,
                    output: _output,
                }));
            }

            // send to another destination or with params
            if (isObject(output)) {
                const { channelName, message } = output;
                const channel = discordBot.channels.find(ch => ch.name === channelName);
                channel
                    .send(message)
                    .catch((e) => {
                        console.error(e.message);
                    });
            }
        };

        instance.process({
            id: msg.author.id,
            input: msg.content || '',
            from: 'discord',
            event: 'message',
            handle,
        });
    });

    discordBot.login(discordCfg.authToken);
}

module.exports = expressApp;
