const checkEvent = async function (expectedEvent, response, { event }) {
    return event === expectedEvent ? response : null;
};

module.exports = function (eventName) {
    return async function event(response, options) {
        return checkEvent(eventName, response, options);
    };
};
