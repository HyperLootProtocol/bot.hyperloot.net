module.exports = {
    'env': {
        'es6': true,
        'node': true,
        'jest/globals': true
    },

    'ecmaFeatures': {
        'jsx': true
    },

    'extends': ['airbnb', 'plugin:react/recommended'],

    'plugins': ['jest'],

    'rules': {
        'func-names': 'off',
        'indent': [
            'error',
            4
        ],
        'max-len': [
            'warn',
            120
        ],
        'no-await-in-loop': 'warn',
        'no-console': 'off',
        'no-plusplus': 'off',
        'no-throw-literal': 'off',
        'no-underscore-dangle': 'off',

        // jest
        'jest/no-disabled-tests': 'warn',
        'jest/no-focused-tests': 'error',
        'jest/no-identical-title': 'error',
        'jest/prefer-to-have-length': 'warn',
        'jest/valid-expect': 'error'
    }
};
