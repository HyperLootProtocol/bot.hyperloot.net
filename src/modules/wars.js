const isEmpty = require('lodash/isEmpty');
const command = require('./command.filter');

const { discord: { warsRoleId, warsChannelId, warsBaseRoleId } } = require('../config');

const prepareWar = async function (request, { i18n, send, getModuleData, updateModuleData }) {
    const { list = [], status } = await getModuleData('wars');

    updateModuleData('wars', { 
        status: 'preparing',
        list: [],
     });

    send('prepare war!');
};

const joinWar = async function (request, { i18n, send, getModuleData, updateModuleData }) {
    const { user: { username } } = request;
    const { list = [], status } = await getModuleData('wars');

    if (status !== 'preparing') {
        send('war is not preparing!');

        return;
    }

    const newList = list.filter(usrn => usrn !== username);

    updateModuleData('wars', {
        list: [...newList, username],
     });

    send(`${username} was joined to war!`);
    send({ userActions: [{
        username,
        addRole: warsBaseRoleId
    }]});
};

const leftWar = async function (request, { i18n, send, getModuleData, updateModuleData }) {
    const { user: { username } } = request;
    const { list = [] } = await getModuleData('wars');

    const newList = list.filter(usrn => usrn !== username);

    updateModuleData('wars', {
        list: newList,
     });

    send(`${username} was left from war!`);
    send({ userActions: [{
        username,
        removeRole: warsBaseRoleId
    }]});
};

const startWar = async function (request, { i18n, send, getModuleData, updateModuleData }) {
    const { list = [], status } = await getModuleData('wars');

    if (status !== 'preparing') {
        send('war is not preparing!');

        return;
    }

    if (list.length < 2) {
        send('minimum two players needed!');

        return;
    }

    list.forEach(username => {
        send({ userActions: [{
            username,
            addRole: warsRoleId
        }]});
    })

    updateModuleData('wars', { 
        status: 'started',
     });

    send('war started!');
    send({
        to: ['discord', warsChannelId],
        message: 'war started!',
    });
};

const kill = async function (request, { i18n, send, getModuleData, updateModuleData }) {
    const { input, from } = request;
    const [, channelId] = from;

    if (warsChannelId !== channelId) {
        return;
    }

    const { list = [], status } = await getModuleData('wars');
    const inputLower = input.toLowerCase();


    if (status !== 'started') {
        send('war is not started!');

        return;
    }

    const username = list.find(usrn => usrn.toLowerCase() === inputLower);
    const newList = list.filter(usrn => usrn.toLowerCase() !== inputLower);

    if (username) {
        updateModuleData('wars', {
            list: newList,
        });

        send({ userActions: [{
            username,
            removeRole: warsRoleId
        }]});

        send(`killed ${username}`);
    } else {
        send('dont find user, lets try more!!! FASTER!!!');
    }

    if (newList.length === 1) {
        const [ winnerName ] = newList;

        updateModuleData('wars', { 
            status: 'over',
        });

        send({ userActions: [{
            username: winnerName,
            removeRole: warsRoleId
        }]});

        send(`war was over... and ${winnerName} win!`);

    }
};

module.exports = [
    [command('prepareWar'), prepareWar],
    [command('startWar'), startWar],
    [command('joinWar'), joinWar],
    [command('leftWar'), leftWar],
    kill,
];
