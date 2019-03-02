const isEmpty = require('lodash/isEmpty');
const command = require('./command.filter');


const addQuiz = async function (request, {
    getModuleData,
    updateModuleData,
    i18n,
    send,
}) {
    const { args: { description, prize, answer } } = request;

    const { quizList = [] } = await getModuleData('quiz');
    const newQuiz = {
        isOpen: true,
        description,
        prize,
        answer,
        winnerId: null,
    };

    updateModuleData('quiz', {
        quizList: [...quizList,
            newQuiz],
    });
    send(i18n('quiz.info', { description, prize }));
    return request;
};

const quizs = async function (request, {
    getModuleData,
    i18n,
    send,
}) {
    const { quizList = [] } = await getModuleData('quiz');
    const openQuizList = quizList.filter(quizOpen => quizOpen.isOpen === true);
    if (isEmpty(openQuizList)) {
        send(i18n('quiz.noActive'));
        return request;
    }

    openQuizList.forEach((quiz) => {
        send(i18n('quiz.listLine', {
            description: quiz.description,
            prize: quiz.prize,
        }));
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
            const winnerAnswer = quiz.answer;
            const winnerPrize = quiz.prize;
            send(i18n('quiz.winner', { userId, winnerAnswer, winnerPrize }));

            const filteredQuiz = quizList.filter(filtQuiz => filtQuiz.answer !== quiz.answer);
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
    [command('quiz'), quizs],
    [command('addQuiz description prize answer'), addQuiz],
    checkQuiz,
];
