module.exports = {
    'env': {
        'es6': true,
        'node': true,
        'jest/globals': true
    },

    'extends': ['airbnb'],

    'plugins': ['jest'],

    'rules': {
        'indent': [
            'error',
            4
        ],
        'no-plusplus': 'off',
        'no-throw-literal': 'off',

        // jest
        'jest/no-disabled-tests': 'warn',
        'jest/no-focused-tests': 'error',
        'jest/no-identical-title': 'error',
        'jest/prefer-to-have-length': 'warn',
        'jest/valid-expect': 'error'
    }
};
