/* eslint-disable max-lines-per-function */
import { GoRules } from '../GoRules';
import { GoMinimax } from '../GoMinimax';
import { GoState } from '../GoState';
import { GoMove } from '../GoMove';
import { EncoderTestUtils } from 'src/app/utils/tests/Encoder.spec';

describe('GoMove', () => {

    it('should have a bijective encoder', () => {
        const rules: GoRules = new GoRules(GoState);
        const minimax: GoMinimax = new GoMinimax(rules, 'GoMinimax');
        const firstTurnMoves: GoMove[] = minimax.getListMoves(rules.node);
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
