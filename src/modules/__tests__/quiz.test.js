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

    test('get list', (done) => {
        instance.process({
            input: '/quiz',
            from: ['test'],
            _handleDirect({ message }) {
                expect(message).toHaveProperty('output', '');
                done();
            },
        });
    });
});
