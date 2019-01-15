const { discord, mongoURI } = require('./config');

const App = require('./app');

const i18n = require('./i18n');
const dbMongo = require('./db/mongo');
const dbNedb = require('./db/nedb');
const discordAdapter = require('./adapters/discord');
const httpAdapter = require('./adapters/http');

const bets = require('./modules/bets');
const quiz = require('./modules/quiz');
const poll = require('./modules/poll');

const addExp = require('./modules/addExp');
const error = require('./modules/error');
const event = require('./modules/event');
const logText = require('./modules/logText');
const updateExp = require('./modules/updateExp');
const autoReaction = require('./modules/autoReaction');
const log = require('./modules/log');

const pong = require('./modules/commands/pong');
const status = require('./modules/commands/status');

const instance = new App();

instance
    .use([i18n])
    .use(mongoURI ? [dbMongo] : [dbNedb])
    .use([httpAdapter])
    .use(discord.authToken && [discordAdapter]);


instance.use([
    log,

    [
        event('message'),
        addExp(1),
        autoReaction,
        logText,
    ],

    pong,
    status,
    quiz,
    poll,
    bets,

    updateExp,

    error,
]);
