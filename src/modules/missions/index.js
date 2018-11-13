const map = require('lodash/map');
const get = require('lodash/get');
const {PREFIX} = require('../../config');

const bitcointalk = require('./bitcointalk');
const blogpost = require('./blogpost');
const gamedev = require('./gamedev');
const integration = require('./integration');
const reddit = require('./reddit');
const redditpost = require('./redditpost');
const steemitpost = require('./steemitpost');
const videopost = require('./videopost');

const linkedin = require('./linkedin');
const facebook = require('./facebook');

const discord = require('./discord');
const telegram = require('./telegram');
const twitter = require('./twitter');

const missions = [
//     bitcointalk,
    blogpost,
    gamedev,
    integration,
    reddit,
    redditpost,
    steemitpost,
    videopost,

    linkedin,
    facebook,

    discord,
    telegram,
    twitter,
];

const missionIniter = async function(response, context) {
    const { db, id, i18n, input } = context;

    const mission = missions.filter(({ command }) => input.startsWith(`${PREFIX}${command}`))[0];
    if (!mission) {
        return response;
    }

    const { user } = response;
    const data = get(user, `data.${mission.command}`, {});

    if (data.completed) {
        throw(i18n('completed'));
    }

    if (mission.init) {
        response = await mission.init(response, context);
    }

    if (mission.needAnswer || mission.needModeration) {
        db.users.update({
            telegramId: id,
        }, {
            $set: {
                pending: mission.command,
            },
        });

        response.pendingInited = true;
    }

    response.output = i18n(mission.brief);

    return response;
};

const missionChecker = async function(response, context) {
    const { user, pendingInited } = response;
    // TODO: take a look at commands
    const { input, db, id, i18n, username } = context;

    // we init something mission
    if (pendingInited) {
        return response;
    }

    // any time reset pending
    db.users.update({
        telegramId: id,
    }, {
        $set: {
            pending: false,
        },
    });

    // any command reset checker
    const fullCommandsList = [
        ...missions.map(mission => mission.command),
        // ...commands.map(({command}) => command),
    ];

    const inputedCommand = fullCommandsList.filter(command => input.startsWith(`${PREFIX}${command}`))[0];
    if(inputedCommand) {
        return response;
    }

    // mission checker body
    const mission = missions.filter(({ command }) => user.pending === command)[0];
    if (!mission) {
        return response;
    }

    const data = get(user, `data.${mission.command}`, {});

    if (data.completed) {
        return response;
    }

    if (mission.needModeration) {
        db.moderation.insert({
            username,
            id,
            command: mission.command,
            answer: input,
        });

        response.output = i18n('sendToModeration');
    }

    if(mission.checker) {
        const checked = await mission.checker(context);

        let balance = user.balance;
        let output = i18n(mission.failed, {username});

        if (checked) {
            balance = user.balance + mission.reward;
            output = i18n(mission.complete, {username});
        }

        db.users.update({
            telegramId: id,
        }, {
            $set: {
                pending: false,
                balance,
                [`data.${mission.command}`]: {
                    answer: input,
                    completed: checked,
                },
            },
        });

        response.output = output;
    }

    if (mission.final) {
        response = mission.final(response, context);
    }

    return response;
};

const missionList = async function(response, { input, db, id, i18n }) {
    const {user} = response;

    if (!user) {
        throw(i18n('noLogged'));
    }

    response.output =
        map(missions, mission => i18n('missionInfo', {
            PREFIX,
            completed: get(user, `data.${mission.command}.completed`) ? '✅' : '',
            command: mission.command,
            reward: mission.reward,
            help: i18n(mission.help),
        }))
        .join('\n');

    return response;
};

missionList.command = 'list';

module.exports = [missionIniter, missionChecker, missionList];
module.exports.missions = missions;
