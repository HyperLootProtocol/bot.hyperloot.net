const get = require('lodash/get');
const needUser = require('./needUser');
const command = require('./command');

const status = async function(response, { i18n }) {
    const {user} = response;
    const curLvl = get(user, 'data.exp.lvl');
    const exp = get(user, 'data.exp.value');
    const expToNext = get(user, 'data.exp.nextLvl');
    let output;

    if (!curLvl || !exp || !expToNext) {
        output = i18n('statusError');
    } else{
        output = i18n('status', {curLvl, exp, expToNext});
    }

    response.output = output;

    return response;
};

module.exports = [command('status'), needUser, status];
