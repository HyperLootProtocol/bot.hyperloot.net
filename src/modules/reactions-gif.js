const sample = require('lodash/sample');
const gifs = require('./reaction-list.json');
const { SOCIAL_PREFIX } = require('../config');

const reactionSocial = async function (response, { id, input, i18n }) {
    if (input[0] !== SOCIAL_PREFIX) {
        return response;
    }

    if (input.indexOf(' ') > 0) {
        const idWho = input.split(' ')[1].slice(2, -1);
        const reactionName = input.split(' ')[0].substr(1);
        const message = i18n(`reaction_${reactionName}`, { id, idWho });
        const gif = sample(gifs[reactionName] || []);

        if (message && gif) {
            response.output = message + [gif];
            console.log(message);
        }
        return response;
    }

    const reactionName = input.split(' ')[0].substr(1);
    const message = i18n(`reactionOne_${reactionName}`, { id });
    const gif = sample(gifs[reactionName] || []);

    if (message && gif) {
        response.output = message + [gif];
        console.log(message);
    }
    return response;

};

module.exports = [reactionSocial];
