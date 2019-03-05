module.exports = {
    PREFIX: '/',
    lang: process.env.BOT_LANG || 'en',
    port: process.env.PORT || process.env.VCAP_APP_PORT || 3000,
    mongoURI: process.env.MONGODB_URI,
    adminDiscordId: process.env.ADMIN_DISCORD_ID || '258540630681190402',
    selfName: process.env.SELF_NAME || 'ботий',
    discord: {
        color: '0xf9690e',
        authToken: process.env.DISCORD_AUTH_TOKEN,
        broadcastChannelName: process.env.BROADCAST_CHANNEL_NAME,
        broadcastChannelId: process.env.BROADCAST_CHANNEL_ID,
        userFields: ['username', 'id', 'discriminator', 'bot', 'avatar'],
    },
};
