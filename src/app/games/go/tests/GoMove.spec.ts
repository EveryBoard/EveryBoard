import { GoRules } from '../GoRules';
import { GoMinimax } from '../GoMinimax';
import { GoState } from '../GoState';
import { GoMove } from '../GoMove';
import { NumberEncoderTestUtils } from 'src/app/jscaip/tests/Encoder.spec';

describe('GoMove', () => {

    it('GoMove.encoder should be correct', () => {
        const rules: GoRules = new GoRules(GoState);
        const minimax: GoMinimax = new GoMinimax(rules, 'GoMinimax');
        const firstTurnMoves: GoMove[] = minimax.getListMoves(rules.node);
        firstTurnMoves.push(GoMove.PASS);
        firstTurnMoves.push(GoMove.ACCEPT);
        for (let i: number = 0; i < firstTurnMoves.length; i++) {
            const move: GoMove = firstTurnMoves[i];
            NumberEncoderTestUtils.expectToBeCorrect(GoMove.encoder, move);
        }
    });
    it('Should stringify nicely', () => {
        expect(GoMove.PASS.toString()).toBe('GoMove.PASS');
        expect(GoMove.ACCEPT.toString()).toBe('GoMove.ACCEPT');
        expect(new GoMove(0, 1).toString()).toBe('GoMove(0, 1)');
    });
});
