const {
    closeMission,
    sendSuccessMessage,
} = require('./helpers');

const CHECKER_NAME = 'emptyChecker';

module.exports = async function missionChecker(req, ctx) {
    const { userId } = req;
    let { missions } = req;

    missions = missions.filter(mission => mission.checker === CHECKER_NAME);

    // eslint-disable-next-line no-restricted-syntax
    for (const mission of missions) {
        closeMission(ctx, mission.id);
        sendSuccessMessage(ctx, userId, mission);

        req.exp += parseInt(mission.reward, 10);
    }

    return req;
};
