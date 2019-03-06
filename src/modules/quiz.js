const { hri } = require('human-readable-ids');
const isEmpty = require('lodash/isEmpty');
const command = require('./command.filter');

const { discord: { broadcastChannelId } } = require('../config');

const addQuiz = async function (request, {
    getModuleData,
    updateModuleData,
    i18n,
    send,
}) {
    const { args: { description, prize, answer } } = request;
    const quizId = hri.random();
    let broadcastMsg = null;

    const { quizList = [] } = await getModuleData('quiz');

    send({
        embed: {
            title: i18n('quiz'),
            description: i18n('quiz.info', { description, prize, quizId }),
        },
    });

    if (broadcastChannelId) {
        const message = send({
            to: ['discord', broadcastChannelId],
            embed: {
                title: i18n('quiz'),
                description: i18n('quiz.info', { description, prize, quizId }),
            },
        });

        if (message) {
            broadcastMsg = ['discord', broadcastChannelId, message.id];
        }
    }

    const newQuiz = {
        isOpen: true,
        description,
        prize,
        answer,
        winnerId: null,
        broadcastMsg,
        id: quizId,
    };

    updateModuleData('quiz', {
        quizList: [
            ...quizList,
            newQuiz,
        ],
    });

    return request;
};

const showQuizList = async function (request, {
    getModuleData,
    i18n,
    send,
}) {
    const { args: { id } } = request;
    const { quizList = [] } = await getModuleData('quiz');
    let filteredQuizList = quizList.filter(quiz => quiz.isOpen === true);

    if (id) {
        filteredQuizList = quizList.filter(quiz => quiz.id === id);
    }

    if (isEmpty(filteredQuizList)) {
        send({
            embed: {
                title: i18n('quiz'),
                description: i18n('quiz.noActive'),
            },
        });

        return request;
    }

    const fields = filteredQuizList.map(quiz => [
        `(${quiz.id}) ${quiz.description}`,
        quiz.prize,
    ]);

    send({
        embed: {
            title: i18n('quiz'),
            fields,
        },
    });

    return request;
};

const checkQuiz = async function (request, {
    updateModuleData,
    getModuleData,
    i18n,
    send,
}) {
    const { input, userId } = request;
    const { quizList = [] } = await getModuleData('quiz');
    const inputLower = input.toLowerCase();
    const openQuizList = quizList.filter(quiz => quiz.isOpen === true);

    openQuizList.forEach((quiz) => {
        if (inputLower.includes(quiz.answer.toLowerCase())) {
            const { answer, prize } = quiz;
            send({
                embed: {
                    title: i18n('quiz'),
                    description: i18n('quiz.winner', { userId, answer, prize }),
                },
            });

            const filteredQuiz = quizList.filter(elem => elem.id !== quiz.id);

            const closedQuiz = {
                ...quiz,
                isOpen: false,
                winnerId: userId,
            };

            updateModuleData('quiz', {
                quizList: [
                    ...filteredQuiz,
                    closedQuiz,
                ],
            });
        }
    });

    return request;
};

module.exports = [
    [command('quiz'), showQuizList],
    [command('quiz id'), showQuizList],
    [command('addQuiz description prize answer'), addQuiz],
    checkQuiz,
];
