/* eslint-disable max-lines-per-function */
import { MinimaxTestingRules } from '../MinimaxTestingRules';
import { MinimaxTestingMove } from '../MinimaxTestingMove';
import { MinimaxTestingState } from '../MinimaxTestingState';
import { MinimaxTestingMinimax } from '../MinimaxTestingMinimax';
import { NumberEncoderTestUtils } from 'src/app/jscaip/tests/Encoder.spec';

describe('MinimaxTestingMove', () => {

    it('MinimaxTestingMove.encoder should be correct', () => {
        MinimaxTestingState.initialBoard = MinimaxTestingState.BOARD_1;
        const rules: MinimaxTestingRules = new MinimaxTestingRules(MinimaxTestingState);
        const minimax: MinimaxTestingMinimax = new MinimaxTestingMinimax(rules, 'MinimaxTestingMinimax');
        const firstTurnMoves: MinimaxTestingMove[] = minimax.getListMoves(rules.node);
        for (const move of firstTurnMoves) {
            NumberEncoderTestUtils.expectToBeCorrect(MinimaxTestingMove.encoder, move);
        }
    });
});
