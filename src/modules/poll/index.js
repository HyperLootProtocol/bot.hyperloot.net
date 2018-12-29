
const { hri } = require('human-readable-ids');
const moment = require('moment');
const isEqual = require('lodash/isEqual');
const command = require('../command');

const addPoll = async function (response, {
    getModuleData,
    updateModuleData,
    id,
    i18n,
}) {
    const { args: { question, options } } = response;
    const { pollsList = [] } = await getModuleData('poll');
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

    if (!poll) {
        response.output = i18n('poll.notfound', { requestedPollId });
        return response;
    }

    if (!poll.isOpen) {
        response.output = i18n('poll.closed');
    }

    const { votesList = [] } = await getModuleData('poll');

    const votesCount = votesList.filter(v => v.pollId === poll.pollId).length;

    const {
        dateCreated,
        question,
        options,
        pollId,
    } = poll;

    const date = moment(dateCreated).format('DD/MM');

    let output = i18n('poll.header', {
        date,
        question,
        votesCount,
        pollId,
    });

    output += options.map((option) => {
        const optionVotes = votesList.filter(v => (v.pollId === pollId && v.option === poll.options.indexOf(option))).length;
        const percentage = optionVotes / votesCount * 100 || 0;
        return i18n('poll.line', {
            option,
            optionVotes,
            percentage,
        });
    }).join('');
    response.output += output;
    return response;
};

const listPolls = async function (response, {
    i18n,
    getModuleData,
}) {
    const { pollsList = [], votesList = [] } = await getModuleData('poll');

    if (!pollsList.find(poll => poll.isOpen)) {
        response.output = i18n('poll.none');
        return response;
    }

    response.output = i18n('poll.list');

    pollsList.filter(poll => poll.isOpen).forEach((poll) => {
        const votesCount = votesList.filter(v => v.pollId === poll.pollId).length;
        const {
            dateCreated,
            question,
            options,
            pollId,
        } = poll;

        const date = moment(dateCreated).format('DD/MM');

        let output = i18n('poll.header', {
            date,
            question,
            votesCount,
            pollId,
        });

        output += options.map((option) => {
            const optionVotes = votesList.filter(v => (v.pollId === pollId && v.option === poll.options.indexOf(option))).length;
            const percentage = optionVotes / votesCount * 100 || 0;
            return i18n('poll.line', {
                option,
                optionVotes,
                percentage,
            });
        }).join('');
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
    }

    if (!poll.isOpen) {
        response.output = i18n('poll.alreadyclosed');
        return response;
    }

    const newList = pollsList.filter(p => p.pollId !== requestedPollId);

    poll.isOpen = false;

    newList.push(poll);

    if (!isEqual(pollsList, newList)) {
        updateModuleData('poll', {
            pollsList: newList,
        });
    }

    response.output = i18n('poll.close', { requestedPollId });
    return response;
};

const vote = async function (response, {
    i18n,
    id,
    getModuleData,
    updateModuleData,
}) {
    const { votesList = [], pollsList = [] } = await getModuleData('poll');
    const { args: { requestedPollId, requestedOption } } = response;

    const poll = pollsList.find(p => p.pollId === requestedPollId);

    if (!poll) {
        response.output = i18n('poll.notfound', { requestedPollId });
        return response;
    }

    if (!poll.isOpen) {
        response.output = i18n('poll.alreadyclosed');
        return response;
    }

    if (votesList.find(v => (v.pollId === requestedPollId && v.voterId === id))) {
        response.output = i18n('poll.alreadyvoted');
        return response;
    }

    if (poll.options.includes(requestedOption)) {
        const newVote = {
            voterId: id,
            pollId: requestedPollId,
            option: poll.options.indexOf(requestedOption),
            dateVoted: new Date(),
        };
        updateModuleData('poll', {
            votesList: [...votesList, newVote],
        });
        const optionText = requestedOption;
        response.output = i18n('vote.cast', {
            id,
            requestedPollId,
            optionText,
        });
        return response;
    }

    if (requestedOption - 1 >= 0 && requestedOption - 1 <= poll.options.length) {
        const newVote = {
            voterId: id,
            pollId: requestedPollId,
            option: parseInt(requestedOption, 10),
            dateVoted: new Date(),
        };
        updateModuleData('poll', {
            votesList: [...votesList, newVote],
        });
        const optionText = poll.options[requestedOption - 1];
        response.output = i18n('vote.cast', {
            id,
            requestedPollId,
            optionText,
        });
        return response;
    }

    response.output = i18n('vote.nosuchoption');
    return response;
};

module.exports = [
    [command('poll question ...options'), addPoll],
    [command('poll requestedPollId'), getPollById],
    [command('poll'), listPolls],
    [command('close requestedPollId'), closePoll],
    [command('vote requestedPollId requestedOption'), vote],
];
