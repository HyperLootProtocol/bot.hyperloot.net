const checkEvent = async function(expectedEvent, response, {event}) {
    if (event !== expectedEvent) {
        response.skipChain = true;
    }

    return response;
};

module.exports = function(event) {
    return async function(response, options) {
        return await checkEvent(event, response, options);
    }
};
