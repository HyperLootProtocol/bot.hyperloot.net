const _ = require('lodash');
const telegram = require('./telegram.mission');
const {makeChecker} = require("./helpers");

function check(answer) {
    return true;
}

module.exports = makeChecker(telegram.missionData, check);