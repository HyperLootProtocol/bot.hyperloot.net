const cloneDeep = require('lodash/cloneDeep');

const command = require('../command');

describe('on command without args', () => {
    const expectedCmd = 'command';
    const args = [];

    describe('on correct command', () => {
        test('change response.args to empty object', async () => {
            const response = {cmd: expectedCmd, args};
            const actualResponse = await command(expectedCmd)(cloneDeep(response));

            expect(actualResponse.args).toEqual({});
        });
    });

    describe('on incorrect command', () => {
        test('add skipChain field to response', async () => {
            const response = {cmd: expectedCmd + 'WrongCommand', args};
            const actualResponse = await command(expectedCmd)(cloneDeep(response));

            return expect(actualResponse).toHaveProperty('skipChain', true);
        });
    });
});

describe('on command with args', () => {
    const expectedCmd = 'command';
    const expectedArgs = ' arg1 arg2';

    describe('when have exact number of values', () => {
        test('change response.args to be corresponding object', async () => {
            const args = ['value1', 'value2'];
            const response = {cmd: expectedCmd, args};
            const actualResponse = await command(expectedCmd + expectedArgs)(cloneDeep(response));

            expect(actualResponse.args).toEqual({arg1: args[0], arg2: args[1]});
        });
    });

    describe('when doesn\'t have enough values', () => {
        test('change values of response.args to be undefined', async () => {
            const args = [];
            const response = {cmd: expectedCmd, args};
            const actualResponse = await command(expectedCmd + expectedArgs)(cloneDeep(response));

            expect(actualResponse.args).toEqual({arg1: undefined, arg2: undefined});
        });
    });

    describe('when have excess number of values', () => {
        test('ignores excess', async () => {
            const args = ['value1', 'value2', 'value3'];
            const response = {cmd: expectedCmd, args};
            const actualResponse = await command(expectedCmd + expectedArgs)(cloneDeep(response));

            expect(actualResponse.args).toEqual({arg1: args[0], arg2: args[1]});
        });
    });
});
