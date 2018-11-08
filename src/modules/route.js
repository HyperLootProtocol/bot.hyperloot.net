const zipObject = require('lodash/zipObject');

const checkRoute = async function(route, response) {
    const [expectedCmd, ...expectedArgs] = route.split(' ');
    const {cmd, args} = response;

    if (cmd !== expectedCmd || args.length !== expectedArgs.length) {
        response.skipChain = true;
    }
    else {
        response.args = zipObject(expectedArgs, args);
    }

    // TODO remove
    // const {cmd, query} = response;
    //
    // if (cmd !== route) {
    //     response.skipChain = true;
    // }

    return response;
};

module.exports = function(route) {
    return async function(response, options) {
        return await checkRoute(route, response, options);
    }
};
