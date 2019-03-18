const has = require('lodash/has');

async function closeMission({ set }, mission) {
    if (has(mission, 'requirements.cooldown')) {
        return;
    }

    await set(
        'global',
        { moduleName: 'missions', 'list.id': mission.id },
        { 'list.$.closed': true },
    );
}

async function sendSuccessMessage({ i18n, send }, userId, mission) {
    send({
        embed: {
            title: i18n('mission'),
            description: i18n('missionChecker.success', {
                user: `<@${userId}>`,
                missionId: mission.id,
                reward: mission.reward,
            }),
        },
    });
}

const isEmpty = require('lodash/isEmpty');
const defaults = require('lodash/defaults');

function checkOnCooldown(missionUserData) {
    const curDate = new Date();
    const { onCooldown, cooldownOff } = missionUserData;

    return onCooldown && (curDate < cooldownOff);
}

async function checkAndUpdateRequirements(req, ctx, mission) {
    if (isEmpty(mission.requirements)) {
        return req;
    }

    const { user } = req;

    const {
        getModuleData,
        updateModuleData,
    } = ctx;

    const userMissions = await getModuleData('missions', { user });
    const missionUserData = userMissions && userMissions[mission.id];

    const defaultValues = {
        count: 0,
        onCooldown: false,
    };

    let query = {
        id: mission.id,
        onCooldown: false,
    };

    let requirementsMet = true;
    let baseValues = defaults({}, defaultValues);

    if (!isEmpty(missionUserData)) {
        baseValues = missionUserData;
    }

    if (!checkOnCooldown(baseValues)) {
        baseValues.onCooldown = false;
    }

    if (baseValues.onCooldown) {
        return null;
    }

    if (!isEmpty(mission.requirements.count)) {
        query.count = baseValues.count + 1;
        if (query.count !== parseInt(mission.requirements.count, 10)) {
            requirementsMet = false;
        }
    }

    if (requirementsMet && mission.requirements.cooldown) {
        const curDate = new Date();
        query = defaults(
            {},
            {
                onCooldown: true,
                cooldownOff: new Date(curDate.getTime() + parseInt(mission.requirements.cooldown, 10)),
            },
            defaultValues,
        );
    }

    await updateModuleData(`missions.${mission.id}`, query, { user });

    return requirementsMet ? req : null;
}

module.exports = {
    checkAndUpdateRequirements,
    closeMission,
    sendSuccessMessage,
};
