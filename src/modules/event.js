// Event filter
module.exports = function (eventName) {
    return request => (
        eventName === request.event ? request : null
    );
};
