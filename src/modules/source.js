const checkSource = async function(source, response, {from}) {
    return source === from ? response : null;
};

module.exports = function(source) {
    return async function(response, options) {
        return await checkSource(source, response, options);
    }
};
