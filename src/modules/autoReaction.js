
// TODO: need check confuguration, and send reactions only for channel/places where it setup
module.exports = function autoReaction(response) {
    response.reactions.push('👍');
    response.reactions.push('👎');

    return response;
};
