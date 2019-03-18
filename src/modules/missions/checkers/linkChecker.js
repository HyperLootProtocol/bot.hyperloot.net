const buildUrl = require('build-url');

const { url } = require('../../../config');
const {
    checkAndUpdateRequirements,
    closeMission,
    sendSuccessMessage,
} = require('./helpers');

const CHECKER_NAME = 'linkChecker';
const REDIRECT_MAP = {
    google: 'http://google.com',
};

async function check(ctx, missionId) {
    const { getModuleData } = ctx;
    const data = await getModuleData(CHECKER_NAME);

    return data && data[missionId] === 'clicked';
}

async function linkChecker(req, ctx) {
    const { userId } = req;
    let { missions } = req;

    missions = missions.filter(mission => mission.checker === CHECKER_NAME);

    // eslint-disable-next-line no-restricted-syntax
    for (const mission of missions) {
        if (await check(ctx, mission.id) && await checkAndUpdateRequirements(req, ctx, mission)) {
            closeMission(ctx, mission);
            sendSuccessMessage(ctx, userId, mission);

            req.exp += parseInt(mission.reward, 10);
        }
    }

    return req;
}

linkChecker.__INIT__ = function (context) {
    const {
        express,
        updateModuleData,
    } = context;

    express.get('/redirect', async (req, res) => {
        const { target, missionId } = req.query;
        const redirectUrl = REDIRECT_MAP[target];

        res.redirect(redirectUrl);

        updateModuleData(CHECKER_NAME, {
            [missionId]: 'clicked',
        });
    });
};

linkChecker.getDescription = function (ctx, options) {
    const { i18n } = ctx;
    const { target, user, missionId } = options;
    const targetUrl = buildUrl(url, {
        path: 'redirect',
        queryParams: {
            target,
            user,
            missionId,
        },
    });

    return i18n('linkChecker.description', { targetUrl, user });
};

module.exports = linkChecker;
