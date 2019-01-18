const { hri } = require('human-readable-ids');
const moment = require('moment');
const isEqual = require('lodash/isEqual');

const command = require('./command.filter');

const addBets = async function (response, {
    getModuleData,
    updateModuleData,
    id,
    i18n,
}) {
    const { args: { eventBets, options } } = response;
    const { betsList = [] } = await getModuleData('bets');
    const betsId = hri.random();
    const newBets = {
        authorId: id,
        isOpen: true,
        eventBets,
        options,
        betsId,
        dateCreated: new Date(),
    };

    updateModuleData('bets', {
        betsList: [...betsList, newBets],
    });

    response.output = i18n('bets.created', { betsId });

    return response;
};

const getBetsById = async function (response, {
    getModuleData,
    i18n,
}) {
    const { args: { requestedBetsId } } = response;
    const { betsList = [] } = await getModuleData('bets');

    const currentBets = betsList.find(bets => bets.betsId === requestedBetsId);
    if (!currentBets) {
        response.output = i18n('bets.notFound', { requestedBetsId });
        return response;
    }

    if (!currentBets.isOpen) {
        response.output = i18n('bets.closed');
    }

    const { votesListBets = [] } = await getModuleData('bets');

    const votesCount = votesListBets.filter(vote => vote.betsId === currentBets.betsId).length;

    const {
        dateCreated,
        eventBets,
        options,
        betsId,
    } = currentBets;

    const date = moment(dateCreated).format('DD/MM');

    let output = i18n('bets.header', {
        date,
        eventBets,
        votesCount,
        betsId,
    });

    output += options.map((option) => {
        const optionVotes = votesListBets.filter(vote => (vote.betsId === betsId && vote.option === currentBets.options.indexOf(option))).length;
        const percentage = optionVotes / votesCount * 100 || 0;

        return i18n('bets.line', {
            option,
            optionVotes,
            percentage,
        });
    }).join('');
    response.output += output;
    return response;
};

const listBets = async function (response, {
    i18n,
    getModuleData,
}) {
    const { betsList = [], votesListBets = [] } = await getModuleData('bets');

    if (!betsList.find(bets => bets.isOpen)) {
        response.output = i18n('bets.none');
        return response;
    }

    response.output = `${i18n('bets.list')}\n`;

    betsList.filter(bets => bets.isOpen).forEach((bets) => {
        const votesCount = votesListBets.filter(vote => vote.betsId === bets.betsId).length;
        const {
            dateCreated,
            eventBets,
            options,
            betsId,
        } = bets;

        const date = moment(dateCreated).format('DD/MM');

        let output = i18n('bets.header', {
            date,
            eventBets,
            votesCount,
            betsId,
        });

        output += options.map((option) => {
            const optionVotes = votesListBets.filter(vote => (vote.betsId === betsId && vote.option === bets.options.indexOf(option))).length;
            const percentage = optionVotes / votesCount * 100 || 0;

            return i18n('bets.line', {
                option,
                optionVotes,
                percentage,
            });
        }).join('');

        response.output += `${output}\n`;
    });
    return response;
};

const closeBets = async function (response, {
    i18n,
    getModuleData,
    updateModuleData,
}) {
    const { args: { requestedBetsId } } = response;
    const { betsList = [], votesListBets = [] } = await getModuleData('bets');
    const winOption = 2;
    const currentBets = betsList.find(bets => bets.betsId === requestedBetsId);
    console.log(currentBets, votesListBets, '\n');
    const [winList] = votesListBets.filter(voterId => voterId.betsId === requestedBetsId && voterId.option === winOption);
    console.log(winList);

    if (!betsList.find(bets => bets.isOpen)) {
        response.output = i18n('bets.none');
        return response;
    }

    if (!currentBets) {
        response.output = i18n('bets.notFound', { requestedBetsId });
        return response;
    }

    if (!currentBets.isOpen) {
        response.output = i18n('bets.alreadyClosed');
        return response;
    }

    const newList = betsList.filter(bets => bets.betsId !== requestedBetsId);
    currentBets.isOpen = false;
    newList.push(currentBets);

    if (!isEqual(betsList, newList)) {
        updateModuleData('bets', {
            betsList: newList,
        });
    }

    const winId = winList.voterId;
    response.output = i18n('bets.close', { requestedBetsId, winId });
    console.log(winList.voterId);
    return response;
};

const castVoteBets = async function (response, {
    i18n,
    id,
    getModuleData,
    updateModuleData,
}) {
    const { votesListBets = [], betsList = [] } = await getModuleData('bets');
    const { args: { requestedBetsId, requestedOption } } = response;

    const currentBets = betsList.find(bets => bets.betsId === requestedBetsId);

    if (!currentBets) {
        response.output = i18n('bets.notFound', { requestedBetsId });
        return response;
    }

    if (!currentBets.isOpen) {
        response.output = i18n('bets.alreadyClosed');
        return response;
    }

    if (votesListBets.find(vote => (vote.betsId === requestedBetsId && vote.voterId === id))) {
        response.output = i18n('bets.alreadyVoted');
        return response;
    }

    if (currentBets.options.includes(requestedOption)) {
        const newVote = {
            voterId: id,
            betsId: requestedBetsId,
            option: currentBets.options.indexOf(requestedOption),
            dateVoted: new Date(),
        };

        updateModuleData('bets', {
            votesListBets: [...votesListBets, newVote],
        });

        const optionText = requestedOption;
        response.output = i18n('vote.castBets', {
            id,
            requestedBetsId,
            optionText,
        });
        return response;
    }

    const optionIndex = requestedOption - 1;

    if (optionIndex >= 0 && optionIndex < currentBets.options.length) {
        const newVote = {
            voterId: id,
            betsId: requestedBetsId,
            option: parseInt(requestedOption, 10),
            dateVoted: new Date(),
        };

        updateModuleData('bets', {
            votesListBets: [...votesListBets, newVote],
        });

        const optionText = currentBets.options[requestedOption - 1];
        response.output = i18n('vote.castBets', {
            id,
            requestedBetsId,
            optionText,
        });
        return response;
    }

    response.output = i18n('vote.noSuchOptionBets');
    return response;
};

const checkVoteBets = async function (response, {
    getModuleData,
    updateModuleData,
    input,
    id,
    i18n,
}) {
    const { betsList = [], votesListBets = [] } = await getModuleData('bets');

    if (!betsList.find(bets => bets.isOpen)) {
        return response;
    }

    betsList.filter(bets => bets.isOpen).forEach((bets) => {
        if (votesListBets.find(vote => (vote.betsId === bets.betsId && vote.voterId === id))) {
            return;
        }

        if (bets.options.includes(input)) {
            const newVote = {
                voterId: id,
                betsId: bets.betsId,
                option: bets.options.indexOf(input),
                dateVoted: new Date(),
            };

            updateModuleData('bets', {
                votesListBets: [...votesListBets, newVote],
            });

            const optionText = input;
            const requestedBetsId = bets.betsId;
            response.output = i18n('vote.castBets', {
                id,
                requestedBetsId,
                optionText,
            });
            return;
        }

        const inputIndex = input - 1;

        if (inputIndex >= 0 && inputIndex < bets.options.length) {
            const newVote = {
                voterId: id,
                betsId: bets.betsId,
                option: parseInt(input, 10),
                dateVoted: new Date(),
            };

            updateModuleData('bets', {
                votesListBets: [...votesListBets, newVote],
            });

            const optionText = bets.options[input - 1];
            const requestedBetsId = bets.betsId;
            response.output = i18n('vote.castBets', {
                id,
                requestedBetsId,
                optionText,
            });
        }
    });
    return response;
};

module.exports = [
    [command('bets eventBets ...options'), addBets],
    [command('bets requestedBetsId'), getBetsById],
    [command('bets'), listBets],
    [command('closeBets requestedBetsId'), closeBets],
    [command('voteBets requestedBetsId requestedOption'), castVoteBets],
    checkVoteBets,
];
