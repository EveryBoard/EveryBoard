/* eslint-disable max-lines-per-function */
import { GoNode } from '../AbstractGoRules';
import { GoMove } from '../GoMove';
import { EncoderTestUtils } from '@everyboard/lib';
import { GoMoveGenerator } from '../GoMoveGenerator';
import { GoRules } from '../go/GoRules';
import { TriGoRules } from '../tri-go/TriGoRules';

fdescribe('GoMove', () => {

    const nodes: GoNode[] = [
        GoRules.get().getInitialNode(GoRules.get().getDefaultRulesConfig()),
        TriGoRules.get().getInitialNode(TriGoRules.get().getDefaultRulesConfig()),
    ];
    for (const node of nodes) {
        it('should have a bijective encoder', () => {
            const moveGenerator: GoMoveGenerator = new GoMoveGenerator();
            const firstTurnMoves: GoMove[] = moveGenerator.getListMoves(node);
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
