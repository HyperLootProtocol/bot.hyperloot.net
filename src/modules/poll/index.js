
const command = require('../command');
const hri = require('human-readable-ids').hri;
const isEqual = require('lodash/isEqual');

const addPoll = async function (response, {
    getModuleData,
    updateModuleData,
    id,
    i18n,
}) {
    const { args: { question, options } } = response;
    const { pollsList = [] } = await getModuleData('poll');
    // TODO use human-readable-ids
    const pollId = hri.random();
    const newPoll = {
        authorId: id,
        isOpen: true,
        question,
        options,
        pollId,
        dateCreated: new Date(),
    };

    updateModuleData('poll', {
        pollsList: [...pollsList, newPoll],
    });

    response.output = i18n('poll.created', { pollId });

    return response;
};

const getPollById = async function (response, {
    getModuleData,
    i18n,
}) {
    const { args: { requestedPollId } } = response;
    const { pollsList = [] } = await getModuleData('poll');

    const poll = pollsList.find(p => p.pollId === requestedPollId);

    if (!poll){
        response.output = i18n('poll.notfound', { requestedPollId });
        return response;
    };

    if (!poll.isOpen){
        response.output = i18n('poll.closed');
    }

    const { votesList = [] } = await getModuleData('poll');

    const votesCount = votesList.filter(v => v.pollId === poll.pollId).length;

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
        votesCount,
        pollId,
    });

    output += options.map(option => {
        const optionVotes = votesList.filter(vote => vote.pollId === pollId && vote.option === option).length;
        const percentage =  optionVotes / votesCount * 100 || 0;
        return i18n('poll.line', { option, optionVotes, percentage });
    })
    response.output += output;
    return response;
};

const pollsList = async function (response, {
    i18n,
    getModuleData,
}) {
    const { pollsList = [] } = await getModuleData('poll');
    const { votesList = [] } = await getModuleData('poll');

    if (!pollsList.find(poll => poll.isOpen)){
        response.output = i18n('poll.none');
        return response;
    };

    response.output = i18n('poll.list');

    pollsList.filter(poll => poll.isOpen).forEach(async function(poll){
        const votesCount = votesList.filter(vote => vote.pollId === poll.pollId).length;
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
            votesCount,
            pollId,
        });

        output += options.map(option => {
            const optionVotes = votesList.filter(vote => vote.pollId === pollId && vote.option === option).length;
            const percentage =  optionVotes / votesCount * 100 || 0;
            return i18n('poll.line', { option, optionVotes, percentage });
        })
        response.output += output;
    });
    return response;
};

const closePoll = async function (response, {
    i18n,
    getModuleData,
    updateModuleData,
}) {
    const { args: { requestedPollId } } = response;
    const { pollsList = [] } = await getModuleData('poll');

    const poll = pollsList.find(p => p.pollId === requestedPollId);

    if (!poll) {
        response.output = i18n('poll.notfound', { requestedPollId });
        return response;
    };

    if (!poll.isOpen) {
        response.output = i18n('poll.alreadyclosed');
        return response;
    }

    const newList = pollsList.filter(poll => poll.pollId !== requestedPollId);

    poll.isOpen = false;

    newList.push(poll);

    if (!isEqual(pollsList, newList)) {
        updateModuleData('poll', {
            pollsList: newList,
        });
    };

    response.output = i18n('poll.close', { requestedPollId });
    return response;
};

const vote = async function (response, {
    i18n,
    id,
    getModuleData,
    updateModuleData,
}) {
    const { votesList = [] } = await getModuleData('poll');
    const { args: { pollId, option } } = response;
    const newVote = {
        voterId: id,
        pollId,
        option,
        dateVoted: new Date(),
    };
    updateModuleData('poll', {
        votesList: [...votesList, newVote],
    });
    response.output = i18n('vote', { id, pollId, option });
    return response;
};

module.exports = [
    [command('poll question ...options'), addPoll],
    [command('poll requestedPollId'), getPollById],
    [command('poll'), pollsList],
    [command('close requestedPollId'), closePoll],
    [command('vote pollId option'), vote],
];
