const get = require('lodash/get');
const command = require('./command');

const status = async function(response, { i18n }) {
    const {user} = response;
    const curLvl = get(user, 'data.exp.lvl');
    const exp = get(user, 'data.exp.value');
    const expToNext = get(user, 'data.exp.nextLvl');

    if (!curLvl || !exp || !expToNext) {
        throw(i18n('statusError'));
    } else {
        response.output = i18n('status', {curLvl, exp, expToNext});
    }

    return response;
};

module.exports = [command('status'), status];
