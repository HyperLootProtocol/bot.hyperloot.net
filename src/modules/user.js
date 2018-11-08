
module.exports = function(response, { db, id }) {

    return new Promise((resolve, reject) => {
        db.users.findOne({telegramId: id}, (err, user) => {
            response.user = user;

            resolve(response);
        });
    });
};
