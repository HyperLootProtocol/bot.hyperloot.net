
const command = require('../command');

const addPoll = async function (response, {
    getModuleData,
    updateModuleData,
    id,
    i18n,
}) {
    const { args: { question, options } } = response;
    const { list = [] } = await getModuleData('poll.polls');
    // TODO use human-readable-ids
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

    response.output = i18n('poll.created', { pollId });

    return response;
};

const getPollById = async function (response, {
    getModuleData,
    i18n,
}) {
    const { list = [] } = await getModuleData('poll.polls');
    const { args: { pollId } } = response;
        list.filter(poll => poll.isOpen).forEach(async function(poll){
        const { votesList = [] } = await getModuleData('poll.votes');
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

        output += options.map(option => {
            const optionVotes = votesList.filter(vote => vote.pollId === pollId && vote.option === option).length;
            const percentage =  optionVotes / votes || 0;
            return i18n('poll.line', { option, percentage });
        })
        response.output += output;
    });
    return response;
};

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
        const { votesList = [] } = await getModuleData('poll.votes');
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

        output += options.map(option => {
            const optionVotes = votesList.filter(vote => vote.pollId === pollId && vote.option === option).length;
            const percentage =  optionVotes / votes || 0;
            return i18n('poll.line', { option, percentage });
        })
        response.output += output;
    });
    return response;
};

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
