const { hri } = require('human-readable-ids');
const moment = require('moment');
const isEmpty = require('lodash/isEmpty');
const get = require('lodash/get');

const command = require('./command.filter');
const isModerator = require('./isModerator');

const { PREFIX } = require('../config');

const addPoll = async function (request, {
    i18n,
    send,
    updateModuleData,
    getModuleData,
}) {
    const { args: { description, options } } = request;
    const pollId = hri.random();
    let broadcastMsg = null;

    const { pollList = [] } = await getModuleData('poll');

    const message = await send(i18n('poll.created', { pollId }));
    const systemChannelID = get(message, 'channel.guild.systemChannelID');

    if (systemChannelID) {
        const {
            id,
        } = await send(i18n('poll.created', { pollId }));

        broadcastMsg = ['discord', systemChannelID, id];
    }

    const newPoll = {
        description,
        options,
        id: pollId,
        isOpen: true,
        broadcastMsg,
        dateCreated: new Date(),
    };

    updateModuleData('poll', {
        pollList: [
            ...pollList,
            newPoll,
        ],
    });


    return request;
};

const votePoll = async function (request, {
    i18n,
    send,
    updateModuleData,
    getModuleData,
}) {
    const {
        args: {
            requestedPollId,
            requestedOption,
        } = {},
        userId,
        input,
    } = request;

    // inline vote check case, ignore if it not parsed case of command call
    if (input.startsWith(PREFIX) && !requestedOption) {

        return request;
    }

    const inputLower = input.toLowerCase();
    const { voteList = [], pollList = [] } = await getModuleData('poll');
    let filteredPollList = [];
    let option = requestedOption;

    if (requestedPollId) {
        filteredPollList = pollList.filter(poll => poll.id === requestedPollId && poll.isOpen === true);
    }

    if (!requestedPollId) {
        filteredPollList = pollList.filter(poll => poll.isOpen === true);
    }

    // user input contains something in opened polls
    if (!requestedOption) {
        filteredPollList = filteredPollList.filter(poll =>
            poll.options.find(
                (pollOption) => {
                    const finded = inputLower.includes(pollOption.toLowerCase());

                    if (finded) {
                        option = pollOption;
                    }

                    return finded;
                }
            )
        )
    }

    // not direct vote and doesnt find any match in user input - silent skip
    if (!requestedOption && isEmpty(filteredPollList)) {

        return;
    }

    const poll = filteredPollList.find(pollOption => pollOption.options.includes(option));

    if (!poll) {
        send({
            embed: {
                title: i18n('poll'),
                description: i18n('vote.noSuchOption'),
            },
        });

        return request;
    }

    const prevVoted = voteList.find(vote => vote.userId === userId && vote.pollId === poll.id);
    if (prevVoted && requestedOption) {
        send({
            embed: {
                title: i18n('poll'),
                description: i18n('vote.alreadyVoted'),
            },
        });

        return request;
    }

    // we voted, BUT not request direct command!
    if (prevVoted && !requestedOption) {
        return request;
    }

    const newVote = {
        option,
        userId,
        pollId: poll.id,
    };

    updateModuleData('poll', {
        voteList: [
            ...voteList,
            newVote,
        ],
    });

    send({
        embed: {
            title: i18n('poll'),
            description: i18n('vote.cast', {
                userId,
                option,
                requestPollId: newVote.pollId,
            }),
        },
    });

    return request;
};

const polls = async function (request, { i18n, send, getModuleData }) {
    const { pollList = [], voteList = [] } = await getModuleData('poll');
    const { args: { requestedPollId } } = request;
    let filteredPollList = [];

    if (requestedPollId) {
        filteredPollList = pollList.filter(poll => poll.id === requestedPollId && poll.isOpen);
    } else {
        filteredPollList = pollList.filter(poll => poll.isOpen);
    }

    if (isEmpty(filteredPollList)) {
        send(i18n('poll.none'));
        return request;
    }

    filteredPollList.forEach((poll) => {
        const votes = voteList.filter(vote => poll.id === vote.pollId);
        const votesCount = votes.length;

        const optionResults = poll.options.map((option) => {
            const results = votes.filter(vote => vote.option === option);
            const percentage = (results.length / votesCount * 100 || 0).toFixed(2);

            return {
                name: option,
                value: percentage,
            };
        });

        send({
            embed: {
                title: i18n('poll.info', {
                    date: moment(poll.dateCreated).format('DD/MM'),
                    description: poll.description,
                    votesCount,
                    pollId: poll.id,
                }),
                fields: optionResults
            }
        });
    });

    return request;
};

const closePoll = async function (request, {
    i18n,
    send,
    getModuleData,
    updateModuleData,
}) {
    const { pollList = [] } = await getModuleData('poll');
    const { args: { requestedPollId } } = request;

    const requestedPoll = pollList.find(poll => poll.id === requestedPollId);

    if (!requestedPoll) {
        send(i18n('poll.notFound', { requestedPollId }));
        return request;
    }

    const filteredList = pollList.filter(poll => poll.id !== requestedPollId);
    const closedPoll = {
        ...requestedPoll,
        isOpen: false,
    };

    updateModuleData('poll', {
        pollList: [
            ...filteredList,
            closedPoll,
        ],
    });

    send(i18n('poll.close', { requestedPollId }));

    return request;
};

module.exports = [
    votePoll,

    [isModerator, command('addPoll description ...options'), addPoll],
    [isModerator, command('closePoll requestedPollId'), closePoll],
    [command('polls'), polls],
    [command('polls requestedPollId'), polls],
    [command('votePoll requestedOption'), votePoll],
    [command('votePoll requestedPollId requestedOption'), votePoll],
];
