
const command = require('./command');

/**
 * poll() implements the polls logic
 * input line for creating a poll should look like /poll <question sentence>? <answer1> <"answer 2"> ...
 * quotes are used to ignore spaces inside the answers
 */
const poll = async function(response, { input, i18n }) {
    poll_obj = {};

    // separating the question by question mark
    poll_obj.question = input.substring(input.indexOf(' ') + 1 , input.indexOf('?'));

    // the rest of string in split into answers, spaces inside quotes are ignored
    // TODO strip the quotes ('/") from the answers
    poll_obj.answers = input.substring(input.indexOf('?') + 1).replace(/\s+(?=([^"]*"[^"]*")*[^"]*$)/g, '|').split('|')
   
    // getting rid ot the empty string elements, if there are any
    poll_obj.answers = poll_obj.answers.filter(function (el){
        return el != '';
    });;
    
    // TODO connect to the database and get real generated ID
    poll_obj.pollId = Math.floor(Math.random() * 100);

    response.output = JSON.stringify(poll_obj, null, 2);
    return response;
};

module.exports = [command('poll'), poll];
