const OFF = 0;
const WARN = 1;
const ERROR = 2;

module.exports = {
    env: {
        browser: true,
        es2021: true
    },
    extends: [
        'standard'
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module'
    },
    plugins: [
        '@typescript-eslint'
    ],
    rules: {
        'semi': [WARN, 'always'],
        'space-before-function-paren': [WARN, 'never'],
        'quotes': [WARN, 'single'],
        'indent': [WARN, 4],
        'quote-props': [OFF],
        'line-between-class-members': [WARN, 'always']
    }
};
