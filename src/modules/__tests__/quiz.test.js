const App = require('../../app');
const quiz = require('../quiz');

describe('quiz', () => {
    const mockDb = {
        getModuleData() {},
        updateModuleData() {},
    };

    const instance = new App({ db: mockDb });
    instance.use(quiz);

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
