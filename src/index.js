
const express = require('express');

const expressApp = express();

const Discord = require('discord.js');
const { discord: discordCfg } = require('./config');

const discordBot = new Discord.Client();

const App = require('./app');

const instance = new App();

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

        instance.process({
            id: msg.author.id,
            input: msg.content || '',
            from: 'discord',
            event: 'message',
            handle({ output, reactions }) {
                if (reactions.length) {
                    // TODO: need check permissions!
                    reactions.forEach((reaction) => {
                        msg
                            .react(reaction)
                            .catch(() => {});
                    });
                }

                if (!msg.channel || !output) {
                    return;
                }

                // TODO: need check permissions!
                msg.channel
                    .send(output)
                    .catch(() => {});
            },
        });
    });

    discordBot.login(discordCfg.authToken);
}

module.exports = expressApp;
