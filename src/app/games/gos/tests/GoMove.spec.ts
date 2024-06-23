/* eslint-disable max-lines-per-function */
import { AbstractGoRules, GoNode } from '../AbstractGoRules';
import { GoMove } from '../GoMove';
import { EncoderTestUtils } from '@everyboard/lib';
import { GoMoveGenerator } from '../GoMoveGenerator';
import { GoConfig, GoRules } from '../go/GoRules';
import { TriGoConfig, TriGoRules } from '../tri-go/TriGoRules';

describe('GoMove', () => {

    const nodes: { rules: AbstractGoRules<GoConfig | TriGoConfig>, node: GoNode }[] = [
        { rules: GoRules.get(), node: GoRules.get().getInitialNode(GoRules.get().getDefaultRulesConfig()) },
        { rules: TriGoRules.get(), node: TriGoRules.get().getInitialNode(TriGoRules.get().getDefaultRulesConfig()) },
    ];
    for (const rulesAndNode of nodes) {
        it('should have a bijective encoder', () => {
            const moveGenerator: GoMoveGenerator = new GoMoveGenerator(rulesAndNode.rules);
            const firstTurnMoves: GoMove[] = moveGenerator.getListMoves(rulesAndNode.node);
            firstTurnMoves.push(GoMove.PASS);
            firstTurnMoves.push(GoMove.ACCEPT);
            for (const move of firstTurnMoves) {
                EncoderTestUtils.expectToBeBijective(GoMove.encoder, move);
            }
        });
    }

    it('should stringify nicely', () => {
        expect(GoMove.PASS.toString()).toBe('GoMove.PASS');
        expect(GoMove.ACCEPT.toString()).toBe('GoMove.ACCEPT');
        expect(new GoMove(0, 1).toString()).toBe('GoMove(0, 1)');
    });

});
