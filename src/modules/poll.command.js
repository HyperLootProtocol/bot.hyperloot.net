
const command = require('./command');

/**
 * poll() implements the polls logic
 * input line for creating a poll should look like /poll <question sentence>? <answer1> <"answer 2"> ...
 * quotes are used to ignore spaces inside the answers
 */
const poll = async function (response, { input }) {
    const pollObj = {};

    // separating the question by question mark
    pollObj.question = input.substring(input.indexOf(' ') + 1, input.indexOf('?'));

    // the rest of string in split into answers, spaces inside quotes are ignored, quotes are then stripped
    pollObj.answers = input.substring(input.indexOf('?') + 1).replace(/\s+(?=([^"]*"[^"]*")*[^"]*$)/g, '|').replace(/['"]/g, '').split('|');

    // getting rid ot the empty string elements, if there are any
    pollObj.answers = pollObj.answers.filter(el => el !== '');

    // TODO connect to the database and get real generated ID
    pollObj.pollId = Math.floor(Math.random() * 100);

    // TODO add status open/closed (accepting votes), maybe need to store creator id to only let him/her close poll?
    // create in memory objects to test votes and other operations with polls

    response.output = JSON.stringify(pollObj, null, 2);
    return response;
};

module.exports = [command('poll'), poll];
