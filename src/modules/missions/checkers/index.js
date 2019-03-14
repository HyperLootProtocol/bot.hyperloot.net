const isEmpty = require('lodash/isEmpty');

const emptyChecker = require('./emptyChecker');
const linkChecker = require('./linkChecker');
const manualChecker = require('./manualChecker');

const getFitMissions = async function (req, ctx) {
    const { getModuleData } = ctx;
    const { userId } = req;
    let { list: missions = [] } = await getModuleData('missions');

    // todo: may be we want to have some indirect missions
    const fitAssignee = mission => mission.assignee === 'all' || mission.assignee === userId;
    const isOpened = mission => !mission.closed;

    missions = missions
        .filter(fitAssignee)
        .filter(isOpened);

    if (isEmpty(missions)) {
        return null;
    }

    req.missions = missions;

    return req;
};

module.exports = [
    getFitMissions,
    [
        emptyChecker,
        linkChecker,
        manualChecker,
    ],
];
