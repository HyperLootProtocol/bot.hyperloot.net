const isEmpty = require('lodash/isEmpty');
const filter = require('lodash/filter');

const command = require('../command.filter');

const missions = async function (req, ctx) {
    const {
        userId,
    } = req;

    const {
        getModuleData,
        i18n,
        send,
    } = ctx;

    let { list: data } = await getModuleData('missions');

    data = filter(data, mission => !mission.closed);
    data = filter(data, mission => mission.assignee === 'all' || mission.assignee === userId);

    if (isEmpty(data)) {
        send(i18n('missions.empty'));

        return req;
    }

    data.forEach((mission) => {
        const {
            id: missionId,
            description,
            reward,
            details,
        } = mission;

        send(i18n('missions.list', {
            id: missionId,
            description,
            reward,
            details,
        }));
    });

    return req;
};

module.exports = [command('missions'), missions];
