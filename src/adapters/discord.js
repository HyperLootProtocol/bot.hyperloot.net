const Discord = require('discord.js');
const debug = require('debug')('bot:adapter:discord');

const isString = require('lodash/isString');
const isObject = require('lodash/isObject');
const isArray = require('lodash/isArray');
const isEmpty = require('lodash/isEmpty');

const { discord: discordCfg } = require('../config');

const discordAdapter = () => {};

discordAdapter.__INIT__ = function ({ process }) {
    const discordBot = new Discord.Client();

    discordBot.on('ready', () => {
        debug('Discrodjs ready');
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
                reactions.reduce(
                    (prev, reaction) => prev.then(() => msg.react(reaction).catch((e) => { console.error(e.message); })),
                    Promise.resolve(),
                );
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

        process({
            id: msg.author.id,
            input: msg.content || '',
            attachments: msg.attachments,
            from: 'discord',
            event: 'message',
            handle,
        });
    });

    discordBot.login(discordCfg.authToken);
};

module.exports = discordAdapter;
