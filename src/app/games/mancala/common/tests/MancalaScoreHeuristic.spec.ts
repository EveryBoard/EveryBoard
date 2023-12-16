/* eslint-disable max-lines-per-function */
import { HeuristicUtils } from 'src/app/jscaip/tests/HeuristicUtils.spec';
import { MancalaScoreHeuristic } from '../MancalaScoreHeurisic';
import { MancalaState } from '../MancalaState';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Player } from 'src/app/jscaip/Player';
import { MancalaConfig } from '../MancalaConfig';
import { KalahRules } from '../../kalah/KalahRules';
import { AwaleRules } from '../../awale/AwaleRules';

fdescribe('MancalaScoreHeuristic', () => {

    let heuristic: MancalaScoreHeuristic;
    let defaultConfig: MGPOptional<MancalaConfig>;

    beforeEach(() => {
        heuristic = new MancalaScoreHeuristic();
    });

    for (const mancala of [AwaleRules, KalahRules]) {

        it('should prefer board with better score', () => {
            // Given a board with a big score
            defaultConfig = mancala.get().getDefaultRulesConfig();
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
                                                                   weakState, MGPOptional.empty(),
                                                                   strongState, MGPOptional.empty(),
                                                                   Player.ZERO,
                                                                   defaultConfig);
        });

    }

});
