const _ = require('lodash');
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
        botProcessor('message', msg);
        // const admins = ['fenruga', 'dcversus'];

        // const match = guild.members.filter(member =>
        //     admins.contains(member.user.username) &&
        //     // member.user.discriminator === '3422' &&
        //     !member.deleted
        // );
        // console.log('Bot received a message ' + msg.content);

    });

    bot.on('guildMemberAdd', (member) => {
        botProcessor('guildMemberAdd', member);
        // console.log(`New guild member added: ${member.user.id}`);
        // const guild = member.guild;
        // const defaultChannel = guild.channels.find(channel => channel.id === discordCfg.greetingsChannelId);
        //
        // if (defaultChannel) {
        //     defaultChannel.send(i18n('guildMemberAdd', {id: member.user.id}));
        // }
    });

    function sendMessage ({ data, output }) {
        const { channel } = data;
        if (!channel || !output) {
            return;
        }

        incomingMessage.channel.send(output);
    }

    function botProcessor (event, data) {
        appInstance.process({
            data,
            from: 'discord',
            event,
            handle({ output }) {
                sendMessage(data, output);
            },
            discordClient : bot,
        });
    };

    bot.login(token);
}

module.exports = {
    client: bot,
    init: initDiscordBot,
}