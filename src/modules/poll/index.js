
const command = require('../command');
const { discord: { broadcastChannelName } } = require('../../config');

const getPollStringInfo = function (i18n, {
    dateCreated,
    question,
    options,
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

    for (let i = 0; i < options.length; i++) {
        const option = options[i];
        // TODO get real percentage from db
        const percentage = 10;
        output += i18n('poll.option', { option, percentage });
        if (i < options.length - 1) {
            output += ' | ';
        }
    }

    return output;
};

/**
 * poll() implements the polls logic
 * input line for creating a poll should look like /poll 'question sentence' option1 'option 2' ...
 * quotes are used to ignore spaces inside the arguments
 */
const addPoll = async function (response, {
    getModuleData,
    updateModuleData,
    id,
    i18n,
}) {
    const { args: { question, options } } = response;
    const { list = [] } = await getModuleData('poll');

    const newPoll = {
        authorId: id,
        isOpen: true,
        question,
        options,
        dateCreated: new Date(),
    };

    updateModuleData('poll', {
        list: [...list, newPoll],
    });
    // TODO create something like semantic id for easy access
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

const closePoll = async function (response, {
    i18n,
    // getModuleData,
    // updateModuleData,
}) {
    const { args: { pollId } } = response;
    // test data
    const poll = {
        isOpen: true,
        id: pollId,
    };
    poll.isOpen = false;
    response.output = i18n('poll.close', { pollId });
    return response;
};

const vote = async function (response, {
    i18n,
    id,
    // getModuleData,
    // updateModuleData,
}) {
    const { args: { _pollId, _option } } = response;
    const newVote = {
        voterId: id,
        pollId: _pollId,
        option: _option,
        dateVoted: new Date(),
    };
    // test code
    console.log(newVote);

    response.output = i18n('vote', { id, _pollId, _option });
    return response;
};

module.exports = [
    [command('poll question ...options'), addPoll],
    [command('poll pollId'), getPollById],
    [command('poll'), pollsList],
    [command('close pollId'), closePoll],
    [command('vote pollId option'), vote],
];
