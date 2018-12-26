
const command = require('./command');
const { discord: { broadcastChannelName } } = require('../config');

const getPoll = function (id) {
    if (id in polls) {
        return polls[id];
    }
    return polls;
};

const getPollStringInfo = function (_poll, { i18n }) {
    const day = _poll.dateCreated.getDate();
    const month = _poll.dateCreated.getMonth();
    const question = _poll.question;
    // TODO get real votes count from db
    const votes = 15;
    const pollId = _poll.pollId;
    let _output = i18n('pollInfo', {
        day,
        month,
        question,
        votes,
        pollId,
    });

    for (let i = 0; i < _poll.answers.length; i++) {
        const answer = _poll.answers[i];
        // TODO get real percentage from db
        const percentage = 10;
        _output += i18n('answerInfo', { answer, percentage });
        if (i < _poll.answers.length - 1) {
            _output += ' | ';
        }
    }

    return _output;
};

/**
 * poll() implements the polls logic
 * input line for creating a poll should look like /poll 'question sentence' answer1 'answer 2' ...
 * quotes are used to ignore spaces inside the arguments
 */
const addPoll = async function (response, { 
    getModuleData,
    updateModuleData,
    id, 
    i18n
}) {
    const { args: { question, answers } } = response;
    const { list = [] } = await getModuleData('poll');

    const newPoll = {
        authorId: id,
        isOpen: true,
        question,
        answers,
        dateCreated: new Date(),
    };

    updateModuleData('poll', {
        list: [...list, newPoll],
    })
    console.log(newPoll)
    response.output = [
        i18n('pollCreated', { pollId }),

        // { channelName: broadcastChannelName, message: i18n('quiz.info', { id, ...newQuiz }) },
    ];

    return response;
};

const getPollById = async function (response, {
    getModuleData,
    i18n
}) {
    const { args: {pollId} } = response;
    response.output = getPollStringInfo(getPoll(pollId));
    return response;
};

const pollsList = async function(response, { i18n }){
    response.output = 'list polls';
    return response;
};

module.exports = [
    [command('poll question ...answers'), addPoll],
    [command('poll pollId'), getPollById],
    [command('poll'), pollsList],
];
