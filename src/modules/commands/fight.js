const isEmpty = require('lodash/isEmpty');
const random = require('lodash/sample');
const command = require('../command.filter');

const fights = async function (request, context) {
    const { i18n, send } = context;
    const { args: opponent } = request;

    if (isEmpty(opponent)) {
        send(i18n('fight.userisnotdefined'));

        return request;
    }
    const fighters = ['you', opponent];
    const winner = random(fighters);
    const loser = random(fighters);

    send(i18n('fight.wins', { win: { winner }, lose: { loser } }));

    return request;
};
module.exports = [command('fight opponent'), fights];
