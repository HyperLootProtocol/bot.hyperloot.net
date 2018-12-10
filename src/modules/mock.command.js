const command = require('./command');

const mock = async function(response, { input, i18n }) {
	const {user} = response;
	var lastWord = input.substring(input.lastIndexOf(" ")+1);
	lastWord = lastWord != '/mock' ? lastWord : 'nothing to mock('
	var id = user.discordId;
	response.output = i18n('mock', {id, lastWord});
    return response;
};

module.exports = [command('mock'), mock];
