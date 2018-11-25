const checkEvent = async function(expectedEvent, response, {event}) {
    return event === expectedEvent ? response : null;
};

module.exports = function(event) {
    return async function(response, options) {
        return await checkEvent(event, response, options);
    }
};
