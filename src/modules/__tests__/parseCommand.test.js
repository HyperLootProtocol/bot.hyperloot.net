const parseCommand = require('../parseCommand');
const {PREFIX} = require('../../config');

describe('on non-command message', () => {
    test('add skipChain field to response', async () => {
        const msg = 'foo';
        const response = {};

        await parseCommand(response, {input: msg});

        return expect(response).toHaveProperty('skipChain', true);
    });
});

describe('on command message without arguments', () => {
    const response = {};
    const command = 'bar';
    const msg = `${PREFIX}${command}`;

    beforeEach(async () => {
        await parseCommand(response, {input: msg});
    });

    test('add command to response', () => {
        return expect(response).toHaveProperty('cmd', command);
    });

    test('add empty array as arguments to response', () => {
        return expect(response).toHaveProperty('args', []);
    });
});

describe('on command message with arguments', () => {
    const response = {};
    const command = 'baz';
    const [arg1, arg2] = ['qwe', 'asd'];
    const msg = `${PREFIX}${command} ${arg1} ${arg2}`;

    beforeEach(async () => {
        await parseCommand(response, {input: msg});
    });

    test('add command to response', () => {
        return expect(response).toHaveProperty('cmd', command);
    });

    test('add arguments to response as array', () => {
        return expect(response).toHaveProperty('args', [arg1, arg2]);
    });
});
