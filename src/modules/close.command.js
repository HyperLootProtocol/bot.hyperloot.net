
const command = require('./command');

const close = async function (response, { id }) {


    return response;
};

module.exports = [command('close'), close];
