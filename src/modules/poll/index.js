
const command = require('../command');

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
    const { list = [] } = await getModuleData('poll.polls');
    const pollId = list.length + 1;
    const newPoll = {
        authorId: id,
        isOpen: true,
        question,
        options,
        pollId,
        dateCreated: new Date(),
    };

    updateModuleData('poll.polls', {
        list: [...list, newPoll],
    });
    // TODO use human-readable-ids

    response.output = i18n('poll.created', { pollId });

    return response;
};

/**
 * getPollById() implements the poll info logic
 * the function gets info about a poll by it's mneumonic id
 * usage /poll ID
 */
const getPollById = async function (response, {
    getModuleData,
    i18n,
}) {
    const { args: { pollId } } = response;

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
    const { list = [] } = await getModuleData('poll.polls');

    if (!list.find(poll => poll.isOpen)){
        response.output = i18n('poll.none');
        return response;
    };

    response.output = i18n('poll.list');

    list.filter(poll => poll.isOpen).forEach(async function(poll){
        const {votesList = [] } = await getModuleData('poll.votes');

        const votes = votesList.filter(vote => vote.pollId === poll.pollId).length;

        const {
            dateCreated,
            question,
            options,
            pollId,
            isOpen,
        } = poll;
        const day = poll.dateCreated.getDate();
        const month = poll.dateCreated.getMonth() + 1;

        let output = i18n('poll.header', {
            day,
            month,
            question,
            votes,
            pollId,
        });

        response.output += output;
    });
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
    getModuleData,
    // updateModuleData,
}) {
    const { args: { pollId } } = response;
    const { list = [] } = await getModuleData('poll.polls');

    if (!list.find(poll => poll.isOpen)){
        response.output = i18n('poll.none');
        return response;
    };

    const newList = list.filter(poll => poll.pollId === pollId)

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
    const { list = [] } = await getModuleData('poll.votes');

    const { args: { pollId, option } } = response;
    const newVote = {
        voterId: id,
        pollId,
        option,
        dateVoted: new Date(),
    };
    updateModuleData('poll.votes', {
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
