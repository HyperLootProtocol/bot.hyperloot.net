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

const quiz = async function (request, {
    getModuleData,
    i18n,
    send,
}) {
    const { quizList = [] } = await getModuleData('quiz');
    const openQuizList = quizList.filter(quizOpen => quizOpen.isOpen === true);
    if (isEmpty(openQuizList)) {
        send(i18n('quiz.nope'));
        return request;
    }

    openQuizList.forEach((quizs) => {
        send(i18n('quiz.listLine', {
            description: quizs.description,
            prize: quizs.prize,
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
    const openQuizList = quizList.filter(quizs => quizs.isOpen === true);

    openQuizList.forEach((quizs) => {
        if (inputLower.includes(quizs.answer.toLowerCase())) {
            const winnerAnswer = quizs.answer;
            const winnerPrize = quizs.prize;
            send(i18n('quiz.winner', { userId, winnerAnswer, winnerPrize }));

            const filteredQuiz = quizList.filter(filtQuiz => filtQuiz.answer !== quizs.answer);
            const closeQuiz = {
                ...quizs,
                isOpen: false,
                winnerId: userId,
            };
            updateModuleData('quiz', {
                quizList: [
                    ...filteredQuiz,
                    closeQuiz,
                ],
            });
        }
    });
    return request;
};

module.exports = [
    [command('quiz'), quiz],
    [command('addQuiz description prize answer'), addQuiz],
    checkQuiz,
];
