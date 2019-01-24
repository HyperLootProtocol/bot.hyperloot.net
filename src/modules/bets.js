const { hri } = require('human-readable-ids');
const moment = require('moment');

const command = require('./command.filter');

const addBet = async function (response, {
    getModuleData,
    updateModuleData,
    id,
    i18n,
}) {
    const { args: { questionBet, options } } = response;
    const { betsList = [] } = await getModuleData('bets');
    const betId = hri.random();
    const getBetByIds = {
        authorId: id,
        isOpen: true,
        questionBet,
        options,
        betId,
        dateCreated: new Date(),
    };

    updateModuleData('bets', {
        betsList: [...betsList, getBetByIds],
    });

    response.output = i18n('bet.created', { betId });

    return response;
};

const getBetById = async function (response, {
    getModuleData,
    i18n,
}) {
    const { args: { requestedBetId } } = response;
    const { betsList = [] } = await getModuleData('bets');

    const currentBet = betsList.find(bet => bet.betId === requestedBetId);
    if (!currentBet) {
        response.output = i18n('bet.notFound', { requestedBetId });
        return response;
    }

    if (!currentBet.isOpen) {
        response.output = i18n('bet.closed');
    }

    const { votesListBets = [] } = await getModuleData('bets');

    const votesCount = votesListBets.filter(vote => vote.betId === currentBet.betId).length;

    const {
        dateCreated,
        questionBet,
        options,
        betId,
    } = currentBet;

    const date = moment(dateCreated).format('DD/MM');

    let output = i18n('bet.header', {
        date,
        questionBet,
        votesCount,
        betId,
    });

    output += options.map((option) => {
        const optionVotes = votesListBets.filter(vote => (
            vote.betId === betId && vote.option === currentBet.options.indexOf(option))).length;
        const percentage = optionVotes / votesCount * 100 || 0;

        return i18n('bet.line', {
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

    if (!betsList.find(bet => bet.isOpen)) {
        response.output = i18n('bet.none');
        return response;
    }

    response.output = `${i18n('bets.list')}\n`;

    betsList.filter(bet => bet.isOpen).forEach((bet) => {
        const votesCount = votesListBets.filter(vote => vote.betId === bet.betId).length;
        const {
            dateCreated,
            questionBet,
            options,
            betId,
        } = bet;

        const date = moment(dateCreated).format('DD/MM');

        let output = i18n('bet.header', {
            date,
            questionBet,
            votesCount,
            betId,
        });

        output += options.map((option) => {
            const optionVotes = votesListBets.filter(vote => (
                vote.betId === betId && vote.option === bet.options.indexOf(option))).length;
            const percentage = optionVotes / votesCount * 100 || 0;

            return i18n('bet.line', {
                option,
                optionVotes,
                percentage,
            });
        }).join('');

        response.output += `${output}\n`;
    });
    return response;
};

const closeBet = async function (response, {
    i18n,
    getModuleData,
    updateModuleData,
}) {
    const { args: { requestedBetId, winOption } } = response;
    const { betsList = [], votesListBets = [] } = await getModuleData('bets');
    const currentBet = betsList.find(bet => bet.betId === requestedBetId);
    const winList = votesListBets.filter(
        vote => vote.betId === requestedBetId && vote.option === winOption - 1,
    );

    if (!currentBet) {
        response.output = i18n('bet.notFound', { requestedBetId });
        return response;
    }

    if (!currentBet.isOpen) {
        response.output = i18n('bet.alreadyClosed');
        return response;
    }

    const newList = betsList.filter(bet => bet.betId !== requestedBetId);
    currentBet.isOpen = false;
    newList.push(currentBet);

    updateModuleData('bets', {
        betsList: newList,
    });


    if (winList.length === 0) {
        response.output = i18n('bet.closeNoWinner', { requestedBetId });
        return response;
    }

    const winners = winList.map(winner => `<@${winner.voterId}>`).join(', ');
    response.output = i18n('bet.close', { requestedBetId, winners });
    return response;
};

const castVoteBet = async function (response, {
    i18n,
    id,
    getModuleData,
    updateModuleData,
}) {
    const { votesListBets = [], betsList = [] } = await getModuleData('bets');
    const { args: { requestedBetId, requestedOption } } = response;

    const currentBet = betsList.find(bet => bet.betId === requestedBetId);

    if (!currentBet) {
        response.output = i18n('bet.notFound', { requestedBetId });
        return response;
    }

    if (!currentBet.isOpen) {
        response.output = i18n('bet.alreadyClosed');
        return response;
    }

    if (votesListBets.find(vote => (vote.betId === requestedBetId && vote.voterId === id))) {
        response.output = i18n('bet.alreadyVoted');
        return response;
    }

    const requestedOptionLower = requestedOption.toLowerCase();
    if (currentBet.options.includes(requestedOptionLower)) {
        const newVote = {
            voterId: id,
            betId: requestedBetId,
            option: currentBet.options.indexOf(requestedOptionLower),
            dateVoted: new Date(),
        };

        updateModuleData('bets', {
            votesListBets: [...votesListBets, newVote],
        });

        const optionText = requestedOption;
        response.output = i18n('vote.castBet', {
            id,
            requestedBetId,
            optionText,
        });
        return response;
    }
    response.output = i18n('vote.noSuchOptionBet');
    return response;
};

const checkVoteBet = async function (response, {
    getModuleData,
    updateModuleData,
    input,
    id,
    i18n,
}) {
    const { betsList = [], votesListBets = [] } = await getModuleData('bets');

    if (!betsList.find(bet => bet.isOpen)) {
        return response;
    }

    betsList.filter(bet => bet.isOpen).forEach((bet) => {
        if (votesListBets.find(vote => (vote.betId === bet.betId && vote.voterId === id))) {
            return;
        }

        const inputLower = input.toLowerCase();
        if (bet.options.includes(inputLower)) {
            const newVote = {
                voterId: id,
                betId: bet.betId,
                option: bet.options.indexOf(inputLower),
                dateVoted: new Date(),
            };

            updateModuleData('bets', {
                votesListBets: [...votesListBets, newVote],
            });

            const optionText = inputLower;
            const requestedBetId = bet.betId;
            response.output = i18n('vote.castBet', {
                id,
                requestedBetId,
                optionText,
            });
        }
    });
    return response;
};

module.exports = [
    [command('bet questionBet ...options'), addBet],
    [command('bet requestedBetId'), getBetById],
    [command('bet'), listBets],
    [command('closeBet requestedBetId winOption'), closeBet],
    [command('voteBet requestedBetId requestedOption'), castVoteBet],
    checkVoteBet,
];
