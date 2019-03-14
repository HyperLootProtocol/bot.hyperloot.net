const isEmpty = require('lodash/isEmpty');
const filter = require('lodash/filter');

const command = require('../command.filter');
const isModerator = require('../isModerator');

const missionCheck = async function (req, ctx) {
    const {
        updateModuleData,
    } = ctx;

    const { targetMission } = req;

    updateModuleData('manualChecker', {
        [targetMission.id]: 'checked',
    });
};

const getMission = async function (req, ctx) {
    const {
        getModuleData,
        i18n,
        send,
    } = ctx;
    const { args: { missionId } } = req;
    let { list: data } = await getModuleData('missions');

    data = filter(data, mission => mission.id === missionId);

    if (isEmpty(data)) {
        send(i18n('mission.wrongId', { missionId }));

        return null;
    }

    if (data.length > 1) {
        send(i18n('mission.collision', { missionId }));

        return null;
    }

    const targetMission = data[0];

    if (targetMission.closed) {
        send(i18n('mission.alreadyClosed'));

        return null;
    }

    req.targetMission = targetMission;

    return req;
};

module.exports = [isModerator, command('missionCheck missionId'), getMission, missionCheck];
