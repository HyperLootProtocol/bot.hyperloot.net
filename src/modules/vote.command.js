
const command = require('./command');

const vote = async function (response) {
    return response;
};

module.exports = [command('vote'), vote];
