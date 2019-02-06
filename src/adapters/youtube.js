// подключение модулей ютуб(если есть)
const youTubeApi = require('youtube-node');
// const debug = require('debug')('bot:adapter:youtube');

const isString = require('lodash/isString');
const isArray = require('lodash/isArray');
const isEmpty = require('lodash/isEmpty');
// подключение авторизации с ютуб(channalId, videoId, video.setKey, auth.OAuth2(gogleapis?))
const { youtube: youTubeCfg } = require('../config');


const youtubeAdapter = () => {};

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

            if (isArray(outputYT)) {
                // цикл для вывода сообщения, если текст больше 200 символов
                // и нам требуется разбить outputYT на несколько сообщений
                for (let i = 0; i < outputYT.length; i++) {
                    msgYoutube.send(outputYT[i]);
                }
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
