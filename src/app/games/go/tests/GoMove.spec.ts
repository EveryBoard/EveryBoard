/* eslint-disable max-lines-per-function */
import { GoNode, GoRules } from '../GoRules';
import { GoMove } from '../GoMove';
import { EncoderTestUtils } from '@everyboard/lib';
import { GoMoveGenerator } from '../GoMoveGenerator';

describe('GoMove', () => {

    it('should have a bijective encoder', () => {
        const rules: GoRules = GoRules.get();
        const moveGenerator: GoMoveGenerator = new GoMoveGenerator();
        const node: GoNode = rules.getInitialNode();
        const firstTurnMoves: GoMove[] = moveGenerator.getListMoves(node);
        firstTurnMoves.push(GoMove.PASS);
        firstTurnMoves.push(GoMove.ACCEPT);
        for (const move of firstTurnMoves) {
            EncoderTestUtils.expectToBeBijective(GoMove.encoder, move);
        }
    });
    it('should stringify nicely', () => {
        expect(GoMove.PASS.toString()).toBe('GoMove.PASS');
        expect(GoMove.ACCEPT.toString()).toBe('GoMove.ACCEPT');
        expect(new GoMove(0, 1).toString()).toBe('GoMove(0, 1)');
    });
});
