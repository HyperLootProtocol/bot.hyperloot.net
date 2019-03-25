const { discord, mongoURI } = require('./config');

const App = require('./app');

const i18n = require('./i18n');
const dbMongo = require('./db/mongo');
const dbNedb = require('./db/nedb');
const discordAdapter = require('./adapters/discord');
const httpAdapter = require('./adapters/http');
const youtubeAdapter = require('./adapters/youtube');

const quiz = require('./modules/quiz');
const poll = require('./modules/poll');
const wars = require('./modules/wars');

const selfReact = require('./modules/selfReact');
const addExp = require('./modules/addExp');
const error = require('./modules/error');
const event = require('./modules/event');
const updateExp = require('./modules/updateExp');
const autoReaction = require('./modules/autoReaction');
const log = require('./modules/log');
const missionChecker = require('./modules/missions/missionChecker');

const ping = require('./modules/commands/ping');
const fight = require('./modules/commands/fight');
const echo = require('./modules/commands/echo');
const status = require('./modules/commands/status');
const moderatorAdd = require('./modules/commands/moderatorAdd');
const missionAdd = require('./modules/commands/missionAdd');
const missions = require('./modules/commands/missions');

const instance = new App();

instance
    .use([i18n])
    .use(mongoURI ? [dbMongo] : [dbNedb])
    .use([httpAdapter])
    .use([youtubeAdapter])
    .use(discord.authToken && [discordAdapter]);


instance.use([
    log,

    [
        event('message'),
        addExp(1),
        autoReaction,
    ],

    moderatorAdd,
    missionAdd,
    missions,
    fight,
    ping,
    echo,
    status,

    selfReact,

    quiz,
    poll,
    wars,
    // bets,

    missionChecker,
    updateExp,

    error,
]);
