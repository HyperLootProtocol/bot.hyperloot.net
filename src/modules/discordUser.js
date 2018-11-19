
module.exports = function(response, { db, id }) {

    return new Promise((resolve, reject) => {
        db.users.findOne({discordId: id}, (err, user) => {
            if (!user) {
                user = {
                    discordId: id,
                    isModerator: false,
                    pending: false,
                    balance: 0,
                    data: {
                        exp: 0,
                        // key: { }
                    },
                };

                db.users.insert(user);
            }

            response.user = user;

            resolve(response);
        });
    });
};
