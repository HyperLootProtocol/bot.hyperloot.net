
module.exports = async function (response, { db, id }) {
    return new Promise((resolve) => {
        db.users.findOne({ discordId: id }, (err, user) => {
            let actualUser;

            if (!user) {
                actualUser = { discordId: id };

                db.users.insert(actualUser);
            }

            response.user = actualUser;

            resolve(response);
        });
    });
};
