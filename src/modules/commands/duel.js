const isEmpty = require('lodash/isEmpty');
const command = require('../command.filter');

const duelling = async function (request, context) {
    const { i18n, send, getUser } = context;
    const { user, args: userId } = request;

    const user1 = user;
    const user2 = await getUser(userId);

    if (isEmpty(user2)) {
        send(i18n('duel.userisnotdefined', { id: user1 }));

        return request;
    }

    if (user2 === user1) {
        send(i18n('duel.cantduelauthor', { id: user1 }));

        return request;
    }

    const users = [];
    await users.push(user1);
    await users.push(user2);

    const winner = users[Math.floor(Math.random * users.length)];

    send(i18n('duel.wins', { id: winner }));

    return request;
};
module.exports = [
    [command('duel user2'), duelling],
    [command('duel'), duelling],
];
