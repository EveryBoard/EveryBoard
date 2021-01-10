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
    extends: ['eslint:recommended', 'google', 'plugin:@typescript-eslint/recommended' ],
    rules: {
        '@typescript-eslint/typedef': ['error', {'arrowParameter': true, 'memberVariableDeclaration': true, 'propertyDeclaration': true, 'variableDeclaration': true, 'parameter': true}],
        '@typescript-eslint/no-empty-function': ['off'],
        '@typescript-eslint/no-namespace': ['warn'],
        '@typesscript-eslint/ban-types': ['warn'],
        'max-len': ['warn', {'code': 80}],
        'require-jsdoc': ['warn', {'require': {
            "FunctionDeclaration": false,
            "MethodDefinition": false,
            "ClassDeclaration": false,
            "ArrowFunctionExpression": false,
            "FunctionExpression": false
        }}],
        'new-cap': ['off'], // Because there are false positives
        'no-undef': ['off'], // Because there are false positives
        'no-unused-vars': ['warn'],
        'no-invalid-this': ['warn'],
        'indent': ['error', 4],
        'object-curly-spacing': ['warn', 'always'],
        'no-redeclare': ['warn'], // TODO: add option ignoreDeclarationMerge: true and set to error
        'camelcase': ['warn'],
        'valid-jsdoc': ['warn'],
        'no-case-declarations': ['warn']
    }
};
