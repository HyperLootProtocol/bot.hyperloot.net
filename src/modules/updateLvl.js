const get = require('lodash/get');

// TODO lf suitable function
/*
1 - 10
2 - 28
3 - 51
4 - 80
5 - 111
 */
function amountTillNextLevel(lvl) {
    return Math.floor(10 * (lvl ** 1.5));
}

module.exports = async function (response, { id, i18n, DB }) {
    const { lvlUp, output } = response;

    if (!lvlUp) {
        return response;
    }

    const users = new DB('users');
    const selector = { discordId: id };
    const user = await users.get(selector);

    const lvl = await get(user, 'data.exp.lvl') + 1;

    const incQuery = {
        'data.exp.lvl': 1,
        'data.exp.nextLvl': amountTillNextLevel(lvl),
    };

    await users.inc(selector, incQuery);

    const updLvlMsg = i18n('lvlUp', { lvl, id });
    // TODO! send several messages
    response.output = output ? `${output}\n${updLvlMsg}` : updLvlMsg;

    return response;
};
