const { adminDiscordId } = require('../config');

module.exports = async function error(request, { getModuleData }) {
    const { user } = request;
    const { moderator } = await getModuleData('moderation', { user });

    if (moderator || user.discordId === adminDiscordId) {
        return request;
    }

    return null;
};
