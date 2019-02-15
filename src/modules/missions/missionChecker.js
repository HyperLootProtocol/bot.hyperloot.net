const defaults = require('lodash/defaults');
const filter = require('lodash/filter');
const isEmpty = require('lodash/isEmpty');

const checkers = require('./checkers');

function checkOnCooldown(missionUserData) {
    const curDate = new Date();
    const { onCooldown, cooldownOff } = missionUserData;

    return onCooldown && (curDate < cooldownOff);
}

// todo: refactor this sh*t?
async function checkAndUpdateRequirements(mission, req, ctx) {
    if (isEmpty(mission.requirements)) {
        return true;
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
        return false;
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

    return requirementsMet;
}

module.exports = async function missionChecker(req, ctx) {
    const {
        getModuleData,
        i18n,
        set,
        send,
    } = ctx;

    const { userId } = req;

    let { list: missions } = await getModuleData('missions');

    missions = filter(missions, mission => mission.assignee === 'all' || mission.assignee === userId);
    missions = filter(missions, mission => !mission.closed);

    // eslint-disable-next-line no-restricted-syntax
    for (const mission of missions) {
        const actualChecker = checkers[mission.checker];

        if (!actualChecker) {
            throw i18n('missionChecker.badChecker');
        }

        if (actualChecker(ctx, mission.checkerSettings) && await checkAndUpdateRequirements(mission, req, ctx)) {
            if (!mission.requirements.cooldown) {
                await set(
                    'global',
                    { moduleName: 'missions', 'list.id': mission.id },
                    { 'list.$.closed': true },
                );
            }

            send(i18n('missionChecker.success', {
                user: `<@${userId}>`,
                missionId: mission.id,
                reward: mission.reward,
            }));

            req.exp += parseInt(mission.reward, 10);
        }
    }

    return req;
};
