// const WARN = 1;
// const ERROR = 2;

module.exports = {
    env: {
        browser: true,
        es2021: true,
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module',
    },
    plugins: [
        '@typescript-eslint',
    ],
    extends: ['eslint:recommended', 'google', 'plugin:@typescript-eslint/recommended'],
    rules: {
        '@typescript-eslint/typedef': [
            'warn',
            {
                'arrowParameter': true,
                'memberVariableDeclaration': true,
                'propertyDeclaration': true,
                'variableDeclaration': true,
                'parameter': true,
            },
        ],
        '@typescript-eslint/no-empty-function': ['off'],
        '@typescript-eslint/no-namespace': ['warn'],
        '@typescript-eslint/ban-types': [
            'error',
            { 'types': { 'String': { 'message': 'Use string instead', 'fixWith': 'string' } } },
        ],
        '@typescript-eslint/no-this-alias': ['warn'],
        '@typescript-eslint/no-inferrable-types': ['off'],

        'max-len': ['warn', { 'code': 120 }],
        'require-jsdoc': ['warn', { 'require': {
            'FunctionDeclaration': false,
            'MethodDefinition': false,
            'ClassDeclaration': false,
            'ArrowFunctionExpression': false,
            'FunctionExpression': false,
        } }],
        'new-cap': ['off'], // Because there are false positives
        'no-undef': ['off'], // Because there are false positives
        'no-unused-vars': ['error'],
        'no-invalid-this': ['warn'],
        'indent': [
            'error', 4,
            {
                'SwitchCase': 1,
                'CallExpression': { 'arguments': 'first' },
                'FunctionDeclaration': { 'parameters': 'first' },
            },
        ],
        'object-curly-spacing': ['warn', 'always'],
        'no-redeclare': ['warn'], // TODO: add option ignoreDeclarationMerge: true and set to error
        'camelcase': ['warn'],
        'valid-jsdoc': ['warn'],
        'no-case-declarations': ['off'],
        'padded-blocks': ['off'],
        'space-before-function-paren': ['error', {
            'anonymous': 'never',
            'named': 'never',
            'asyncArrow': 'never',
        }],
    },
};
