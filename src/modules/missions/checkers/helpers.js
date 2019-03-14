async function closeMission({ set }, id) {
    await set(
        'global',
        { moduleName: 'missions', 'list.id': id },
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

module.exports = {
    closeMission,
    sendSuccessMessage,
};
