const App = require('../../app');
const ping = require('../commands/ping');

describe('ping', () => {
    const mockContext = {
        getModuleData() {
            return {};
        },
        updateModuleData() {},
        i18n() {
            return 'test';
        },
    };

    const instance = new App([ping], mockContext);

    test('return empty if doesnt call command', (done) => {
        instance.process({
            input: '',
            _handleDirect(message) {
                expect(message).toHaveProperty('message', '');
                done();
            },
        });
    });

    test('return something if call /ping', (done) => {
        instance.process({
            input: '/ping',
            _handleDirect(message) {
                expect(message).toHaveProperty('message', 'test');
                done();
            },
        });
    });
});
