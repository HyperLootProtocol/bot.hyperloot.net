const get = require('lodash/get');
const extend = require('lodash/extend');

const DAY = 1000*60*60*24; // 5000;
const MAX_CAP = 100; // 5;

module.exports = async function(response, { id, db }) {
    const { exp } = response;

    if (!exp) {
        return response;
    }

    return new Promise((resolve, reject) => {
        db.users.findOne({discordId: id}, async (err, user) => {
            let setQuery = {};
            let incQuery;

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
                extend(setQuery, {'data.exp.lvl': 0});
            }

            incQuery = isCapReached && !isCapTimeoutReached ?
                {
                    'data.exp.outOfCap': exp
                } :
                {
                    'data.exp.cap': exp,
                    'data.exp.value': exp,
                };

            // TODO one request/query, lf mongo man
            await db.users.update({
                discordId: id,
            }, {
                $set: setQuery,
            });

            await db.users.update({
                discordId: id,
            }, {
                $inc: incQuery,
            });

            response.lvlUp = expValue + exp >= nextLvl;

            resolve(response);
        });
    });
};
