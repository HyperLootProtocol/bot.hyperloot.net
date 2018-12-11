
module.exports = async function(response, { db, id, from }) {

    const clientId = `${from}Id`;

    return new Promise((resolve, reject) => {
        db.users.findOne({[clientId]: id}, (err, user) => {
            if (!user) {
                user = {[clientId]: id};

                db.users.insert(user);
            }

            response.user = user;

            resolve(response);
        });
    });
};
