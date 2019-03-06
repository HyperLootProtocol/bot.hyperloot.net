module.exports = {
    PREFIX: '/',
    lang: process.env.BOT_LANG || 'en',
    port: process.env.PORT || process.env.VCAP_APP_PORT || 3000,
    mongoURI: process.env.MONGODB_URI,
    admin: process.env.ADMINISTRATOR_NICKNAME || 'dcversus',
    selfName: process.env.SELF_NAME || 'ботий',
    discord: {
        color: '0xf9690e',
        authToken: process.env.DISCORD_AUTH_TOKEN,
        broadcastChannelId: process.env.BROADCAST_CHANNEL_ID,
        userFields: ['username', 'id', 'discriminator', 'bot', 'avatar'],
    },
};
