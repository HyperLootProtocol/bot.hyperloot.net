const cloneDeep = require('lodash/cloneDeep');

const needUser = require('../needUser');
const {i18nFactory} = require('../../i18n');
const i18n = i18nFactory();

let ctx = { i18n };

describe('on response with empty user', () => {
    test('throws noLogged error', () => {
        const response = {};

        return expect(needUser(response, ctx)).rejects.toMatch(i18n('noLogged'));
    });
});

describe('on response with user', () => {
    test('returns original response', async () => {
        const expectedResponse = {user: {foo: 'bar'}};
        const actualResponse = await needUser(cloneDeep(expectedResponse), ctx);

        return expect(actualResponse).toEqual(expectedResponse);
    });
});
