const reactions = require('./reactions');

const reac = async function (response, { i18n }) {
    const cmd_reac = response;
    response.output = i18n('reac.{cmd_reac}');

    return response;
};

module.exports = [reactions('reactions.{cmd_reac}'), cmd_reac];
