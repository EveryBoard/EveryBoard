import { MinimaxTestingRules } from '../MinimaxTestingRules';
import { MinimaxTestingMove } from '../MinimaxTestingMove';
import { MinimaxTestingPartSlice } from '../MinimaxTestingPartSlice';
import { MinimaxTestingMinimax } from '../MinimaxTestingMinimax';
import { NumberEncoderTestUtils } from 'src/app/jscaip/tests/Encoder.spec';

describe('MinimaxTestingMove', () => {
    it('MinimaxTestingMove.encoder should be correct', () => {
        MinimaxTestingPartSlice.initialBoard = MinimaxTestingPartSlice.BOARD_1;
        const rules: MinimaxTestingRules = new MinimaxTestingRules(MinimaxTestingPartSlice);
        const minimax: MinimaxTestingMinimax = new MinimaxTestingMinimax(rules, 'MinimaxTestingMinimax');
        const firstTurnMoves: MinimaxTestingMove[] = minimax.getListMoves(rules.node);
        for (const move of firstTurnMoves) {
            NumberEncoderTestUtils.expectToBeCorrect(MinimaxTestingMove.encoder, move);
        }
    });
});
