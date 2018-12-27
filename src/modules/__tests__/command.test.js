const { PREFIX } = require('../../config');
const cmdModule = require('../command');

describe('on non-command message', () => {
    test('return null', async () => {
        const msg = 'foo';
        let response = {};

        response = await cmdModule(msg)(response, { input: msg });

        return expect(response).toEqual(null);
    });
});

describe('on command message without arguments', () => {
    let response = {};
    const cmd = 'bar';
    const msg = `${PREFIX}${cmd}`;

    beforeEach(async () => {
        response = await cmdModule(cmd)(response, { input: msg });
    });

    test('add command to response', () => expect(response).toHaveProperty('cmd', cmd));

    test('add empty array as arguments to response', () => expect(response).toHaveProperty('rawArgs', []));
});

describe('on command message with arguments', () => {
    let response = {};
    const cmd = 'baz';
    const [arg1, arg2] = ['qwe', 'asd'];
    const msg = `${PREFIX}${cmd} ${arg1} ${arg2}`;
    const rawCommand = `${cmd} ${arg1} ${arg2}`;

    beforeEach(async () => {
        response = await cmdModule(rawCommand)(response, { input: msg });
    });

    test('add command to response', () => expect(response).toHaveProperty('cmd', cmd));

    test('add arguments to response as array', () => expect(response).toHaveProperty('rawArgs', [arg1, arg2]));
});


describe('on command with args', () => {
    const expectedCmd = 'command';
    const expectedArgs = ' arg1 arg2';

    describe('when have exact number of values', () => {
        test('change response.args to be corresponding object', async () => {
            const args = ['value1', 'value2'];
            const msg = `${PREFIX}${expectedCmd} ${args[0]} ${args[1]}`;
            let response = {};

            response = await cmdModule(expectedCmd + expectedArgs)(response, { input: msg });

            expect(response.args).toEqual({ arg1: args[0], arg2: args[1] });
        });
    });

    describe('when doesn\'t have enough values', () => {
        test('is return null', async () => {
            const args = ['test'];
            let response = {};
            const msg = `${PREFIX}${expectedCmd} ${args[0]}`;

            response = await cmdModule(expectedCmd + expectedArgs)(response, { input: msg });

            expect(response).toEqual(null);
        });
    });

    describe('when have excess number of values', () => {
        test('without rest return null', async () => {
            const args = ['value1', 'value2', 'value3'];
            const msg = `${PREFIX}${expectedCmd} ${args[0]} ${args[1]} ${args[2]}}`;
            let response = {};

            response = await cmdModule(expectedCmd + expectedArgs)(response, { input: msg });

            expect(response).toEqual(null);
        });

        test('keep rest', async () => {
            const args = ['value1', 'arr1', 'arr2', 'arr3'];
            const expectedArgsWithRest = ' arg1 ...arg2';
            const msg = `${PREFIX}${expectedCmd} ${args[0]} ${args[1]} ${args[2]} ${args[3]}`;
            let response = {};

            response = await cmdModule(expectedCmd + expectedArgsWithRest)(response, { input: msg });

            expect(response.args).toEqual({ arg1: args[0], arg2: [args[1], args[2], args[3]] });
        });
    });
});
