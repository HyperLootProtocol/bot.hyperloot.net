
// TODO: need check confuguration, and send reactions only for channel/places where it setup
module.exports = function autoReaction(request, { send }) {
    const reactions = [];

    reactions.push('👍');
    reactions.push('👎');

    send({ reactions });

    return request;
};
