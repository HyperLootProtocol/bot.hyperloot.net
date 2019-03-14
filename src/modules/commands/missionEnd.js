const isEmpty = require('lodash/isEmpty');
const filter = require('lodash/filter');

const command = require('../command.filter');
const isModerator = require('../isModerator');

const missionEnd = async function (req, ctx) {
    const {
        i18n,
        send,
        set,
    } = ctx;

    const { targetMission } = req;

    await set(
        'global',
        { moduleName: 'missions', 'list.id': targetMission.id },
        {
            'list.$.closed': true,
        },
    );

    send({
        embed: {
            title: i18n('endMission.title'),
            description: i18n('endMission.description'),
        },
    });

    return req;
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
        send(i18n('endMission.wrongId'));

        return null;
    }

    if (data.length > 1) {
        send(i18n('endMission.collision'));

        return null;
    }

    const targetMission = data[0];

    if (targetMission.closed) {
        send(i18n('endMission.alreadyClosed'));

        return null;
    }

    req.targetMission = targetMission;

    return req;
};

module.exports = [isModerator, command('missionEnd missionId'), getMission, missionEnd];
