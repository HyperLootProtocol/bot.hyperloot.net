const checkReaction = async function (reaction, response) {
    const [expectedCmd, ...expectedArgs] = reaction.split(' ');
    const { cmd, args } = response;

    if (cmd !== expectedCmd) {
        return null;
    }

    const newArgs = {};
    for (let i = 0; i < expectedArgs.length; i++) {
        newArgs[expectedArgs[i]] = args[i];
    }

    response.args = newArgs;

    return response;
};

module.exports = function (reaction) {
    return async function (response, options) {
        return checkReaction(reaction, response, options);
    };
};
