const sample = require('lodash/sample');
const { gifs } = require('./reaction-list.json');
const { SOCIAL_PREFIX } = require('../config');

const reactionSocial = async function (response, { /* contex, */ input, i18n }) {
    if (input[0] !== SOCIAL_PREFIX) {
        return response;
    }
    // const { id } = contex;

    const reactionName = input.split(' ')[0].substr(1);

    const message = i18n(`reaction_${reactionName}`);
    const gif = sample(gifs[reactionName] || []);

    if (message && gif) {
        response.output = message;
        response.attachment = [gif];
    }

    return response;
};

module.exports = [reactionSocial];
