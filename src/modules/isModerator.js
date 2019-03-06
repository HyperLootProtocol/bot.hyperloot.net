const { admin } = require('../config');

module.exports = async function error(request, { getModuleData }) {
    const { user } = request;
    const { moderator } = await getModuleData('moderation', { user });

    if (moderator || user.username === admin) {
        return request;
    }

    return null;
};
