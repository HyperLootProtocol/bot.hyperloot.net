const extend = require('lodash/extend');
const Discord = require("discord.js");
const bot = new Discord.Client();
const config = require('./config');
const {i18nFactory} = require('./i18n');
const i18n = i18nFactory();

const {discord: discordCfg} = config;
const token = discordCfg.authToken;

bot.on('ready', () => {
    console.log('Discord bot is ready to serve!');
});

function initDiscordBot(appInstance) {
    bot.on('message', (msg) => {
        // anti-bot + anti-self-loop
        if (msg.author.bot) {
            return;
        }

        discordProcessor('message', msg, {id: msg.author.id});
    });

    bot.on('guildMemberAdd', (member) => {
        discordProcessor('guildMemberAdd', member);
        // console.log(`New guild member added: ${member.user.id}`);
        // const guild = member.guild;
        // const defaultChannel = guild.channels.find(channel => channel.id === discordCfg.greetingsChannelId);
        //
        // if (defaultChannel) {
        //     defaultChannel.send(i18n('guildMemberAdd', {id: member.user.id}));
        // }
    });

    function sendMessage (data, output) {
        const { channel } = data;
        if (!channel || !output) {
            return;
        }

        channel.send(output);
    }

    function discordProcessor (event, data, options) {
        appInstance.process(extend(
            {
                data,
                input: data.content || '',
                from: 'discord',
                event,
                handle({ output }, data) {
                    sendMessage(data, output);
                },
                discordClient : bot,
            },
            options
        ));
    }
}

bot.login(token);

module.exports = {
    client: bot,
    init: initDiscordBot,
};
