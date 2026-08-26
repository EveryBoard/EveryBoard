import type { TSESLint } from '@typescript-eslint/utils';

import noAbstractComponent from './no-abstract-component';

const plugin: TSESLint.FlatConfig.Plugin = {
    meta: {
        name: 'eslint-plugin-everyboard',
        version: '1.0.0',
    },
    rules: {
        'no-abstract-component': noAbstractComponent,
    },
};

export = plugin;
