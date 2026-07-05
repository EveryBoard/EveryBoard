/* eslint-disable max-lines-per-function */
import { MGPOptional } from '@everyboard/lib';

import { HeuristicUtils } from '../../../../jscaip/AI/tests/HeuristicUtils.spec';
import { Player } from '../../../../jscaip/Player';
import { PlayerNumberMap } from '../../../../jscaip/PlayerMap';
import { AwaleRules } from '../../awale/AwaleRules';
import { BaAwaRules } from '../../ba-awa/BaAwaRules';
import { KalahRules } from '../../kalah/KalahRules';
import { MancalaConfig } from '../MancalaConfig';
import { MancalaDistribution, MancalaMove } from '../MancalaMove';
import { MancalaMoveGenerator } from '../MancalaMoveGenerator';
import { MancalaNode } from '../MancalaRules';
import { MancalaScoreHeuristic } from '../MancalaScoreHeuristic';
import { MancalaState } from '../MancalaState';

describe('MancalaScoreHeuristic', () => {

    for (const mancalaRules of [AwaleRules, KalahRules, BaAwaRules]) {

        it('should prefer board with better score', () => {
            const heuristic: MancalaScoreHeuristic = new MancalaScoreHeuristic();
            const defaultConfig: MancalaConfig = mancalaRules.get().getDefaultRulesConfig();
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

    describe('Awale-specific preferences', () => {

        const rules: AwaleRules = AwaleRules.get();
        const defaultConfig: MancalaConfig = rules.getDefaultRulesConfig();
        let heuristic: MancalaScoreHeuristic;
        let moveGenerator: MancalaMoveGenerator;

        beforeEach(() => {
            heuristic = new MancalaScoreHeuristic();
            moveGenerator = new MancalaMoveGenerator(rules);
        });

        it('should prefer capture opportunities immediately', () => {
            const state: MancalaState = new MancalaState([
                [4, 4, 4, 4, 4, 4],
                [4, 4, 4, 4, 4, 1],
            ], 1, PlayerNumberMap.of(0, 0));
            const node: MancalaNode = new MancalaNode(state);
            const strongMove: MancalaMove = MancalaMove.of(MancalaDistribution.of(2));
            const weakMove: MancalaMove = moveGenerator.getListMoves(node, defaultConfig).find((move: MancalaMove) => {
                return move.equals(strongMove) === false;
            })!;
            const weakState: MancalaState = rules.choose(node, weakMove, defaultConfig).get().gameState;
            const strongState: MancalaState = rules.choose(node, strongMove, defaultConfig).get().gameState;

            HeuristicUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                                   weakState, MGPOptional.of(weakMove),
                                                                   strongState, MGPOptional.of(strongMove),
                                                                   state.getCurrentPlayer(),
                                                                   defaultConfig);
        });

    });

});
