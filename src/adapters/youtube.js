// подключение модулей ютуб(если есть)
const request = require('request');
const isEmpty = require('lodash/isEmpty');

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
                    console.log('ITS WORKING!');
                    const { output } = response;
                    console.log(output);
                    if (isEmpty(output)) {
                        return;
                    }
                    request.post({ url: chatMessageUrl, qs: requestProperties, _oauth: 'https://accounts.google.com/signin/oauth/oauthchooseaccount?client_id=1003052262666-pefql9sttjcr05k4r72oqlddj4se5uvf.apps.googleusercontent.com&as=M87hyAlswOCY5ChYmCmU7w&nosignup=1&destination=http%3A%2F%2Flocalhost&approval_state=!ChR6RUJBb1k5WmhYTnFoeVhNV2hMahIfd3hRQ3NrUkxNYTBmOERFdWhZOThQYzhsb05BWWp4WQ%E2%88%99AJDr988AAAAAXGgdijWXvL81jVCSENmLIVeHx0mnb9d2&oauthriskyscope=1&delegation=1&xsrfsig=ChkAeAh8T-0p7oN0kAZU3oFYE4GKAM7_tSdFEg5hcHByb3ZhbF9zdGF0ZRILZGVzdGluYXRpb24SBXNvYWN1Eg9vYXV0aHJpc2t5c2NvcGU&flowName=GeneralOAuthFlow' },
                        (error, response, body) => {
                            console.log(error);
                            console.log(body);
                            console.log('resp: ', response);
                            if (!error && response.statusCode === 200) {
                                console.log(body);
                            }
                        },
                    );
                    console.log(request.post);
                },
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
    getLiveChatId('qKh7BL4UeQI11', (liveChatId) => {
        console.log(`liveChatId = ${liveChatId}`);

        if (liveChatId) {
            requestChatMessages('', liveChatId, process);
        }
    });
};

module.exports = youtubeAdapter;
