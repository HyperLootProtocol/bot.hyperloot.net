const extend = require('lodash/extend');
const defaults = require('lodash/defaults');

const DAY = 1000 * 60 * 60 * 24; // 5000;
const MAX_CAP = 100; // 5;

function amountTillNextLevel(lvl) {
    return Math.floor(10 * (lvl ** 1.5));
}

module.exports = async function updateExp(response, context) {
    const { exp, output, id } = response;
    const { i18n, getModuleData, setModuleData } = context;

    if (!exp) {
        return response;
    }

    let data = await getModuleData('exp', context);
    const curDate = new Date();
    const query = {};

    data = defaults(data, {
        lvl: 1,
        value: 0,
        nextLvl: 1,
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

    // WHAT IS IT ???
    if (!data.lvl) {
        extend(query, {
            lvl: 1,
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
        extend(query, {
            lvl: data.lvl + 1,
            nextLvl: amountTillNextLevel(data.lvl),
        });

        const updLvlMsg = i18n('lvlUp', { lvl: data.lvl, id });
        response.output = output ? `${output}\n${updLvlMsg}` : updLvlMsg;
    }

    await setModuleData('exp', context, query);

    return response;
};
