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
    rules: {
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
        'no-redeclare': ['warn'], // TODO: add option ignoreDeclarationMerge: true and set to error
    }
};
