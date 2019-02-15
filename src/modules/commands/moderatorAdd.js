const isModerator = require('../isModerator');
const command = require('../command.filter');

const moderatorAdd = async function (req, ctx) {
    const {
        i18n,
        getUser,
        getModuleData,
        updateModuleData,
        send,
    } = ctx;

    const { args: { moderatorId } } = req;
    const moderatorUser = await getUser(moderatorId);
    const data = await getModuleData('moderation', { user: moderatorUser });

    if (data && data.moderator) {
        send(i18n('moderatorAdd.alreadyExist', { id: moderatorId }));

        return req;
    }

    updateModuleData(
        'moderation',
        { moderator: true },
        { user: moderatorUser },
    );

    send(i18n('moderatorAdd.success', { id: moderatorId }));

    return req;
};

module.exports = [isModerator, command('moderatorAdd moderatorId'), moderatorAdd];
