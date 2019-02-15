// Event filter
module.exports = function (eventName) {
    return (request, { event }) => (
        eventName === event ? request : null
    );
};
