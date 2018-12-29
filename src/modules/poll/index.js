
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

    const currentPoll = pollsList.find(poll => poll.pollId === requestedPollId);

    if (!currentPoll) {
        response.output = i18n('poll.notFound', { requestedPollId });
        return response;
    }

    if (!currentPoll.isOpen) {
        response.output = i18n('poll.closed');
    }

    const { votesList = [] } = await getModuleData('poll');

    const votesCount = votesList.filter(vote => vote.pollId === currentPoll.pollId).length;

    const {
        dateCreated,
        question,
        options,
        pollId,
    } = currentPoll;

    const date = moment(dateCreated).format('DD/MM');

    let output = i18n('poll.header', {
        date,
        question,
        votesCount,
        pollId,
    });

    output += options.map((option) => {
        const optionVotes = votesList.filter(vote => (vote.pollId === pollId && vote.option === currentPoll.options.indexOf(option))).length;
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

    response.output = `${i18n('poll.list')}\n`;

    pollsList.filter(poll => poll.isOpen).forEach((poll) => {
        const votesCount = votesList.filter(vote => vote.pollId === poll.pollId).length;
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
            const optionVotes = votesList.filter(vote => (vote.pollId === pollId && vote.option === poll.options.indexOf(option))).length;
            const percentage = optionVotes / votesCount * 100 || 0;

            return i18n('poll.line', {
                option,
                optionVotes,
                percentage,
            });
        }).join('');

        response.output += `${output}\n`;
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

    const currentPoll = pollsList.find(poll => poll.pollId === requestedPollId);

    if (!pollsList.find(poll => poll.isOpen)) {
        response.output = i18n('poll.none');
        return response;
    }

    if (!currentPoll) {
        response.output = i18n('poll.notFound', { requestedPollId });
        return response;
    }

    if (!currentPoll.isOpen) {
        response.output = i18n('poll.alreadyClosed');
        return response;
    }

    const newList = pollsList.filter(poll => poll.pollId !== requestedPollId);
    currentPoll.isOpen = false;
    newList.push(currentPoll);

    if (!isEqual(pollsList, newList)) {
        updateModuleData('poll', {
            pollsList: newList,
        });
    }

    response.output = i18n('poll.close', { requestedPollId });
    return response;
};

const castVote = async function (response, {
    i18n,
    id,
    getModuleData,
    updateModuleData,
}) {
    const { votesList = [], pollsList = [] } = await getModuleData('poll');
    const { args: { requestedPollId, requestedOption } } = response;

    const currentPoll = pollsList.find(poll => poll.pollId === requestedPollId);

    if (!currentPoll) {
        response.output = i18n('poll.notFound', { requestedPollId });
        return response;
    }

    if (!currentPoll.isOpen) {
        response.output = i18n('poll.alreadyClosed');
        return response;
    }

    if (votesList.find(vote => (vote.pollId === requestedPollId && vote.voterId === id))) {
        response.output = i18n('poll.alreadyVoted');
        return response;
    }

    if (currentPoll.options.includes(requestedOption)) {
        const newVote = {
            voterId: id,
            pollId: requestedPollId,
            option: currentPoll.options.indexOf(requestedOption),
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

    const optionIndex = requestedOption - 1;

    if (optionIndex >= 0 && optionIndex < currentPoll.options.length) {
        const newVote = {
            voterId: id,
            pollId: requestedPollId,
            option: parseInt(requestedOption, 10),
            dateVoted: new Date(),
        };

        updateModuleData('poll', {
            votesList: [...votesList, newVote],
        });

        const optionText = currentPoll.options[requestedOption - 1];
        response.output = i18n('vote.cast', {
            id,
            requestedPollId,
            optionText,
        });
        return response;
    }

    response.output = i18n('vote.noSuchOption');
    return response;
};

const checkVote = async function (response, {
    getModuleData,
    updateModuleData,
    input,
    id,
    i18n,
}) {
    const { pollsList = [], votesList = [] } = await getModuleData('poll');

    if (!pollsList.find(poll => poll.isOpen)) {
        return response;
    }

    pollsList.filter(poll => poll.isOpen).forEach((poll) => {
        if (votesList.find(vote => (vote.pollId === poll.pollId && vote.voterId === id))) {
            return;
        }

        if (poll.options.includes(input)) {
            const newVote = {
                voterId: id,
                pollId: poll.pollId,
                option: poll.options.indexOf(input),
                dateVoted: new Date(),
            };

            updateModuleData('poll', {
                votesList: [...votesList, newVote],
            });

            const optionText = input;
            const requestedPollId = poll.pollId;
            response.output = i18n('vote.cast', {
                id,
                requestedPollId,
                optionText,
            });
            return;
        }

        const inputIndex = input - 1;

        if (inputIndex >= 0 && inputIndex < poll.options.length) {
            const newVote = {
                voterId: id,
                pollId: poll.pollId,
                option: parseInt(input, 10),
                dateVoted: new Date(),
            };

            updateModuleData('poll', {
                votesList: [...votesList, newVote],
            });

            const optionText = poll.options[input - 1];
            const requestedPollId = poll.pollId;
            response.output = i18n('vote.cast', {
                id,
                requestedPollId,
                optionText,
            });
        }
    });
    return response;
};

module.exports = [
    [command('poll question ...options'), addPoll],
    [command('poll requestedPollId'), getPollById],
    [command('poll'), listPolls],
    [command('close requestedPollId'), closePoll],
    [command('vote requestedPollId requestedOption'), castVote],
    checkVote,
];
