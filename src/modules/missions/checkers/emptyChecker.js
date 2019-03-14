module.exports = async function missionChecker(req, ctx) {
    const CHECKER_NAME = 'emptyChecker';
    const {
        i18n,
        send,
        set,
    } = ctx;

    const { userId } = req;
    let { missions } = req;
    missions = missions.filter(mission => mission.checker === CHECKER_NAME);

    // eslint-disable-next-line no-restricted-syntax
    for (const mission of missions) {
        await set(
            'global',
            { moduleName: 'missions', 'list.id': mission.id },
            { 'list.$.closed': true },
        );

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

        req.exp += parseInt(mission.reward, 10);
    }

    return req;
};
