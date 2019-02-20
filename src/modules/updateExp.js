const extend = require('lodash/extend');
const defaults = require('lodash/defaults');

const DAY = 1000 * 60 * 60 * 24; // 5000;
const MAX_CAP = 100; // 5;

function amountTillNextLevel(lvl) {
    return Math.floor(10 * (lvl ** 1.5)) + 10;
}

module.exports = async function updateExp(request, context) {
    const {
        exp,
        user,
        userId,
    } = request;

    const {
        i18n,
        getModuleData,
        updateModuleData,
        send,
    } = context;

    if (!exp) {
        return request;
    }

    let data = await getModuleData('exp', { user });
    const curDate = new Date();
    const newData = {};

    data = defaults(data, {
        lvl: 0,
        value: 0,
        cap: 0,
        capTimer: new Date(0),
    });

    const isCapReached = data.cap >= MAX_CAP;
    const isCapTimeoutReached = curDate - data.capTimer > DAY;

    // VERY HARD TO UNDERSTAND!
    if (isCapTimeoutReached) {
        extend(newData, {
            capTimer: curDate,
            cap: exp,
        });
    }

    if (isCapReached && !isCapTimeoutReached) {
        extend(newData, {
            outOfCap: data.outOfCap + exp,
        });
    } else {
        extend(newData, {
            cap: data.cap + exp,
            value: data.value + exp,
        });
    }

    // New lvl reached?
    const isLvlUp = data.value + exp >= amountTillNextLevel(data.lvl);

    if (isLvlUp) {
        const newLvl = data.lvl + 1;

        extend(newData, {
            lvl: newLvl,
        });

        const updLvlMsg = i18n('lvlUp', { lvl: newLvl, id: userId });
        send({
            embed: {
                title: i18n('lvl'),
                description: updLvlMsg,
            },
        });
    }

    await updateModuleData('exp', newData, { user });

    return request;
};
