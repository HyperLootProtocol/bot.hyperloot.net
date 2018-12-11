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
    return Math.floor(10*(Math.pow(lvl, 1.5)));
}

module.exports = async function(response, { id, i18n, db }) {
    const { lvlUp, output } = response;

    if (!lvlUp) {
        return response;
    }

    return new Promise((resolve, reject) => {
        db.users.findOne({discordId: id}, async (err, user) => {
            const lvl = get(user, 'data.exp.lvl') + 1;

            const incQuery = {
                'data.exp.lvl': 1,
                'data.exp.nextLvl': amountTillNextLevel(lvl),
            };

            // TODO one request/query, lf mongo man
            await db.users.update({
                discordId: id,
            }, {
                $inc: incQuery,
            });

            const updLvlMsg = i18n('lvlUp', {lvl: lvl, id});
            // TODO! send several messages
            response.output = output ? `${output}\n${updLvlMsg}` : updLvlMsg;

            resolve(response);
        });
    });
};
