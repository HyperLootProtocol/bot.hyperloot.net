const sample = require('lodash/sample');
const {pictures} = require('./emotion-list.json');
const {SOCIAL_PREFIX} = require('../config');

const emotionSocial = async function(response, { username, input, i18n }) {
    if (input[0] !== SOCIAL_PREFIX) {
        return response;
    }

    const emotionName = input.split(` `)[0].substr(1);

    const message = i18n(`emotion_${emotionName}`);
    const picture = sample(pictures[emotionName] || []);

    if (message && picture) {
        response.output = `${message}`;
        response.attachment = [picture];
    }

    return response;
};

module.exports = [emotionSocial];
