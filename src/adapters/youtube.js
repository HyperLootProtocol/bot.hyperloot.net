// подключение модулей ютуб(если есть)
const request = require('request');
const express = require('express');

const app = express();


const isString = require('lodash/isString');
const isEmpty = require('lodash/isEmpty');

const myApiKey = require('./../config');
const videoId = require('./../config');

const youtubeAdapter = () => {};

const getLiveChatId = (callback) => {
    const url = (`https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${myApiKey}&part=liveStreamingDetails,snippet`);

    request(url, (error, response, body) => {
        const bodyObj = (JSON).parse(body);
        callback(bodyObj.items[0].liveStreamingDetails.activeLiveChatId);
    });
};

const chatMessageUrl = 'https://www.googleapis.com/youtube/v3/liveChat/messages';

const requestChatMessages = (nextPageToken, liveChatId) => {
    const requestProperties = {
        liveChatIdEl: liveChatId,
        part: 'id, snippet, authorDetails',
        key: myApiKey,
        maxResults: 200,
        pageToken: nextPageToken,
    };

    request({ url: chatMessageUrl, qs: requestProperties }, (error, response, body) => {
        body = JSON.parse(body);

        for (let i = 0; i < body.items.length; i++) {
            console.log(`${body.items[i].authorDetails.displayName} : ${body.items[i].snippet.displayMessage}`);
        }

        setTimeout(() => {
            requestChatMessages(body.nextPageToken, liveChatId);
        }, body.pollingIntervalMillis);
    });
};

const main = () => {
    getLiveChatId(videoId, (liveChatId) => {
        console.log(`liveChatId = ${liveChatId}`);
        if (liveChatId) {
            requestChatMessages('', liveChatId);
        }
    });
};

app.listen(1000, () => {
    main();
});


// подключение авторизации с ютуб(channalId, videoId, video.setKey, auth.OAuth2(gogleapis?))
// const { youtube: youTubeCfg } = require('../config');

youtubeAdapter.__INIT__ = function ({ process }) {
    const youtubeBot = new youTubeApi.Client();

    youtubeBot.on('messageYoutube', (msgYoutube) => {
        const handle = (context) => {
            const { outputYT } = context;

            if (isEmpty(outputYT)) {
                return;
            }

            if (isString(outputYT)) {
                // если получаем просто строку >=200 символом и выводим ее в чат
                // пока не понял как выводится сообщение в чат
                msgYoutube.send(outputYT);
            }
        };

        process({
            id: msgYoutube.author.id,
            input: msgYoutube.conten || '',
            from: 'youtube',
            event: 'messageYoutube',
            handle,
        });
    });

    youtubeBot.login(youTubeCfg.authToken);
};

module.exports = youtubeAdapter;
