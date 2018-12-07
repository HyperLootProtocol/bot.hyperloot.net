const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const {
    client: discordClient,
    init: discordInit,
} = require('./discordBot');

const botApp = require('./app');
const {telegram: telegramCfg, url} = require('./config');
const {discord: discordCfg} = require('./config');

const user = require('./modules/user');
const discordUser = require('./modules/discordUser');
const error = require('./modules/error');
const empty = require('./modules/empty');
const pending = require('./modules/pending');
const event = require('./modules/event');
const source = require('./modules/source');
const addExp = require('./modules/addExp');
const logText = require('./modules/logText');
const updateExp = require('./modules/updateExp');
const updateLvl = require('./modules/updateLvl');

const parseCommand = require('./modules/parseCommand');
const start = require('./modules/start.command');
const pong = require('./modules/pong.command');
const ping = require('./modules/ping.command');
const status = require('./modules/status.command');
const help = require('./modules/help.command');
const eth = require('./modules/eth.command');
const balance = require('./modules/balance.command');
const faq = require('./modules/faq.command');
const support = require('./modules/support.command');
const terms = require('./modules/terms.command');

const missions = require('./modules/missions');
const moderation = require('./modules/moderation');

const expressApp = express();

const appInstance = botApp().register([
    // KEEP IN MIND, ORDER IMPORTANT!!!

    // telegram
    // [
    //     source('telegram'),

    //     user,

    //     [
    //         parseCommand,

    //         start,
    //         pong,
    //         help,
    //         eth,
    //         balance,
    //         faq,
    //         support,
    //         terms,

    //         // TODO: refactor missions
    //         // ...missions,
    //         // moderation,
    //     ],

    //     empty,
    // ],

    // // discord
    [
        source('discord'),
        discordUser,

        [
            event('message'),
            logText,
            addExp(1),

            [
                parseCommand,

                pong,
                status,
                ping,

                empty,
            ],
        ],
    ],

    // // ITS LIKE ERROR HANDLER? NOCOMAND HANDLER OR SOMETHING LIKE
    // // PLACE LAST, THEN ALL OTHER MODULES EXECUTE
    updateExp,
    updateLvl,
    error,
]);

// hook with telegram
const path = `/telegram/${telegramCfg.webhookEndpoint}${telegramCfg.authToken}`;

if (telegramCfg.authToken) { // for local dev purposes
    const telegramClient = new TelegramBot(telegramCfg.authToken, {polling: true});

    telegramClient.setWebHook(`${url}${path}`);

    expressApp.post(path, (req, res) => {
        telegramClient.processUpdate(req.body);
        res.sendStatus(200);
    });

    telegramClient.on('message', ({ from, text, chat }) => {
        const { id, username,  } = from;

        telegramClient.sendMessage(id, 'Thank you for participating in HyperLoot bounty 1.0! We will calculate the end proceeding and airdrop them out on February 15th, 2019. Stay tuned for more missions in Bounty 2.0! I will contact everyone soon!');
        return;

//         appInstance.process({
//             input: text,
//             username,
//             id,
//             from: 'telegram',
//             handle({ output }) {
//                 telegramClient.sendMessage(id, output);
//             },
//             telegramClient,
//             discordClient,
//         });
    });
}

if (discordCfg.authToken) {
    discordInit(appInstance);
}

// web api, i use it for local testing
// http://localhost:3000/api/message?message=<message>&id=122657091
expressApp.use('/api/message', (req, res) => {
    appInstance.process({
        input: req.query.message,
        id: req.query.id,
        username: req.query.username,
        from: 'web',
        handle({ output }) {
            res.send(`<pre>${output}</pre>`);
        },
        discordClient,
    });
});

module.exports = expressApp;
