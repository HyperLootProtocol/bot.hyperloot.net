const sample = require('lodash/sample');
const trimStart = require('lodash/trimStart');
const gifs = require('./reaction-list.json');
const { SOCIAL_PREFIX } = require('../config');


const reactionSocial = async function (response, { id, input, i18n }) {
    if (input[0] !== SOCIAL_PREFIX) {
        return response;
    }

    const parsed = input.split(' ');
    const reactionName = trimStart(parsed[0], SOCIAL_PREFIX);
    const idWho = parsed[1];
    let message;

    if (!idWho) {
        message = i18n(`reactionOne_${reactionName}`, { id });
    } else {
        message = i18n(`reaction_${reactionName}`, { id, idWho });
    }

    const gif = sample(gifs[reactionName] || []);

    if (message && gif) {
        response.output = message;
        response.attachment = gif;
    }
    return response;
};

module.exports = [reactionSocial];
