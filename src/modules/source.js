const checkSource = async function(source, response, {from}) {
    if (source !== from) {
        response.skipChain = true;
    }

    return response;
};

module.exports = function(source) {
    return async function(response, options) {
        return await checkSource(source, response, options);
    }
};
