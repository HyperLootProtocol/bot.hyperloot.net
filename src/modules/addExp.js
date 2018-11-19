const checkEvent = async function(expAmount, response) {
    const { exp } = response;

    response.exp = exp ? exp + expAmount : expAmount;

    return response;
};

module.exports = function(expAmount) {
    return async function(response, options) {
        return await checkEvent(expAmount, response, options);
    }
};
