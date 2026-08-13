/* eslint-disable max-lines-per-function */
import { Player } from '@everyboard/games';
import { PlayerNumberMap } from '@everyboard/games';
import { MGPOptional } from '@everyboard/lib';

import { BoardValue } from '../../../../jscaip/AI/BoardValue';
import { HeuristicBounds } from '../../../../jscaip/AI/Heuristic';
import { HeuristicUtils } from '../../../../jscaip/AI/tests/HeuristicUtils.spec';
import { PlayerNumberTable } from '../../../../jscaip/PlayerNumberTable';
import { AwaleRules } from '../../awale/AwaleRules';
import { BaAwaRules } from '../../ba-awa/BaAwaRules';
import { KalahRules } from '../../kalah/KalahRules';
import { MancalaConfig } from '../MancalaConfig';
import { MancalaNode } from '../MancalaRules';
import { MancalaScoreHeuristic } from '../MancalaScoreHeuristic';
import { MancalaState } from '../MancalaState';

describe('MancalaScoreHeuristic', () => {

    let heuristic: MancalaScoreHeuristic;

    beforeEach(() => {
        heuristic = new MancalaScoreHeuristic();
    });

    for (const mancalaRules of [AwaleRules, KalahRules, BaAwaRules]) {
        const defaultConfig: MancalaConfig = mancalaRules.get().getDefaultRulesConfig();

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

        it('should define heuristic bounds', () => {
            // Given the heuristic
            // When computing its bounds on the default config
            const bounds: HeuristicBounds<BoardValue> = heuristic.getBounds(defaultConfig);
            // Then it should be the maximal score (48) for each player
            expect(bounds.player0Best).toEqual(BoardValue.ofSingle(48, 0));
            expect(bounds.player1Best).toEqual(BoardValue.ofSingle(0, 48));
        });


        it('should return the score metrics', () => {
            // Given a state with scores
            const board: number[][] = [
                [0, 0, 0, 3, 2, 1],
                [1, 2, 3, 0, 0, 0],
            ];
            const state: MancalaState = new MancalaState(board, 0, PlayerNumberMap.of(7, 5));
            const node: MancalaNode = new MancalaNode(state);

            // When computing the metrics
            const metrics: PlayerNumberTable = heuristic.getMetrics(node, defaultConfig);

            // Then they should match the current scores
            expect(metrics).toEqual(PlayerNumberTable.ofSingle(7, 5));
        });
    }

});
