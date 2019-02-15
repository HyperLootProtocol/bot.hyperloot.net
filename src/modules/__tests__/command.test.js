const { PREFIX } = require('../../config');
const cmdModule = require('../command.filter');

describe('on non-command message', () => {
    test('return null', async () => {
        const msg = 'foo';
        let request = {
            input: msg,
        };

        request = await cmdModule(msg)(request);

        return expect(request).toEqual(null);
    });
});

describe('on command message without arguments', () => {
    const cmd = 'bar';
    const msg = `${PREFIX}${cmd}`;
    let request = {
        input: msg,
    };

    beforeEach(async () => {
        request = await cmdModule(cmd)(request);
    });

    test('add command to request', () => expect(request).toHaveProperty('cmd', cmd));

    test('add empty array as arguments to request', () => expect(request).toHaveProperty('rawArgs', []));
});

describe('on command message with arguments', () => {
    const cmd = 'baz';
    const [arg1, arg2] = ['qwe', 'asd'];
    const msg = `${PREFIX}${cmd} ${arg1} ${arg2}`;
    const rawCommand = `${cmd} ${arg1} ${arg2}`;
    let request = {
        input: msg,
    };

    beforeEach(async () => {
        request = await cmdModule(rawCommand)(request);
    });

    test('add command to request', () => expect(request).toHaveProperty('cmd', cmd));

    test('add arguments to request as array', () => expect(request).toHaveProperty('rawArgs', [arg1, arg2]));
});


describe('on command with args', () => {
    const expectedCmd = 'command';
    const expectedArgs = ' arg1 arg2';

    describe('when have exact number of values', () => {
        test('change request.args to be corresponding object', async () => {
            const args = ['value1', 'value2'];
            const msg = `${PREFIX}${expectedCmd} ${args[0]} ${args[1]}`;
            let request = {
                input: msg,
            };

            request = await cmdModule(expectedCmd + expectedArgs)(request);

            expect(request.args).toEqual({ arg1: args[0], arg2: args[1] });
        });
    });

    describe('when doesn\'t have enough values', () => {
        test('is return null', async () => {
            const args = ['test'];
            const msg = `${PREFIX}${expectedCmd} ${args[0]}`;
            let request = {
                input: msg,
            };

            request = await cmdModule(expectedCmd + expectedArgs)(request);

            expect(request).toEqual(null);
        });
    });

    describe('when have excess number of values', () => {
        test('without rest return null', async () => {
            const args = ['value1', 'value2', 'value3'];
            const msg = `${PREFIX}${expectedCmd} ${args[0]} ${args[1]} ${args[2]}}`;
            let request = {
                input: msg,
            };

            request = await cmdModule(expectedCmd + expectedArgs)(request);

            expect(request).toEqual(null);
        });

        test('keep rest', async () => {
            const args = ['value1', 'arr1', 'arr2', 'arr3'];
            const expectedArgsWithRest = ' arg1 ...arg2';
            const msg = `${PREFIX}${expectedCmd} ${args[0]} ${args[1]} ${args[2]} ${args[3]}`;
            let request = {
                input: msg,
            };

            request = await cmdModule(expectedCmd + expectedArgsWithRest)(request);

            expect(request.args).toEqual({ arg1: args[0], arg2: [args[1], args[2], args[3]] });
        });
    });
});
