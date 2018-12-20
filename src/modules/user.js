
module.exports = async function (response, { DB, id }) {
    const users = new DB('users');
    const selector = { discordId: id };
    let actualUser = await users.get(selector);

    if (!actualUser) {
        actualUser = { discordId: id };

        await users.insert(actualUser);
    }

    response.user = actualUser;

    return response;
};
