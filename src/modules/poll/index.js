
const command = require('../command');
// const { discord: { broadcastChannelName } } = require('../../config');

/**
 * reusable function to form an output string, containing the info about a single poll
 */
const getPollStringInfo = function (i18n, {
    dateCreated,
    question,
    options,
    pollId,
    isOpen,
}) {
    const day = dateCreated.getDate();
    const month = dateCreated.getMonth();

    const status = isOpen ? 'open' : 'closed';
    // TODO get real votes count from db
    // all votes = filter(poll: pollId), maybe store? cause need it soon enough
    const votes = 15;

    let output = i18n('poll.header', {
        day,
        month,
        question,
        status,
        votes,
        pollId,
    });

    output += options.map((option) => {
        // TODO get real percentage from db
        // all votes = filter(poll: pollId)
        // relevant votes = filter(poll: pollId, option = options[i])
        // must keep in mind that percentage should round up in the way that sum is 100%
        const percentage = 10;
        return i18n('poll.option', { option, percentage });
    });
    return output;
};

/**
 * addPoll() implements the polls creation logic
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
    // TODO use human-readable-ids
    const pollId = 1;
    response.output = i18n('poll.created', { pollId });

    return response;
};

/**
 * getPollById() implements the poll info logic
 * the function gets info about a poll by it's mneumonic id
 * usage /poll ID
 */
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

/**
 * pollsList() implements getting existing polls list feature
 * used by simply typing /poll
 * outputs only isOpen: true polls, for closed polls use getPollById
 */
const pollsList = async function (response, {
    i18n,
    getModuleData,
}) {
    // get list of existing polls from db
    // iterate through them applying getPollStringInfo
    const { list = [] } = await getModuleData('poll');
    list.map(poll => getPollStringInfo({ poll }));
    response.output = i18n('list polls');
    return response;
};

/**
 * closePoll() is used to close poll by it's mneumonic id
 * usage: /close ID
 * the status is chaged to isOpen: false, poll stays in DB
 * results are still visible by typing
 */
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

/**
 * vote() is used to cast a new vote for an option in a poll
 * usage /vote pollId option(text or optionId)
 */
const vote = async function (response, {
    i18n,
    id,
    getModuleData,
    updateModuleData,
}) {
    const { list = [] } = await getModuleData('vote');

    const { args: { pollId, option } } = response;
    const newVote = {
        voterId: id,
        pollId,
        option,
        dateVoted: new Date(),
    };
    updateModuleData('vote', {
        list: [...list, newVote],
    });
    response.output = i18n('vote', { id, pollId, option });
    return response;
};

module.exports = [
    [command('poll question ...options'), addPoll],
    [command('poll pollId'), getPollById],
    [command('poll'), pollsList],
    [command('close pollId'), closePoll],
    [command('vote pollId option'), vote],
];
