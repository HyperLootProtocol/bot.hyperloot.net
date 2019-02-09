// подключение модулей ютуб(если есть)
const request = require('request');
const express = require('express');

const app = express();

const myApiKey = 'AIzaSyBT_CuvhuHmYNapuUVYv6GjEa_G6EB6F6E';
let processYT = {};

const getLiveChatId = (videoId, callback) => {
    const url = (`https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${myApiKey}&part=liveStreamingDetails,snippet`);
    request(url, (error, response, body) => {
        const bodyObj = JSON.parse(body);
        callback(bodyObj.items[0].liveStreamingDetails.activeLiveChatId);
    });
};

const chatMessageUrl = 'https://www.googleapis.com/youtube/v3/liveChat/messages';

const requestChatMessages = (nextPageToken, liveChatId) => {
    const requestProperties = {
        liveChatId: liveChatId,
        part: 'id, snippet, authorDetails',
        key: myApiKey,
        maxResults: 200,
        pageToken: nextPageToken,
    };

    request({ url: chatMessageUrl, qs: requestProperties }, (error, response, body) => {
        body = JSON.parse(body);

        for (let i = 0; i < body.items.length; i++) {
            processYT = {
                id: body.items[i].snippet.authorChannelId,
                user: body.items[i].authorDetails.displayName,
                input: body.items[i].snippet.displayMessage,
            };
            console.log(processYT);
            console.log(`${body.items[i].authorDetails.displayName} : ${body.items[i].snippet.displayMessage}`);
        }

        setTimeout(() => {
            requestChatMessages(body.nextPageToken, liveChatId);
        }, body.pollingIntervalMillis);
    });
};

const main = () => {
    getLiveChatId('ozC_VihQXx8', (liveChatId) => {
        console.log(`liveChatId = ${liveChatId}`);
        if (liveChatId) {
            requestChatMessages('', liveChatId);
        }
    });
};
const youtubeAdapter = () => {};

youtubeAdapter.__INIT__ = function ({ process, expressServer }) {
    processYT = process;
    
    console.log(processYT);
    
    console.log('proc: ', process);
    
    app.listen(4000, () => {
        main();
    });
    
    // expressServer!!
    // no need app
};

module.exports = youtubeAdapter;
