const { admin } = require('../config');

module.exports = async function error(request, { getModuleData }) {
    const { user } = request;
    const { moderator, username } = await getModuleData('moderation', { user });

    if (moderator || username === admin) {
        return request;
    }

    return null;
};
