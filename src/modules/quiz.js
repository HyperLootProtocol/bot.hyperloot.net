const command = require('./command.filter');
const { discord: { broadcastChannelName } } = require('../config');

async function addQuiz(request, {
    getModuleData,
    updateModuleData,
    i18n,
}) {
    const {
        args: {
            description,
            prize,
            answers,
        },
        id,
    } = request;
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

    request.outputRich = {
        title: i18n('quiz.creatTitle'),
        fields: [{ fieldTitle: i18n('quiz.creatFieldTitle'), fieldText: i18n('quiz.creatFieldText') }],
    };
    //     { channelName: broadcastChannelName, message: { id, ...newQuiz } },

    // ];
    request.output = [
        i18n('quiz.created'),
        { channelName: broadcastChannelName, message: i18n('quiz.info', { id, ...newQuiz }) },
    ];

    return request;
}

async function checkQuiz(request, {
    getModuleData,
    updateModuleData,
    i18n,
}) {
    const { input, id } = request;
    const { list = [] } = await getModuleData('quiz');
    const openedQuizes = list.filter(quiz => quiz.isOpen);
    const inputLower = input.toLowerCase();
    const inputLowerArray = inputLower.split(' ');
    const output = [];

    if (!openedQuizes.length) {
        return request;
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
            request.outputRich = {
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

        request.output = output;
    }

    return request;
}

async function quizList(request, { getModuleData, i18n }) {
    const { list = [] } = await getModuleData('quiz');

    if (!list.find(q => q.isOpen)) {
        request.outputRich = {
            title: i18n('quiz.nopeTitle'),
            fields: [{ fieldTitle: i18n('quiz.nopeFieldTitle'), fieldText: i18n('quiz.nopeFieldText') }],
        };
        request.output = i18n('quiz.nope');

        return request;
    }
    request.outputRich = {
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

    request.output = i18n('quiz.list');
    request.output += list.filter(q => q.isOpen).map(q => i18n('quiz.listLine', q)).join('\n');

    return request;
}

module.exports = [
    [command('quiz'), quizList],
    [command('quiz description prize ...answers'), addQuiz],
    checkQuiz,
];
