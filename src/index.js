const {discord: discordCfg} = require('./config');

const express = require('express');
const expressApp = express();

const Discord = require("discord.js");
const discordBot = new Discord.Client();

const App = require('./app');
const instance = new App();

// commands initializers
const parseCommand = require('./modules/parseCommand');
const pong = require('./modules/pong.command');

instance.use([
    parseCommand,

    pong,
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
}

module.exports = expressApp;
