const command = require('./command.filter');
const { discord: { broadcastChannelName } } = require('../config');

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

    response.outputRich = { head: 'Quiz created...', title: 'Waiting for the winner :)', fields: [''] };
    //     { channelName: broadcastChannelName, message: { id, ...newQuiz } },

    // ];
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
    const openedQuizes = list.filter(quiz => quiz.isOpen);
    const inputLower = input.toLowerCase();
    const inputLowerArray = inputLower.split(' ');
    const output = [];

    if (!openedQuizes.length) {
        return response;
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const openedQuiz of openedQuizes) {
        let findAnswer = false;

        // openedQuiz.answers = ['asd', 'LOQETUR']
        // inputLower = '23123 asd 123'

        // eslint-disable-next-line no-restricted-syntax
        for (const answer of openedQuiz.answers) {
            const answerLower = answer.toLowerCase();

            if (inputLowerArray.includes(answerLower)) {
                findAnswer = answerLower;
            }
        }

        if (findAnswer) {
            response.outputRich = ({
                head: '<@here> OUR WINNER `<@{id}>`!',
                title: 'The answer was {{answers}}!',
                fields: ['Reward {{prize}}!', 'Congratulations <3'],
            });
            output.push(i18n('quiz.winner', { id, ...openedQuiz }));
            output.push({
                channelName: broadcastChannelName,
                message: i18n('quiz.winner', { id, ...openedQuiz }),
            });
            // WARNING! list MUTATION!
            openedQuiz.isOpen = false;
        }
    }

    if (output.length) {
        updateModuleData('quiz', {
            list,
        });

        response.output = output;
    }

    return response;
}

async function quizList(response, { getModuleData, i18n }) {
    const { list = [] } = await getModuleData('quiz');

    if (!list.find(q => q.isOpen)) {
        response.outputRich = {
            title: 'NO QUIZ',
            fields: [{ fieldTitle: 'There are no active quiz', fieldText: 'Create one, go! go! go!' }],
        };
        response.output = i18n('quiz.nope');

        return response;
    }
    response.outputRich = {
        head: 'QUIZ LIST',
        titleCreator: 'Creator',
        fieldCreator: [list.filter(q => q.isOpen).map(q => `<@${q.authorId}>`)],
        titleDesc: 'Description',
        fieldDesc: [list.filter(q => q.isOpen).map(q => `${q.description}`)],
        titlePrize: 'Prize',
        fieldPrize: [list.filter(q => q.isOpen).map(q => `${q.prize}`)],
    };
    console.log(response.outputRich);
    console.log(typeof outputRich);

    response.output = i18n('quiz.list');
    response.output += list.filter(q => q.isOpen).map(q => i18n('quiz.listLine', q)).join('\n');

    return response;
}

module.exports = [
    [command('quiz'), quizList],
    [command('quiz description prize ...answers'), addQuiz],
    checkQuiz,
];
