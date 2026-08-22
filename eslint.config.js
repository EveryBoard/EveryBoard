const eslint = require('@eslint/js');
const stylisticTs = require('@stylistic/eslint-plugin-ts');
const angularEslint = require('angular-eslint');
const google = require('eslint-config-google');
const importPlugin = require('eslint-plugin-import');
const jasmine = require('eslint-plugin-jasmine');
const globals = require('globals');
const typescriptEslint = require('typescript-eslint');

const mergeRules = (configs) => Object.assign({}, ...configs.map((config) => config.rules ?? {}));
const googleRules = { ...google.rules };

// These deprecated core rules were removed in ESLint 9. The old configuration
// disabled valid-jsdoc and configured require-jsdoc not to require anything.
delete googleRules['require-jsdoc'];
delete googleRules['valid-jsdoc'];

module.exports = [{
    ignores: [
        '**/node_modules/**', // don't lint node_modules (we are not responsible for defects in other people's code!)
        '**/dist/**', // don't lint build output
        '**/coverage/**', // don't lint coverage output
    ],
}, {
    files: ['**/*.ts'],
    languageOptions: {
        parser: typescriptEslint.parser,
        ecmaVersion: 2021,
        sourceType: 'module',
        globals: {
            ...globals.browser,
            ...globals.es2021,
        },
        parserOptions: {
            project: 'tsconfig.json',
            tsconfigRootDir: __dirname,
        },
    },
    plugins: {
        '@angular-eslint': angularEslint.tsPlugin,
        '@stylistic/ts': stylisticTs,
        '@typescript-eslint': typescriptEslint.plugin,
        import: importPlugin,
        jasmine,
    },
    rules: {
        ...eslint.configs.recommended.rules,
        ...googleRules,
        ...mergeRules(typescriptEslint.configs.recommended),
        ...mergeRules(angularEslint.configs.tsRecommended),
        ...jasmine.configs.recommended.rules,
        'import/order': [
            'error', {
                groups: [
                    'builtin',
                    'external',
                    'internal',
                    'parent',
                    ['sibling', 'index'],
                ],
                pathGroups: [
                    {
                        pattern: '@everyboard/**',
                        group: 'internal',
                        position: 'after',
                    },
                ],
                pathGroupsExcludedImportTypes: ['builtin'],
                'newlines-between': 'always',
                alphabetize: {
                    order: 'asc',
                    caseInsensitive: false,
                },
            },
        ],
        '@typescript-eslint/no-floating-promises': ['error'],
        'jasmine/no-unsafe-spy': ['off'],
        'jasmine/no-expect-in-setup-teardown': ['off'],
        'jasmine/no-spec-dupes': ['error', 'branch'],
        'jasmine/no-suite-dupes': ['error', 'branch'],
        'jasmine/expect-matcher': ['error'],
        'jasmine/new-line-before-expect': ['off'],
        'jasmine/new-line-between-declarations': ['off'],
        'no-restricted-imports': [
            'error',
            {
                patterns: [
                    'src/*',
                    'src/**',
                ],
            },
        ],
        'no-warning-comments': [
            'error',
            { terms: ['todo', 'fixme', 'xxx', 'review'], location: 'start' },
        ],
        complexity: ['error', 20],
        '@angular-eslint/no-output-rename': ['warn'],
        '@angular-eslint/component-class-suffix': ['warn'],
        '@stylistic/ts/member-delimiter-style': [
            'error',
            {
                multiline: {
                    delimiter: 'semi',
                    requireLast: true,
                },
                singleline: {
                    delimiter: 'semi',
                    requireLast: true,
                },
                overrides: {
                    typeLiteral: {
                        multiline: {
                            delimiter: 'semi',
                            requireLast: true,
                        },
                        singleline: {
                            delimiter: 'semi',
                            requireLast: false,
                        },
                    },
                },
            },
        ],
        '@typescript-eslint/no-unnecessary-condition': ['warn'],
        '@typescript-eslint/no-unnecessary-type-arguments': ['warn'],
        '@typescript-eslint/no-unnecessary-type-assertion': ['warn'],
        '@typescript-eslint/no-unnecessary-type-constraint': ['warn'],
        '@typescript-eslint/prefer-for-of': ['warn'],
        '@typescript-eslint/prefer-nullish-coalescing': ['warn'],
        '@typescript-eslint/prefer-readonly': ['error'],
        '@typescript-eslint/switch-exhaustiveness-check': [
            'warn',
            { allowDefaultCaseForExhaustiveSwitch: true, considerDefaultExhaustiveForUnions: true },
        ],
        '@typescript-eslint/no-unused-expressions': ['warn'],
        '@typescript-eslint/no-unused-vars': ['warn'],
        '@typescript-eslint/no-useless-constructor': ['warn'],
        '@typescript-eslint/typedef': [
            'error',
            {
                arrowParameter: true,
                memberVariableDeclaration: true,
                propertyDeclaration: true,
                variableDeclaration: true,
                parameter: true,
            },
        ],
        '@typescript-eslint/strict-boolean-expressions': ['warn'],
        '@typescript-eslint/no-empty-function': ['off'],
        '@typescript-eslint/no-namespace': ['off'],
        '@typescript-eslint/explicit-function-return-type': ['error'],
        '@typescript-eslint/no-empty-object-type': ['error'],
        '@typescript-eslint/no-unsafe-function-type': ['error'],
        '@typescript-eslint/no-wrapper-object-types': ['error'],
        '@typescript-eslint/no-this-alias': ['error'],
        '@typescript-eslint/no-inferrable-types': ['off'],
        '@typescript-eslint/no-redeclare': [
            'error',
            { ignoreDeclarationMerge: true },
        ],
        '@typescript-eslint/explicit-member-accessibility': [
            'error',
            {
                accessibility: 'explicit',
            },
        ],
        'dot-notation': ['warn'],
        'max-len': ['error', { code: 120, ignoreStrings: true, ignoreTemplateLiterals: true }],
        '@typescript-eslint/no-shadow': 'error',
        'new-cap': ['off'],
        'no-undef': ['off'],
        '@typescript-eslint/no-unused-vars': ['error', { args: 'none' }],
        'no-invalid-this': ['warn'],
        indent: [
            'error', 4,
            {
                SwitchCase: 1,
                CallExpression: { arguments: 'first' },
                FunctionDeclaration: { parameters: 'first' },
                FunctionExpression: { parameters: 'first' },
            },
        ],
        'object-curly-spacing': ['error', 'always'],
        'no-redeclare': ['off'],
        camelcase: ['error'],
        'no-case-declarations': ['off'],
        'padded-blocks': ['off'],
        'space-before-function-paren': ['error', {
            anonymous: 'never',
            named: 'never',
            asyncArrow: 'never',
        }],
        'brace-style': ['off'],
        eqeqeq: ['error', 'always', {
            null: 'ignore',
        }],
        'max-lines-per-function': ['warn', 50],
    },
}, {
    files: ['src/app/**/*.html'],
    languageOptions: {
        parser: angularEslint.templateParser,
    },
    plugins: {
        '@angular-eslint/template': angularEslint.templatePlugin,
    },
    rules: {
        ...mergeRules(angularEslint.configs.templateRecommended),
        '@angular-eslint/template/i18n': [
            'warn',
            {
                checkId: false,
                checkText: true,
                checkAttributes: true,
                ignoreTags: ['title', 'meta', 'app-chat'],
                ignoreAttributes: [
                    'href', ':xlink:href', 'r', 'points', 'preserveAspectRatio', 'pointer-events',
                    'stroke-linecap', 'x', 'y', 'transform', 'refX', 'refY', 'marker-end', 'markerWidth',
                    'markerHeight', 'orient', 'dx', 'dy', 'text-anchor', 'rx', 'ry', 'x1', 'x2', 'y1',
                    'y2', 'fill-opacity', 'role', 'cx', 'stroke-dasharray', 'name', 'for', 'step', 'min',
                    'max', 'scope', 'routerLink', 'debugName', 'value', 'aria-label', 'data-target',
                    'maxlength', 'ngClass',
                ],
            },
        ],
    },
}];
