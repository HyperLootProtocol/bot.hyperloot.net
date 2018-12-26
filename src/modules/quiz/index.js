const isEqual = require('lodash/isEqual');

const command = require('../command');
const { discord: { broadcastChannelName } } = require('../../config');

async function addQuiz(response, {
    getModuleData,
    updateModuleData,
    id,
    i18n,
}) {
    const { args: { description, prize, answers } } = response;
    const { list = [] } = await getModuleData('quiz');

    const newQuiz = {
        authorId: id,
        isOpen: true,
        description,
        prize,
        answers,
        winnerId: null,
    };

    updateModuleData('quiz', {
        list: [...list, newQuiz],
    });

    response.output = [
        i18n('quiz.created'),
        { channelName: broadcastChannelName, message: i18n('quiz.info', { id, ...newQuiz }) },
    ];

    return response;
}

async function checkQuiz(response, {
    getModuleData,
    updateModuleData,
    input,
    id,
    i18n,
}) {
    const { list = [] } = await getModuleData('quiz');

    if (list.find(q => q.isOpen)) {
        const output = [];

        const newList = list.map((q) => {
            if (!q.answers.includes(input)) {
                return q;
            }

            if (!q.isOpen) {
                return q;
            }

            output.push(i18n('quiz.winner', { id, ...q }));
            output.push({ channelName: broadcastChannelName, message: i18n('quiz.winner', { id, ...q }) });

            return {
                ...q,
                isOpen: false,
                winnerId: id,
            };
        });

        if (!isEqual(list, newList)) {
            updateModuleData('quiz', {
                list: newList,
            });

            response.output = output;
        }
    }

    return response;
}

async function quizList(response, { getModuleData, i18n }) {
    const { list = [] } = await getModuleData('quiz');

    if (!list.find(q => q.isOpen)) {
        response.output = i18n('quiz.nope');

        return response;
    }

    response.output = i18n('quiz.list');
    response.output += list.filter(q => q.isOpen).map(q => i18n('quiz.listLine', q)).join('\n');

    return response;
}

module.exports = [
    [command('quiz'), quizList],
    [command('quiz description prize ...answers'), addQuiz],
    checkQuiz,
];
