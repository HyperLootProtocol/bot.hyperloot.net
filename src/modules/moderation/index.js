
const get = require('./get.command');
const moderatorCheck = require('./moderatorCheck');

const isModerator = require('./moderator');
const setmoderator = require('./setmoderator.command');
const unsetmoderator = require('./unsetmoderator.command');
// const linkedInComplete = require('./linkedInComplete');
const complete = require('./complete.command');

module.exports = [
    isModerator,

    get,
    moderatorCheck,
    setmoderator,
    unsetmoderator,
    // linkedInComplete,
    complete,
];
