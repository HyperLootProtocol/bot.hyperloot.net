const App = require('../../app');
const echo = require('../commands/echo');

let store = {};
const setup = 'setup';

describe('echo', () => {
    const mockContext = {
        getModuleData() {
            return store;
        },
        updateModuleData(moduleName, data) {
            store = data;
        },
        i18n() {
            return 'test';
        },
    };

    const instance = new App([echo], mockContext);

    test('return predefined from i18n answer if setup data in /echo', (done) => {
        instance.process({
            input: `/echo ${setup}`,
            _handleDirect(message) {
                expect(message).toHaveProperty('message', 'test');
                done();
            },
        });
    });

    test('return setup data if direct call /echo', (done) => {
        instance.process({
            input: '/echo',
            _handleDirect(message) {
                expect(message).toHaveProperty('message', setup);
                done();
            },
        });
    });
});
