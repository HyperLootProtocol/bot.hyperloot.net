const command = require('./command');

const lick = async function(response, {id, i18n, db}) {
  
    response.output = i18n('lick', {id});
    return response;

};

module.exports = [command('lick'), lick]; 