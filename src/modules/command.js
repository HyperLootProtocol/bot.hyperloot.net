const checkCommand = async function (command, response) {
    const [expectedCmd, ...expectedArgs] = command.split(' ');
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

module.exports = function (command) {
    return async function (response, options) {
        return checkCommand(command, response, options);
    };
};
