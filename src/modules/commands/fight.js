const isEmpty = require('lodash/isEmpty');
const shuffle = require('lodash/shuffle');
const command = require('../command.filter');

const fights = async function (request, context) {
    const { i18n, send } = context;
    const { user, args: { opponentId } } = request;

    const fighters = [user.id, opponentId];
    const [winner, loser] = shuffle(fighters);

    send(i18n('fight.wins', { winner, loser }));

    return request;
};

module.exports = [command('fight opponentId'), fights];
