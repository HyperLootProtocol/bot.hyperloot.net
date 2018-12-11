const {discord: discordCfg} = require('./config');

const express = require('express');
const expressApp = express();

const Discord = require("discord.js");
const discordBot = new Discord.Client();

const App = require('./app');
const instance = new App();

const addExp = require('./modules/addExp');
const discordUser = require('./modules/discordUser');
const empty = require('./modules/empty');
const error = require('./modules/error');
const event = require('./modules/event');
const source = require('./modules/source');
const updateExp = require('./modules/updateExp');
const updateLvl = require('./modules/updateLvl');

// commands initializers
const parseCommand = require('./modules/parseCommand');
const pong = require('./modules/pong.command');
const status = require('./modules/status.command');

instance.use([
    [
        source('discord'),
        discordUser,
    ],

    [
        event('message'),
        addExp(1),
    ],

    [
        parseCommand,

        pong,
        status,

        empty,
    ],

    updateExp,
    updateLvl,

    error,
]);

// web api, i use it for local testing
// http://localhost:3000/api?message=<message>&id=122657091
expressApp.use('/api', (req, res) => {
    instance.process({
        input: req.query.message,
        from: 'json',
        handle(response) {
            res.json(response);
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
            handle({ output }) {
                if (!msg.channel || !output) {
                    return;
                }

                msg.channel.send(output);
            },
        });
    });

    discordBot.login(discordCfg.authToken);
}

module.exports = expressApp;
