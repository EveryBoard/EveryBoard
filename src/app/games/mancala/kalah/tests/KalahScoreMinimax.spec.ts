/* eslint-disable max-lines-per-function */
import { KalahMove } from '../KalahMove';
import { KalahNode } from '../KalahRules';
import { MancalaState } from '../../common/MancalaState';
import { MancalaDistribution } from '../../common/MancalaMove';
import { Minimax } from 'src/app/jscaip/Minimax';
import { KalahScoreMinimax } from '../KalahScoreMinimax';

describe('KalahScoreMinimax', () => {

    let minimax: Minimax<KalahMove, MancalaState>;

    beforeEach(() => {
        minimax = new KalahScoreMinimax();
    });
    it('should choose longest distribution when there is no capture', () => {
        // Given a board with a big distribution possible
        const board: number[][] = [
            [0, 0, 0, 3, 2, 1],
            [1, 2, 3, 0, 0, 0],
        ];
        const state: MancalaState = new MancalaState(board, 0, [0, 0]);
        const node: KalahNode = new KalahNode(state);

        // When choosing the best choice
        const expectedBestMove: KalahMove =
            KalahMove.of(MancalaDistribution.ZERO,
                         [
                             MancalaDistribution.ONE,
                             MancalaDistribution.ZERO,
                             MancalaDistribution.TWO,
                             MancalaDistribution.ZERO,
                             MancalaDistribution.ONE,
                         ]);
        const best: KalahMove = minimax.chooseNextMove(node, { name: 'Level 1', maxDepth: 1 });

        // Then the minimax should take it
        expect(best).toEqual(expectedBestMove);
    });
});
