const extend = require('lodash/extend');
const defaults = require('lodash/defaults');

const DAY = 1000 * 60 * 60 * 24; // 5000;
const MAX_CAP = 100; // 5;

function amountTillNextLevel(lvl) {
    return Math.floor(10 * (lvl ** 1.5)) + 10;
}

module.exports = async function updateExp(response, context) {
    const { exp, output } = response;
    const {
        id,
        i18n,
        getModuleData,
        updateModuleData,
        user,
    } = context;

    if (!exp) {
        return response;
    }

    let data = await getModuleData('exp', { user });
    const curDate = new Date();
    const query = {};

    data = defaults(data, {
        lvl: 0,
        value: 0,
        nextLvl: amountTillNextLevel(0),
        cap: 0,
        capTimer: new Date(0),
    });

    const isCapReached = data.cap >= MAX_CAP;
    const isCapTimeoutReached = curDate - data.capTimer > DAY;

    if (isCapTimeoutReached) {
        extend(query, {
            capTimer: curDate,
            cap: exp,
        });
    }

    if (isCapReached && !isCapTimeoutReached) {
        extend(query, {
            outOfCap: data.outOfCap + exp,
        });
    } else {
        extend(query, {
            cap: data.cap + exp,
            value: data.value + exp,
        });
    }

    // New lvl reached?
    const isLvlUp = data.value + exp >= data.nextLvl;

    if (isLvlUp) {
        const newLvl = data.lvl + 1;

        extend(query, {
            lvl: newLvl,
            nextLvl: amountTillNextLevel(newLvl),
        });

        const updLvlMsg = i18n('lvlUp', { lvl: newLvl, id });
        response.output = output ? `${output}\n${updLvlMsg}` : updLvlMsg;
    }

    await updateModuleData('exp', query, { user });

    return response;
};
