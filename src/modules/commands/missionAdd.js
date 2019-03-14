const { hri } = require('human-readable-ids');
const extend = require('lodash/extend');
const isEmpty = require('lodash/isEmpty');
const buildUrl = require('build-url');

const isModerator = require('../isModerator');
const command = require('../command.filter');

// todo: move it somewhere
function getDiscordIdFromMention(mention) {
    // cutting off discord's <@id_here>
    const match = mention.match(/<@(.*)>/);

    return match && match[1];
}

// todo: move it somewhere | prbbly to checker. Unification
function modifySettings(originalSettings, checker, missionId) {
    if (checker === 'linkChecker') {
        // eslint-disable-next-line no-param-reassign
        originalSettings.missionId = missionId;
    }

    return originalSettings;
}

// todo: move it somewhere | prbbly to checker. Unification
function modifyDescriptionValues(values, checker, missionId, assignee) {
    if (checker === 'linkChecker') {
        // eslint-disable-next-line no-param-reassign
        values.url = buildUrl('http://127.0.0.1:3000', {
            path: 'redirect',
            queryParams: {
                target: values.target,
                userId: assignee,
                missionId,
            },
        });
    }

    return values;
}

// todo: move it somewhere | prbbly to checker. Unification
function modifyMission(mission) {
    if (mission.checker === 'linkChecker') {
        extend(mission, { indirect: true });
    }

    return mission;
}

const missionAdd = async function (req, ctx) {
    const missionId = hri.random();
    const {
        i18n,
        getModuleData,
        updateModuleData,
        push,
        send,
    } = ctx;

    const {
        args: { options },
    } = req;
    const [assignee, checker, originalDescription, reward, checkerSettings, requirements, iteration] = options;
    const assigneeId = getDiscordIdFromMention(assignee);
    let description = originalDescription;

    if (isEmpty(assignee)) {
        throw i18n('missionAdd.noUser');
    }

    if (isEmpty(checker)) {
        throw i18n('missionAdd.noChecker');
    }

    if (isEmpty(description)) {
        throw i18n('missionAdd.noDescription');
    }

    if (isEmpty(reward)) {
        throw i18n('missionAdd.noReward');
    }

    try {
        const { key, values } = JSON.parse(description.replace(/'/g, '"'));

        values.user = assignee;
        modifyDescriptionValues(values, checker, missionId, assigneeId || assignee);
        description = i18n(key, values);
    } catch (e) {
        description = originalDescription;
    }

    const query = {
        id: missionId,
        assignee: assigneeId || assignee,
        checker,
        description,
        reward,
    };

    extend(query, { iteration: iteration || false });
    if (checkerSettings) {
        const parsedCheckerSettings = JSON.parse(checkerSettings.replace(/'/g, '"'));

        modifySettings(parsedCheckerSettings, checker, missionId);
        extend(query, { checkerSettings: parsedCheckerSettings });
    }

    if (requirements) {
        extend(query, { requirements: JSON.parse(requirements.replace(/'/g, '"')) });
    }

    modifyMission(query);

    const missionsData = await getModuleData('missions');

    if (isEmpty(missionsData)) {
        await updateModuleData(
            'missions',
            { list: [] },
        );
    }

    // TODO: encapsulate?
    await push(
        'global',
        { moduleName: 'missions' },
        { list: query },
    );

    send(i18n('missionAdd.success', {
        id: missionId,
        description,
        reward,
        assignee: assignee === 'all' ? 'everyone' : assignee,
    }));

    return req;
};

module.exports = [
    isModerator,
    [command('missionAdd ...options'), missionAdd],
];
