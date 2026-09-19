import { ESLintUtils, type TSESLint, type TSESTree } from '@typescript-eslint/utils';

type MessageIds = 'abstractComponent';
type Options = [];

const noAbstractComponent: TSESLint.RuleModule<MessageIds, Options> = ESLintUtils.RuleCreator.withoutDocs({
    meta: {
        type: 'problem',
        schema: [],
        messages: {
            abstractComponent:
                'Abstract classes should not be decorated with @Component. Use @Directive instead.',
        },
    },
    defaultOptions: [],
    create(context: Readonly<TSESLint.RuleContext<MessageIds, Options>>) {
        return {
            ClassDeclaration(node: TSESTree.ClassDeclaration): void {
                if (!node.abstract) {
                    return;
                }

                const hasComponent: boolean = node.decorators.some((decorator: TSESTree.Decorator) =>
                    decorator.expression.type === 'CallExpression' &&
                    decorator.expression.callee.type === 'Identifier' &&
                    decorator.expression.callee.name === 'Component',
                );

                if (hasComponent) {
                    context.report({
                        node,
                        messageId: 'abstractComponent',
                    });
                }
            },
        };
    },
});

export default noAbstractComponent;
