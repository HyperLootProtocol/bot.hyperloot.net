const debug = require('debug')('bot:adapter:http');
const {google} = require('googleapis');
// const opn = require('opn');

const merge = require('lodash/merge');

const { appUrl, youtube: youtubeCfg } = require('../config');

const oauth2Client = new google.auth.OAuth2(
    youtubeCfg.clientId,
    youtubeCfg.cliendSecret,
    `${appUrl}oauth2callback`
);

const youtube = google.youtube({
    version: 'v3',
    auth: oauth2Client,
});

const youtubeAdapter = () => {};

youtubeAdapter.__INIT__ = function (ctx) {

    ctx.express.use('/requestOauth', async (req, res) => {
        const authorizeUrl = oauth2Client.generateAuthUrl({
          access_type: 'offline',
          scope: 'https://www.googleapis.com/auth/youtube',
        });

        res.redirect(authorizeUrl);

        // opn(authorizeUrl, {wait: false}).then(cp => cp.unref());
    });

    ctx.express.use('/oauth2callback', async (req, res) => {
        console.log('req', req.query.code);
        
        const {tokens} = await oauth2Client.getToken(req.query.code)
        oauth2Client.setCredentials(tokens);
        res.send(tokens);
    });

    oauth2Client.setCredentials({
        refresh_token: youtubeCfg.refreshToken,
    });

    youtube.liveBroadcasts.list({
        part: 'id,snippet',
        broadcastStatus: 'all',
        broadcastType: 'all',
    }).then(liveBroadcasts => {
        const video = liveBroadcasts.data.items[0];
        const liveChatId = video.snippet.liveChatId;

        getMessages(liveChatId);
    });

    const getMessages = async (liveChatId, pageToken) => {
        const liveChatMessages = await youtube.liveChatMessages.list({
            part: 'id,snippet,authorDetails',
            maxResults: 200,
            pageToken,
            liveChatId,
        });


        const {nextPageToken, pollingIntervalMillis, items} = liveChatMessages.data;

        setTimeout(() => getMessages(liveChatId, nextPageToken), pollingIntervalMillis);

        // IGNORE first init
        if (pageToken) {
            items.forEach(message => {
                const {displayMessage} = message.snippet;
                const {displayName, channelId, profileImageUrl, channelUrl, ...restData} = message.authorDetails;
                
                ctx.process({
                    userData: {
                        username: displayName,
                        id: channelId,
                        avatar: profileImageUrl,
                        url: channelUrl,
                        ...restData
                    },
                    userId: channelId,
                    input: displayMessage,
                    from: ['youtube'],
                    event: 'message',
            
                    _handleDirect: handler,
            
                });
            })
        }
    }

    const handler = (output) => {
        const { message } = output;

        if (!message) {
            return;
        }

        youtube.liveChatMessages.insert({
            part: 'id,snippet',
            requestBody: {
                snippet: {
                  liveChatId,
                  type: "textMessageEvent",
                  textMessageDetails: {
                    messageText: message,
                  }
                }
              },
        });
    }

    return merge(ctx, {
        _handlers: {
            youtube: handler,
        },
    });
};

module.exports = youtubeAdapter;
