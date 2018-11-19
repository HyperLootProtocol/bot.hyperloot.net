module.exports = {
    PREFIX: '/',
    mongoURI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hyperloot',
    url: process.env.APP_URL || 'https://bot-hyperloot.herokuapp.com:443',
    admin: process.env.ADMINISTRATOR_NICKNAME || 'dcversus',
    telegram: {
        chatId: process.env.CHAT_ID || '-248926187',
        authToken: process.env.TELEGRAM_AUTH_TOKEN,
        webhookEndpoint: process.env.TELEGRAM_WEBHOOKENDPOINT || '',
        allowedStatuses: ['creator', 'administrator', 'member'],
    },
    discord: {
        webhookEndpoint: process.env.DISCORD_WEBHOOKENDPOINT,
        // authToken: process.env.DISCORD_AUTH_TOKEN || 'NDc5Njg4MTcwODM3OTAxMzcx.Dlyd6Q.dCvaAquznBiAQAaZSQXQFyAx9k8',
        // botId: '511203690544365609',
        // greetingsChannelId: process.env.GREETING_CHANNEL_ID || '510871958104309770',
        // guildId: process.env.GUILD_ID || '450987902667718656',
        // test
        authToken: 'NDc5Njg4MTcwODM3OTAxMzcx.DspLDQ.1-Ve9-_Gqeih623USmwWxFwvz2w',
        botId: '479688170837901371',
        greetingsChannelId: '511318565308071952',
        guildId: '292411714069331969',
    },
    // see: https://github.com/yagop/node-telegram-bot-api/issues/319#issuecomment-324963294
    NTBA_FIX_319: true,
};
