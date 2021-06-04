import { GoRules } from '../GoRules';
import { GoMinimax } from '../GoMinimax';
import { GoPartSlice } from '../GoPartSlice';
import { GoMove } from '../GoMove';
import { NumberEncoderTestUtils } from 'src/app/jscaip/tests/Encoder.spec';

describe('GoMove', () => {
    it('GoMove.encoder should be correct', () => {
        const rules: GoRules = new GoRules(GoPartSlice);
        const minimax: GoMinimax = new GoMinimax(rules, 'GoMinimax');
        const firstTurnMoves: GoMove[] = minimax.getListMoves(rules.node);
        firstTurnMoves.push(GoMove.PASS);
        firstTurnMoves.push(GoMove.ACCEPT);
        for (let i: number = 0; i < firstTurnMoves.length; i++) {
            const move: GoMove = firstTurnMoves[i];
            NumberEncoderTestUtils.expectToBeCorrect(GoMove.encoder, move);
        }
    });
});
