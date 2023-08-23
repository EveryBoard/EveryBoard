/* eslint-disable max-lines-per-function */
import { AwaleState } from '../AwaleState';
import { Table } from 'src/app/utils/ArrayUtils';
import { AwaleScoreHeuristic } from '../AwaleScoreHeuristic';
import { HeuristicUtils } from 'src/app/jscaip/tests/HeuristicUtils.spec';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Player } from 'src/app/jscaip/Player';

describe('AwaleScoreHeuristic', () => {

    let heuristic: AwaleScoreHeuristic;

    beforeEach(() => {
        heuristic = new AwaleScoreHeuristic();
    });
    it('should prefer a higher score', () => {
        // Given a state with more pieces captured than another state
        const board: Table<number> = [
            [1, 0, 0, 0, 0, 2],
            [0, 0, 0, 0, 1, 0],
        ];
        const weakState: AwaleState = new AwaleState(board, 1, [22, 22]);
        const strongState: AwaleState = new AwaleState(board, 1, [23, 21]);
        // When computing their values
        // Then it should prefer having a higher score
        HeuristicUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                               weakState, MGPOptional.empty(),
                                                               strongState, MGPOptional.empty(),
                                                               Player.ZERO);
    });
});
