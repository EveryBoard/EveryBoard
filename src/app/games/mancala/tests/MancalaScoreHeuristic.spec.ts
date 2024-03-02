/* eslint-disable max-lines-per-function */
import { HeuristicUtils } from 'src/app/jscaip/AI/tests/HeuristicUtils.spec';
import { MancalaScoreHeuristic } from '../common/MancalaScoreHeurisic';
import { MancalaState } from '../common/MancalaState';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Player } from 'src/app/jscaip/Player';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';
import { AwaleRules } from '../awale/AwaleRules';
import { KalahRules } from '../kalah/KalahRules';
import { MancalaConfig } from '../common/MancalaConfig';

describe('MancalaScoreHeuristic', () => {

    let heuristic: MancalaScoreHeuristic;

    beforeEach(() => {
        heuristic = new MancalaScoreHeuristic();
    });

    for (const mancala of [AwaleRules, KalahRules]) {

        const defaultConfig: MGPOptional<MancalaConfig> = mancala.get().getDefaultRulesConfig();

        it('should prefer board with better score', () => {
            // Given a board with a big score
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
                                                                   defaultConfig);
        });

    }

});
