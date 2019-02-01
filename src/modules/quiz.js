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

    response.outputRich = {
        title: i18n('quiz.creatTitle'),
        fields: [{ fieldTitle: i18n('quiz.creatFieldTitle'), fieldText: i18n('quiz.creatFieldText') }],
    };
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
            response.outputRich = {
                title: i18n('quiz.winTitle'),
                fields: [{
                    fieldTitle: i18n('quiz.winFieldTitle', { ...openedQuiz }),
                    fieldText: i18n('quiz.winFieldText', { id, ...openedQuiz }),
                }],
            };
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
            title: i18n('quiz.nopeTitle'),
            fields: [{ fieldTitle: i18n('quiz.nopeFieldTitle'), fieldText: i18n('quiz.nopeFieldText') }],
        };
        response.output = i18n('quiz.nope');

        return response;
    }
    response.outputRich = {
        title: i18n('quiz.listTitle'),
        fields: [{
            fieldTitle: 'Creator',
            fieldText: list.filter(q => q.isOpen).map(q => `<@${q.authorId}>`),
        },
        {
            fieldTitle: 'Description',
            fieldText: list.filter(q => q.isOpen).map(q => `${q.description}`),
        },
        {
            fieldTitle: 'Prize',
            fieldText: list.filter(q => q.isOpen).map(q => `${q.prize}`),
        },
        ],
    };

    response.output = i18n('quiz.list');
    response.output += list.filter(q => q.isOpen).map(q => i18n('quiz.listLine', q)).join('\n');

    return response;
}

module.exports = [
    [command('quiz'), quizList],
    [command('quiz description prize ...answers'), addQuiz],
    checkQuiz,
];
