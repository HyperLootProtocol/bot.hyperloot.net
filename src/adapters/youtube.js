// подключение модулей ютуб(если есть)
const request = require('request');

const myApiKey = 'AIzaSyBT_CuvhuHmYNapuUVYv6GjEa_G6EB6F6E';

const getLiveChatId = (videoId, callback) => {
    const url = (`https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${myApiKey}&part=liveStreamingDetails,snippet`);
    request(url, (error, response, body) => {
        const bodyObj = JSON.parse(body);
        callback(bodyObj.items[0].liveStreamingDetails.activeLiveChatId);
    });
};

const chatMessageUrl = 'https://www.googleapis.com/youtube/v3/liveChat/messages';

const requestChatMessages = (nextPageToken, liveChatId, process) => {
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
            process({
                id: body.items[i].snippet.authorChannelId,
                user: body.items[i].authorDetails.displayName,
                input: body.items[i].snippet.displayMessage,
                handle: (response) => {
                    console.log('ITS WORKING!', response);
                }
            });

            console.log(`${body.items[i].authorDetails.displayName} : ${body.items[i].snippet.displayMessage}`);
        }

        setTimeout(() => {
            requestChatMessages(body.nextPageToken, liveChatId, process);
        }, body.pollingIntervalMillis);
    });
};

const youtubeAdapter = () => {};

youtubeAdapter.__INIT__ = function ({ process }) {
    console.log('proc: ', process);

    getLiveChatId('ozC_VihQXx8', (liveChatId) => {
        console.log(`liveChatId = ${liveChatId}`);

        if (liveChatId) {
            requestChatMessages('', liveChatId, process);
        }
    });
};

module.exports = youtubeAdapter;
