module.exports = {
    env: {
        browser: true,
        es2021: true,
    },
    overrides: [{
        files: ['*.ts'],
        parser: '@typescript-eslint/parser',
        parserOptions: {
            ecmaVersion: 12,
            sourceType: 'module',
            //        project: 'tsconfig.json',
        },
        plugins: [
            '@typescript-eslint',
        ],
        extends: [
            'eslint:recommended',
            'google',
            'plugin:@typescript-eslint/recommended',
            // 'plugin:@angular-eslint/recommended',
        ],
        rules: {
            'complexity': ['error', 20],
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
            //        '@typescript-eslint/strict-boolean-expressions': ['error'],
            '@typescript-eslint/no-empty-function': ['off'],
            '@typescript-eslint/no-namespace': ['off'],
            '@typescript-eslint/ban-types': [
                'error',
                { 'types': { 'String': { 'message': 'Use string instead', 'fixWith': 'string' } } },
            ],
            '@typescript-eslint/no-this-alias': ['warn'],
            '@typescript-eslint/no-inferrable-types': ['off'],
            '@typescript-eslint/no-redeclare': [
                'error',
                { 'ignoreDeclarationMerge': true },
            ],
            'max-len': ['warn', { 'code': 120, 'ignoreStrings': true, 'ignoreTemplateLiterals': true }],
            'require-jsdoc': ['warn', { 'require': {
                'FunctionDeclaration': false,
                'MethodDefinition': false,
                'ClassDeclaration': false,
                'ArrowFunctionExpression': false,
                'FunctionExpression': false,
            } }],
            'new-cap': ['off'], // Because there are false positives
            'no-undef': ['off'], // Because there are false positives
            'valid-jsdoc': ['off'], // Because we do not use jsdoc
            '@typescript-eslint/no-unused-vars': ['error', { 'args': 'none' }],
            'no-invalid-this': ['warn'],
            'indent': [
                'error', 4,
                {
                    'SwitchCase': 1,
                    'CallExpression': { 'arguments': 'first' },
                    'FunctionDeclaration': { 'parameters': 'first' },
                    'FunctionExpression': { 'parameters': 'first' },
                },
            ],
            'object-curly-spacing': ['error', 'always'],
            'no-redeclare': ['error'],
            'camelcase': ['error'],
            'no-case-declarations': ['off'],
            'padded-blocks': ['off'],
            'space-before-function-paren': ['error', {
                'anonymous': 'never',
                'named': 'never',
                'asyncArrow': 'never',
            }],
            'brace-style': ['off'],
            'eqeqeq': ['error', 'always', {
                'null': 'ignore',
            }],
            'max-lines-per-function': ['off', 20]
        },
    }, {
        files: ['*.html'],
        parser: '@angular-eslint/template-parser',
        plugins: [
        ],
        extends: [
            'plugin:@angular-eslint/template/recommended',
        ],
        'rules': {
            '@angular-eslint/template/i18n': [
                'warn',
                {
                    'checkId': false,
                    'checkText': true,
                    'checkAttributes': true,
                    'ignoreTags': ['title', 'meta', 'app-chat'],
                    'ignoreAttributes': ['href', ':xlink:href', 'r', 'points', 'preserveAspectRatio', 'pointer-events', 'stroke-linecap', 'x', 'y', 'transform', 'refX', 'refY', 'marker-end', 'markerWidth', 'markerHeight', 'orient', 'dx', 'dy', 'text-anchor', 'rx', 'ry', 'x1', 'x2', 'y1', 'y2', 'fill-opacity', 'role', 'cx', 'stroke-dasharray', 'name', 'for', 'step', 'min', 'max', 'scope', 'routerLink', 'debugName', 'value', 'aria-label', 'data-target', 'maxlength', 'ngClass'],
                }
            ]
        },
    }]
};
