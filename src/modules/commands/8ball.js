const isEmpty = require('lodash/isEmpty');
const command = require('../command.filter');

const eightball = async function (request, context) {
    const { i18n, send } = context;
    const { args: { question } } = request;

    if (question.includes('?')) {
        send({
            embed: {
                title: question,
                description: i18n('eighball.answer'),
            },
        });
    } else {
        send(i18n('eighball.noquestion'));
    }
    if (isEmpty(question)) {
        send(i18n('eighball.noquestion'));
    }

    return request;
};
module.exports = [
    [command('8ball'), eightball],
    [command('8ball question'), eightball],
];
