module.exports = {
    PREFIX: '/',
    lang: process.env.BOT_LANG || 'en',
    mongoURI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hyperloot',
    url: process.env.APP_URL || 'https://bot-hyperloot.herokuapp.com:443',
    admin: process.env.ADMINISTRATOR_NICKNAME || 'dcversus',
    // telegram: {
    //     chatId: process.env.CHAT_ID || '-248926187',
    //     authToken: process.env.TELEGRAM_AUTH_TOKEN,
    //     webhookEndpoint: process.env.TELEGRAM_WEBHOOKENDPOINT || '',
    //     allowedStatuses: ['creator', 'administrator', 'member'],
    // },
    discord: {
        authToken: process.env.DISCORD_AUTH_TOKEN,
        broadcastChannelName: process.env.BROADCAST_CHANNEL_NAME,
    },
    // see: https://github.com/yagop/node-telegram-bot-api/issues/319#issuecomment-324963294
    NTBA_FIX_319: true,
};
