const users = require('./users.json');
const {get} = require('lodash')

const createCsvWriter = require('csv-writer').createArrayCsvWriter;
const csvWriter = createCsvWriter({
    path: 'file.csv',
    header: [
        'tlg',
        'eth',
        'linkedin',
        'linkedin-answer',
        'telegram',
        'telegram-answer',
        'twitter',
        'twitter-answer',
        'discord',
        'discord-answer',
        'bitcointalk',
        'bitcointalk-answer',
        'blogpost',
        'blogpost-answer',
        'gamedev',
        'gamedev-answer',
        'integration',
        'integration-answer',
        'reddit',
        'reddit-answer',
        'postreddit',
        'postreddit-answer',
        'steemitpost',
        'steemitpost-answer',
        'videopost',
        'videopost-answer',
    ]
});

const records = users.map(({telegramUsername, eth, data}) => ([
    telegramUsername,
    eth,
    get(data, 'linkedin.completed', ''),
    get(data, 'linkedin.answer', ''),
    get(data, 'telegram.completed', ''),
    get(data, 'telegram.answer', ''),
    get(data, 'twitter.completed', ''),
    get(data, 'twitter.answer', ''),
    get(data, 'discord.completed', ''),
    get(data, 'discord.answer', ''),
    get(data, 'bitcointalk.completed', ''),
    get(data, 'bitcointalk.answer', ''),
    get(data, 'blogpost.completed', ''),
    get(data, 'blogpost.answer', ''),
    get(data, 'gamedev.completed', ''),
    get(data, 'gamedev.answer', ''),
    get(data, 'integration.completed', ''),
    get(data, 'integration.answer', ''),
    get(data, 'reddit.completed', ''),
    get(data, 'reddit.answer', ''),
    get(data, 'postreddit.completed', ''),
    get(data, 'postreddit.answer', ''),
    get(data, 'steemitpost.completed', ''),
    get(data, 'steemitpost.answer', ''),
    get(data, 'videopost.completed', ''),
    get(data, 'videopost.answer', ''),
]))


console.log('users', records)

csvWriter.writeRecords(records)
    .then(() => {
        console.log('...Done');
    });

