
const command = require('../command');
const { discord: { broadcastChannelName } } = require('../../config');

const getPollStringInfo = function (i18n, {
    dateCreated,
    question,
    answers,
    pollId,
}) {
    const day = dateCreated.getDate();
    const month = dateCreated.getMonth();
    // TODO get real votes count from db
    const votes = 15;

    let output = i18n('poll.header', {
        day,
        month,
        question,
        votes,
        pollId,
    });

    for (let i = 0; i < answers.length; i++) {
        const answer = answers[i];
        // TODO get real percentage from db
        const percentage = 10;
        output += i18n('poll.answer', { answer, percentage });
        if (i < answers.length - 1) {
            output += ' | ';
        }
    }

    return output;
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
    i18n,
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
    });

    const pollId = 1;
    response.output = [
        i18n('poll.created', { pollId }),
        { channelName: broadcastChannelName, message: 'okay' },
    ];

    return response;
};

const getPollById = async function (response, {
    // getModuleData,
    i18n,
}) {
    const { args: { _pollId } } = response;
    // get poll object from db by pollId
    const poll = { pollId: _pollId };
    response.output = getPollStringInfo(i18n, { poll });
    return response;
};

const pollsList = async function (response, { i18n }) {
    // get list of existing polls from db
    // iterate through them applying getPollStringInfo

    response.output = i18n('list polls');
    return response;
};

module.exports = [
    [command('poll question ...answers'), addPoll],
    [command('poll pollId'), getPollById],
    [command('poll'), pollsList],
];
