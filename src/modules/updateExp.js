const extend = require('lodash/extend');
const get = require('lodash/get');
const isEmpty = require('lodash/isEmpty');

const DAY = 1000 * 60 * 60 * 24; // 5000;
const MAX_CAP = 100; // 5;

module.exports = async function (response, { id, DB }) {
    const { exp } = response;

    if (!exp) {
        return response;
    }
    const users = new DB('users');
    const selector = { discordId: id };

    const user = await users.get(selector);

    const setQuery = {};
    const curDate = new Date();
    const curLvl = get(user, 'data.exp.lvl');
    const expValue = get(user, 'data.exp.value') || 0;
    const nextLvl = get(user, 'data.exp.nextLvl') || 0;

    const cap = get(user, 'data.exp.cap') || 0;
    const capTimer = get(user, 'data.exp.capTimer') || new Date(0);

    const isCapReached = cap >= MAX_CAP;
    const isCapTimeoutReached = curDate - capTimer > DAY;

    if (isCapTimeoutReached) {
        extend(setQuery, {
            'data.exp.capTimer': curDate,
            'data.exp.cap': exp,
        });
    }

    if (!curLvl) {
        extend(setQuery, { 'data.exp.lvl': 0 });
    }

    const incQuery = isCapReached && !isCapTimeoutReached
        ? {
            'data.exp.outOfCap': exp,
        }
        : {
            'data.exp.cap': exp,
            'data.exp.value': exp,
        };

    // TODO one request/query, lf mongo man
    await users.inc(selector, incQuery);
    if (!isEmpty(setQuery)) {
        await users.set(selector, setQuery);
    }

    response.lvlUp = expValue + exp >= nextLvl;

    return response;
};
