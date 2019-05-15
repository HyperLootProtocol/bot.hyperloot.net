const shuffle = require('lodash/shuffle');
const command = require('../filters/command');

function getTimeDiff(dt1, dt2) {
    const secs = (dt2.getTime() - dt1.getTime()) / 1000;
    const mins = secs / 60;
    return Math.abs(Math.round(mins));
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const setupDuel = async function (request, context) {
    const {
        updateModuleData,
        send,
    } = context;
    const { user, args: { opponent } } = request;

    const [, opponentId] = opponent.match(/<@(.*)>/);

    if (!opponentId) {
        return request;
    }

    const userId = user.id;
    const time = new Date();

    updateModuleData('duels', {
        [opponentId]: { userId, time },
    });

    updateModuleData('id', {
        duelerid: opponentId,
    });

    send(`${opponent}, ты вызван на дуэль! Теперь напиши 'да' или 'окей', чтобы принять свою смерть...`);

    return request;
};

const checkDuel = async function (request, context) {
    const {
        i18n,
        getModuleData,
        send,
    } = context;
    const { user, input } = request;

    const id = await getModuleData('id');
    const opponentId = id.duelerid;
    const duels = await getModuleData('duels');
    const reply = input.toLowerCase();
    const agreeVariants = i18n('agree', { _allKeys: true });

    if (!duels[opponentId] || !duels[opponentId].userId) {
        return request;
    }

    if (duels[opponentId].userId && agreeVariants.includes(reply) && duels[opponentId].time) {
        const curTime = new Date();
        const diff = getTimeDiff(duels[opponentId].time, curTime);
        console.log(diff);
        if (diff === 0 || diff === 5) {
            const dueler1 = `<@${user.id}>`;
            const dueler2 = `<@${duels[opponentId].userId}>`;

            send(i18n('duel.hasBegun', { dueler1, dueler2 }));

            const duelers = [`<@${user.id}>`, `<@${duels[opponentId].userId}>`];
            const [winner, loser] = shuffle(duelers);

            await timeout(1000);
            send('3');
            await timeout(1000);
            send('2');
            await timeout(1000);
            send('1');
            await timeout(1000);

            send(i18n('duel.wins', { winner, loser }));

            return request;
        }

        if (diff > 5 || diff !== 0) {
            return request;
        }
    }

    return request;
};

module.exports = [
    [command('duel opponent'), setupDuel],
    checkDuel,
];
