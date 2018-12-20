
const command = require('./command');

// in memory object for tests
const polls = {
    1: {
        question: 'what\'s up?',
        answers: [
            'not much',
            'ceiling',
            'Hammond',
        ],
        creator: '258702341140774912',
        pollId: 1,
        dateCreated: new Date(),
    },
    2: {
        question: 'Are you playing games tonight?',
        answers: [
            'Yes',
            'No',
            'Dunno',
        ],
        creator: '258702341140774912',
        pollId: 2,
        dateCreated: new Date(),
    },
};

const getPoll = function (id) {
    if (id in polls) {
        return polls[id];
    }
    return polls;
};

const getPollStringInfo = function (_poll) {
    let _output = `${_poll.dateCreated.getDate()}/${_poll.dateCreated.getMonth() + 1} ${_poll.question} | ${'?'} votes | ID${_poll.pollId}\n`;

    for (let i = 0; i < _poll.answers.length; i++) {
        _output += `${_poll.answers[i]} (??%)`;
        if (i < _poll.answers.length - 1) {
            _output += ' | ';
        }
    }

    return _output;
};

/**
 * poll() implements the polls logic
 * input line for creating a poll should look like /poll 'question sentence' answer1 'answer 2' ...
 * quotes are used to ignore spaces inside the arguments
 */
const poll = async function (response, { id, i18n }) {
    if (response.rawArgs.length > 1) {
        // creating a new poll object
        const pollObj = {};

        // raw arguments include question and an unknown ammount of answers, which are read into variables
        [pollObj.question, ...pollObj.answers] = response.rawArgs;

        // creator id is stored to ensure only he/she has permission to modify the poll
        pollObj.creator = id;

        // newly created poll is active (not closed)
        pollObj.active = 1;

        // store the date the poll has been created on
        pollObj.dateCreated = new Date();

        // TODO connect to the database and get real generated ID
        const pollId = Math.floor(Math.random() * 100);
        pollObj.pollId = pollId;
        // test data: create new obj in memory storage
        polls[pollId] = pollObj;

        response.output = i18n('pollCreated', { pollId });
        // response.output = `Poll created successfully, vote by typing: /vote ${pollObj.pollId} your_answer`;
    } else if (response.rawArgs.length === 1) {
        // the first and only arg is the polls id
        const pollId = response.rawArgs[0];
        const _poll = getPoll(pollId);

        // output poll info
        response.output = getPollStringInfo(_poll);
    } else {
        // getting info on all the existing polls
        Object
            .values(getPoll())
            .forEach((v) => {
                response.output += `${getPollStringInfo(v)} \n\n`;
            });
    }

    return response;
};

module.exports = [command('poll'), poll];
