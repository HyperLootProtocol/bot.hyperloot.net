const App = require('../app');

const simple = (response) => response;
const mutator = (response) => ({ ...response, test: true });
const echo = (response, context) => ({ ...response, output: context.input });

const inccorrect = 'dont do it';
// const breaker = (response) => {dont: 'do it'};

const preventer = (response) => null;
const mutator2 = (response) => ({ ...response, test2: true });

describe('app with single executor', () => {
    test('without input should return empty string', async (done) => {
        const instance = new App();

        instance.use(simple);

        instance.process({
            input: '',
            handle(response) {
                expect(response).toHaveProperty('output', '');
                done();
            },
        });
    });

    test('should provide response mutation functionality', async (done) => {
        const instance = new App();

        instance.use(mutator);

        instance.process({
            input: '',
            handle(response) {
                expect(response).toHaveProperty('test', true);
                done();
            },
        });
    });

    test('can provide output mutation based on context (input)', async (done) => {
        const instance = new App();
        const msg = 'lol';

        instance.use(echo);

        instance.process({
            input: msg,
            handle(response) {
                expect(response).toHaveProperty('output', msg);
                done();
            },
        });
    });

    test('can pass only func or array', async (done) => {
        const instance = new App();

        instance.use(inccorrect);

        expect(() => {
            instance.process({
                input: '',
                handle() { done(); },
            });
        }).toThrow();
    })

});


describe('app with module', () => {
    test('without input should return empty string', async (done) => {
        const instance = new App();

        instance.use([simple, simple, simple]);

        instance.process({
            input: '',
            handle(response) {
                expect(response).toHaveProperty('output', '');
                done();
            },
        });
    });

    test('should provide response several mutation functionality', async (done) => {
        const instance = new App();

        instance.use([mutator, mutator2]);

        instance.process({
            input: '',
            handle(response) {
                expect(response).toHaveProperty('test', true);
                expect(response).toHaveProperty('test2', true);
                done();
            },
        });
    });

    test('should provide output mutatiion', async (done) => {
        const instance = new App();
        const msg = 'lol';

        instance.use([mutator, mutator2, echo]);

        instance.process({
            input: msg,
            handle(response) {
                expect(response).toHaveProperty('output', msg);
                done();
            },
        });
    });

    test('should provide mutation skipping', async (done) => {
        const instance = new App();
        const msg = 'lol';

        instance.use([preventer, mutator, mutator2, echo]);

        instance.process({
            input: msg,
            handle(response) {
                expect(response).toEqual({output: ''});
                done();
            },
        });
    });
})
