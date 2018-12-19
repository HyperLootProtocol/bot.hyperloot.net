
const command = require('./command');

let polls = {
    1: {
        "question": "what's up?",
        "answers": [
            "not much",
            "ceiling",
            "Hammond",
        ],
        "creator": "258702341140774912",
        "pollId": 1
    },
    2: {
        "question": "Are you playing games tonight?",
        "answers": [
            "Yes",
            "No",
            "Dunno",
        ],
        "creator": "258702341140774912",
        "pollId": 2
    }
};

const getPolls = function ( id ) {
    if (id in polls){
        return polls[id];
    } else {
        return polls;
    };
};

/**
 * poll() implements the polls logic
 * input line for creating a poll should look like /poll "question sentence" answer1 "answer 2" ...
 * quotes are used to ignore spaces inside the arguments
 */
const poll = async function (response, { id }) {
    if (response.rawArgs.length > 1) {
        // creating a new poll object
        const pollObj = {};

        // raw arguments include question and an unknown ammount of answers, which are read into variables
        [pollObj.question, ...pollObj.answers] = response.rawArgs;

        // creator id is stored to ensure only he/she has permission to modify the poll
        pollObj.creator = id;

        // newly created poll is active (not closed)
        pollObj.active = 1;

        // TODO connect to the database and get real generated ID
        pollObj.pollId = Math.floor(Math.random() * 100);
        response.output = JSON.stringify(pollObj, null, 2);

    } else if (response.rawArgs.length == 1) {
        let pollId = response.rawArgs[0];
        response.output = JSON.stringify(getPolls(pollId), null, 2);
    }  else {
        console.log(getPolls());
        response.output = JSON.stringify(getPolls(), null, 2);
    }


    
    return response;
};

module.exports = [command('poll'), poll];
