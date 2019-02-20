const Discord = require('discord.js');
const debug = require('debug')('bot:adapter:discord');

const merge = require('lodash/merge');
const pick = require('lodash/pick');

// const { PREFIX } = require('./../config');
const { discord: discordCfg } = require('../config');

const discordAdapter = () => {};

discordAdapter.__INIT__ = function (ctx) {
    const discordBot = new Discord.Client();

    discordBot.on('ready', () => {
        debug('Discrodjs ready');
    });

    const handler = async (output) => {
        const { message, to, reactions } = output;
        const [, channelId, msgId] = to;
        let { embed } = output;

        const channel = discordBot.channels.find(ch => ch.id === channelId);

        if (msgId && reactions) {
            const msg = await channel.fetchMessage(msgId);

            await reactions.reduce(
                (prev, reaction) => prev.then(() => msg.react(reaction).catch((e) => {
                    console.error(e.message);
                })),
                Promise.resolve(),
            );
        }

        if (embed) {
            const {
                title,
                description,
                url,
                fields = [],
            } = embed;

            embed = new Discord.RichEmbed();
            embed.setColor(discordCfg.color);

            if (title) {
                embed.setTitle(title);
            }

            if (description) {
                embed.setDescription(description);
            }

            if (url) {
                embed.setURL(url);
            }

            fields.forEach((field) => {
                embed.addField(field);
            });

            return channel.send({ embed }).catch((e) => {
                console.error(e.message);
            });
        }

        // if (!message) {
        //     return Promise.reject();
        // }

        return channel.send(message).catch((e) => {
            console.error(e.message);
        });
    };

    discordBot.on('message', (message) => {
        const {
            content = '',
            author,
            id,
            channel,
        } = message;

        // anti-bot + anti-self-loop
        if (author.bot) {
            return;
        }

        ctx.process({
            userData: pick(author, discordCfg.userFields),
            userId: author.id,
            input: content,
            from: ['discord', channel.id, id],
            event: 'message',

            _handleDirect: handler,
        });
    });

    discordBot.login(discordCfg.authToken);

    return merge(ctx, {
        _handlers: {
            // handleTo implementation
            discord: handler,
        },
    });
};

module.exports = discordAdapter;
