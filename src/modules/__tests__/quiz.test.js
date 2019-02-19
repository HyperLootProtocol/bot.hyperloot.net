const App = require('../../app');
const quiz = require('../quiz');

describe('quiz', () => {
    const mockContext = {
        getModuleData() {
            return {};
        },
        updateModuleData() {},
        i18n() {},
    };

    const instance = new App([quiz], mockContext);

    test('return empty if doesnt call command', (done) => {
        instance.process({
            input: '',
            _handleDirect(message) {
                expect(message).toHaveProperty('message', '');
                done();
            },
        });
    });
});
