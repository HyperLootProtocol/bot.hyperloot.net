const {
    closeMission,
    sendSuccessMessage,
} = require('./helpers');

const CHECKER_NAME = 'manualChecker';

async function check(ctx, missionId) {
    const { getModuleData } = ctx;
    const data = await getModuleData(CHECKER_NAME);

    return data && data[missionId] === 'checked';
}

async function linkChecker(req, ctx) {
    const { userId } = req;
    let { missions } = req;

    missions = missions.filter(mission => mission.checker === CHECKER_NAME);

    // eslint-disable-next-line no-restricted-syntax
    for (const mission of missions) {
        if (await check(ctx, mission.id)) {
            closeMission(ctx, mission.id);
            sendSuccessMessage(ctx, userId, mission);

            req.exp += parseInt(mission.reward, 10);
        }
    }

    return req;
}

module.exports = linkChecker;
