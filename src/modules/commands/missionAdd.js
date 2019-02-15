const { hri } = require('human-readable-ids');
const extend = require('lodash/extend');
const isEmpty = require('lodash/isEmpty');

const isModerator = require('../isModerator');
const command = require('../command.filter');

// todo: move it somewhere
function getDiscordIdFromMention(mention) {
    // cutting off discord's <@id_here>
    const match = mention.match(/<@(.*)>/);

    return match && match[1];
}

const missionAdd = async function (req, ctx) {
    const {
        i18n,
        getModuleData,
        updateModuleData,
        push,
    } = ctx;

    const {
        args: { options },
    } = req;

    const [assignee, checker, description, reward, checkerSettings, requirements, iteration] = options;
    const assigneeId = getDiscordIdFromMention(assignee);

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

    const missionId = hri.random();

    const query = {
        id: missionId,
        assignee: assigneeId || assignee,
        checker,
        description,
        reward,
    };

    extend(query, { iteration: iteration || false });

    if (checkerSettings) {
        extend(query, { checkerSettings: JSON.parse(checkerSettings.replace(/'/g, '"')) });
    }

    if (requirements) {
        extend(query, { requirements: JSON.parse(requirements.replace(/'/g, '"')) });
    }

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

    req.output = i18n('missionAdd.success', {
        id: missionId,
        description,
        reward,
        assignee: assignee === 'all' ? 'everyone' : assignee,
    });

    return req;
};

module.exports = [
    isModerator,
    [command('missionAdd ...options'), missionAdd],
];
