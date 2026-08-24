import { after, describe, it } from 'node:test';

import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from './no-abstract-component';

RuleTester.afterAll = after;
RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester: RuleTester = new RuleTester();

ruleTester.run('no-abstract-component', rule, {
    valid: [
        `
        @Component({})
        class ConcreteComponent {}
        `,
        `
        @Directive()
        abstract class AbstractDirective {}
        `,
        `
        abstract class AbstractClass {}
        `,
    ],

    invalid: [
        {
            code: `
                @Component({})
                abstract class AbstractComponent {}
            `,
            errors: [
                {
                    messageId: 'abstractComponent',
                },
            ],
        },
    ],
});
