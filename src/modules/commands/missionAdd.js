const { hri } = require('human-readable-ids');
const extend = require('lodash/extend');
const isEmpty = require('lodash/isEmpty');

const isModerator = require('../isModerator');
const command = require('../command.filter');

function parseJsonFromCli(str, msg = 'Something\'s went wrong, while parsing CLI argument') {
    try {
        return JSON.parse(str.replace(/'/g, '"'));
    } catch (e) {
        throw msg;
    }
}

// todo: move it somewhere
function getDiscordIdFromMention(mention) {
    // cutting off discord's <@id_here>
    const match = mention.match(/<@(.*)>/);

    return match && match[1];
}

function getCheckerDescription(ctx, values, checker) {
    // eslint-disable-next-line no-dynamic-require global-require
    const { getDescription } = require(`../missions/checkers/${checker}`);

    return getDescription && getDescription(ctx, values);
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
        const { values } = parseJsonFromCli(description);

        values.user = assigneeId || assignee;
        values.missionId = missionId;
        description = getCheckerDescription(ctx, values, checker);
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
        extend(query, { checkerSettings: parseJsonFromCli(checkerSettings) });
    }

    if (requirements) {
        extend(query, { requirements: parseJsonFromCli(requirements) });
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

    send(i18n('missionAdd.success', {
        id: missionId,
        description,
        reward,
        assignee: assignee === 'all' ? 'everyone' : assignee,
    }));

    return req;
};

const missionHelp = async function (req, ctx) {
    const { i18n, send } = ctx;

    send(i18n('missionAdd.help'));

    return req;
};

module.exports = [
    isModerator,
    [command('missionAdd'), missionHelp],
    [command('missionAdd ...options'), missionAdd],
];
