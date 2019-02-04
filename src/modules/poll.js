const { hri } = require('human-readable-ids');
const moment = require('moment');
const { discord: { broadcastChannelName } } = require('../config');

const command = require('./command.filter');

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

    response.outputRich = {
        title: i18n('poll.createdTitle'),
        fields: [{ fieldTitle: i18n('poll.createdFieldTitle', { pollId }), fieldText: i18n('poll.createdFieldText') }],
    };
    response.output = [
        i18n('poll.created', { pollId }),
        { channelName: broadcastChannelName, message: i18n('poll.alert') },
    ];

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
        response.outputRich = {
            title: i18n('poll.notFoundTitle'),
            fields: [{
                fieldTitle: i18n('poll.notFoundFieldTitle', { requestedPollId }),
                fieldText: i18n('poll.notFoundFieldText'),
            }],
        };
        response.output = i18n('poll.notFound', { requestedPollId });
        return response;
    }

    if (!currentPoll.isOpen) {
        response.outputRich = {
            title: i18n('poll.closedTitle'),
            // fields: [{
            //     fieldTitle: i18n('poll.notFoundFieldTitle', { requestedPollId }),
            //     fieldText: i18n('poll.notFoundFieldText'),
            // }],
        };
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

    const fields = options.map((option) => {
        const optionVotes = votesList.filter(vote => (
            vote.pollId === pollId && vote.option === currentPoll.options.indexOf(option))).length;
        const percentage = (optionVotes / votesCount * 100 || 0).toFixed(2);

        return {
            fieldTitle: i18n('poll.optionFieldTitle', { option }),
            fieldText: i18n('poll.optionFieldText', { optionVotes, percentage }),
        };
    });

    const outputRich = {
        title: i18n('poll.titleHeader', {
            date, question, votesCount, pollId,
        }),
        fields,
    };
    response.outputRich = outputRich;

    let output = i18n('poll.header', {
        date,
        question,
        votesCount,
        pollId,
    });

    output += options.map((option) => {
        const optionVotes = votesList.filter(vote => (
            vote.pollId === pollId && vote.option === currentPoll.options.indexOf(option))).length;
        const percentage = (optionVotes / votesCount * 100 || 0).toFixed(2);

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
        response.outputRich = {
            title: i18n('poll.noneTitle'),
            fields: [{ fieldTitle: i18n('poll.noneFieldTitle'), fieldText: i18n('poll.noneFieldText') }],
        };
        response.output = i18n('poll.none');
        return response;
    }

    response.output = `${i18n('poll.list')}\n`;

    const outputRich = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const openedPoll of pollsList) {
        if (openedPoll.isOpen) {
            const votesCount = votesList.filter(vote => vote.pollId === openedPoll.pollId).length;
            const {
                dateCreated,
                question,
                options,
                pollId,
            } = openedPoll;
            const date = moment(dateCreated).format('DD/MM');

            const fields = options.map((option) => {
                const optionVotes = votesList.filter(vote => (
                    vote.pollId === pollId && vote.option === openedPoll.options.indexOf(option))).length;
                const percentage = (optionVotes / votesCount * 100 || 0).toFixed(2);

                return {
                    fieldTitle: i18n('poll.optionFieldTitle', { option }),
                    fieldText: i18n('poll.optionFieldText', { optionVotes, percentage }),
                };
            });
            outputRich.push({
                title: i18n('poll.titleHeader', {
                    date, question, votesCount, pollId,
                }),
                fields,
            });
        }
        response.outputRich = outputRich;
    }

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
            const optionVotes = votesList.filter(vote => (
                vote.pollId === pollId && vote.option === poll.options.indexOf(option))).length;
            const percentage = (optionVotes / votesCount * 100 || 0).toFixed(2);

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

    if (!currentPoll) {
        response.outputRich = {
            title: i18n('poll.notFoundTitle'),
            fields: [{
                fieldTitle: i18n('poll.notFoundFieldTitle', { requestedPollId }),
                fieldText: i18n('poll.notFoundFieldText'),
            }],
        };
        response.output = i18n('poll.notFound', { requestedPollId });
        return response;
    }

    if (!currentPoll.isOpen) {
        response.outputRich = {
            title: i18n('poll.alreadyClosedTitle'),
            fields: [{
                fieldTitle: i18n('poll.alreadyClosedFieldTitle'),
                fieldText: i18n('poll.alreadyClosedFieldText'),
            }],
        };
        response.output = i18n('poll.alreadyClosed');
        return response;
    }

    const newList = pollsList.filter(poll => poll.pollId !== requestedPollId);
    currentPoll.isOpen = false;
    newList.push(currentPoll);

    updateModuleData('poll', {
        pollsList: newList,
    });

    response.outputRich = {
        title: i18n('poll.closeTitle'),
        fields: [{
            fieldTitle: i18n('poll.closeFieldTitle', { requestedPollId }),
            fieldText: i18n('poll.closeFieldText'),
        }],
    };
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
        response.outputRich = {
            title: i18n('poll.notFoundTitle'),
            fields: [{
                fieldTitle: i18n('poll.notFoundFieldTitle', { requestedPollId }),
                fieldText: i18n('poll.notFoundFieldText'),
            }],
        };
        response.output = i18n('poll.notFound', { requestedPollId });
        return response;
    }

    if (!currentPoll.isOpen) {
        response.outputRich = {
            title: i18n('poll.alreadyClosedTitle'),
            fields: [{
                fieldTitle: i18n('poll.alreadyClosedFieldTitle'),
                fieldText: i18n('poll.alreadyClosedFieldText'),
            }],
        };
        response.output = i18n('poll.alreadyClosed');
        return response;
    }

    if (votesList.find(vote => (vote.pollId === requestedPollId && vote.voterId === id))) {
        response.outputRich = {
            title: i18n('poll.alreadyVotedTitle'),
            fields: [{
                fieldTitle: i18n('poll.alreadyVotedFieldTitle'),
                fieldText: i18n('poll.alreadyVotedFieldText'),
            }],
        };
        response.output = i18n('poll.alreadyVoted');
        return response;
    }
    const requestedOptionLower = requestedOption.toLowerCase();

    if (currentPoll.options.includes(requestedOptionLower)) {
        const newVote = {
            voterId: id,
            pollId: requestedPollId,
            option: currentPoll.options.indexOf(requestedOptionLower),
            dateVoted: new Date(),
        };

        updateModuleData('poll', {
            votesList: [...votesList, newVote],
        });

        const optionText = requestedOption;
        response.outputRich = {
            title: i18n('vote.castTitle'),
            fields: [{
                fieldTitle: i18n('vote.castFieldTitle'),
                fieldText: i18n('vote.castFieldText', { id, requestedPollId, optionText }),
            }],
        };
        response.output = i18n('vote.cast', {
            id,
            requestedPollId,
            optionText,
        });
        return response;
    }
    response.outputRich = {
        title: i18n('vote.noSuchOptionTitle'),
        fields: [{
            fieldTitle: i18n('vote.noSuchOptionFieldTitle'),
            fieldText: i18n('vote.noSuchOptionFieldText'),
        }],
    };
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
    const openedPolls = pollsList.filter(poll => poll.isOpen);
    const inputLower = input.toLowerCase();
    const inputLowerArray = inputLower.split(' ');

    if (!openedPolls.length) {
        return response;
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const openedPoll of openedPolls) {
        let findOption = false;

        // eslint-disable-next-line no-restricted-syntax
        for (const option of openedPoll.options) {
            if (votesList.find(vote => (vote.pollId === openedPoll.pollId && vote.voterId === id))) {
                break;
            }

            if (inputLowerArray.includes(option.toLowerCase())) {
                findOption = option;
            }
        }

        if (findOption) {
            const newVote = {
                voterId: id,
                pollId: openedPoll.pollId,
                option: openedPoll.options.indexOf(findOption),
                dateVoted: new Date(),
            };

            updateModuleData('poll', {
                votesList: [...votesList, newVote],
            });

            const optionText = findOption;
            const requestedPollId = openedPoll.pollId;
            response.outputRich = {
                title: i18n('vote.castTitle'),
                fields: [{
                    fieldTitle: i18n('vote.castFieldTitle'),
                    fieldText: i18n('vote.castFieldText', { id, requestedPollId, optionText }),
                }],
            };
            response.output = i18n('vote.cast', {
                id,
                requestedPollId,
                optionText,
            });
        }
    }
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
