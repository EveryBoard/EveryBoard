/* eslint-disable max-lines-per-function */
import { MancalaState } from '../../common/MancalaState';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Player } from 'src/app/jscaip/Player';
import { KalahScoreHeuristic } from '../KalahScoreHeuristic';
import { HeuristicUtils } from 'src/app/jscaip/tests/HeuristicUtils.spec';

describe('KalahScoreHeuristic', () => {

    let heuristic: KalahScoreHeuristic;

    beforeEach(() => {
        heuristic = new KalahScoreHeuristic();
    });
    it('should prefer board with better score', () => {
        // Given a board with a big score
        const board: number[][] = [
            [0, 0, 0, 3, 2, 1],
            [1, 2, 3, 0, 0, 0],
        ];
        const strongState: MancalaState = new MancalaState(board, 0, [10, 0]);
        // And a board with a little score
        const weakState: MancalaState = new MancalaState(board, 0, [0, 0]);

        // When comparing both
        // Then the bigger score should be better
        HeuristicUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                               weakState,
                                                               MGPOptional.empty(),
                                                               strongState,
                                                               MGPOptional.empty(),
                                                               Player.ZERO);
    });
});
