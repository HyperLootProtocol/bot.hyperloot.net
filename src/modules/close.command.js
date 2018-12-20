
const command = require('./command');

const close = async function (response) {
    return response;
};

module.exports = [command('close'), close];
