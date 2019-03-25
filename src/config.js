module.exports = {
    PREFIX: '/',
    appUrl: process.env.APP_URL || 'http://localhost:3000/',
    lang: process.env.BOT_LANG || 'en',
    port: process.env.PORT || process.env.VCAP_APP_PORT || 3000,
    mongoURI: process.env.MONGODB_URI,
    admin: process.env.ADMINISTRATOR_NICKNAME || 'dcversus',
    selfName: process.env.SELF_NAME || 'ботий',
    youtube: {
        clientId: process.env.CLIENT_ID,
        cliendSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
    },
    discord: {
        color: '0xf9690e',
        authToken: process.env.DISCORD_AUTH_TOKEN,
        warsBaseRoleId: process.env.WARS_BASE_ROLE_ID,
        warsRoleId: process.env.WARS_ROLE_ID,
        warsChannelId: process.env.WARS_CHANNEL_ID,
        broadcastChannelId: process.env.BROADCAST_CHANNEL_ID,
        userFields: ['username', 'id', 'discriminator', 'bot', 'avatar'],
    },
};
