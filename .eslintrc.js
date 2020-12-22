const OFF = 0;
const WARN = 1;
const ERROR = 2;

module.exports = {
    env: {
        browser: true,
        es2021: true
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module'
    },
    plugins: [
        '@typescript-eslint'
    ],
    "extends": ["eslint:recommended", "google"],
    /*rules: {
        'semi': [WARN, 'always'],
        'space-before-function-paren': [WARN, 'never'],
        'quotes': [WARN, 'single'],
        'indent': [WARN, 4],
        'quote-props': [OFF],
        'lines-between-class-members': [WARN, 'always'],
        'object-curly-spacing': [WARN, 'always'],
        'padded-blocks': [WARN, 'never'],
        'array-bracket-spacing': [WARN, 'never'],
        'comma-dangle': [WARN, 'never'],
        'eol-last': [WARN, 'always'],
        'quotes': [WARN, 'single'],
        'no-multi-spaces': [WARN, {'ignoreEOLComments': true}]
    }*/
};
