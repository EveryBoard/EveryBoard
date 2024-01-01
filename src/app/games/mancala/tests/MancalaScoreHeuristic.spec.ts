/* eslint-disable max-lines-per-function */
import { HeuristicUtils } from 'src/app/jscaip/tests/HeuristicUtils.spec';
import { MancalaScoreHeuristic } from '../common/MancalaScoreHeurisic';
import { MancalaState } from '../common/MancalaState';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Player } from 'src/app/jscaip/Player';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';
import { MancalaConfig } from '../common/MancalaConfig';

describe('MancalaScoreHeuristic', () => {

    let heuristic: MancalaScoreHeuristic;

    beforeEach(() => {
        heuristic = new MancalaScoreHeuristic();
    });

    it('should prefer board with better score', () => {
        // Given a board with a big score
        const config: MGPOptional<MancalaConfig> = MGPOptional.of({
            feedOriginalHouse: true,
            mustContinueDistributionAfterStore: true,
            mustFeed: true,
            passByPlayerStore: true,
            seedsByHouse: 4,
            width: 6,
        });
        const board: number[][] = [
            [0, 0, 0, 3, 2, 1],
            [1, 2, 3, 0, 0, 0],
        ];
        const strongState: MancalaState = new MancalaState(board, 0, PlayerNumberMap.of(10, 0));
        // And a board with a little score
        const weakState: MancalaState = new MancalaState(board, 0, PlayerNumberMap.of(0, 0));

        // When comparing both
        // Then the bigger score should be better
        HeuristicUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                               weakState, MGPOptional.empty(),
                                                               strongState, MGPOptional.empty(),
                                                               Player.ZERO,
                                                               config);
    });

});
