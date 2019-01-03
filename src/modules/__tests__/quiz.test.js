const App = require('../../app');
const quiz = require('../quiz');

describe('quiz', () => {
    const mockContext = {
        getModuleData() {},
        updateModuleData() {},
    };

    const instance = new App([quiz], mockContext);

    test('get list', (done) => {
        instance.process({
            input: '/quiz',
            handle(response) {
                expect(response).toHaveProperty('output', '');
                done();
            },
        });
    });
});
