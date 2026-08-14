/* eslint-disable max-lines-per-function */
import { PlayerNumberMap } from '@everyboard/games';
import { HeuristicUtils } from '@everyboard/games';
import { MGPOptional } from '@everyboard/lib';

import { MancalaConfig } from '../common/MancalaConfig';
import { MancalaDistribution, MancalaMove } from '../common/MancalaMove';
import { MancalaMoveGenerator } from '../common/MancalaMoveGenerator';
import { MancalaNode } from '../common/MancalaRules';
import { MancalaScoreHeuristic } from '../common/MancalaScoreHeuristic';
import { MancalaState } from '../common/MancalaState';

import { AwaleRules } from './AwaleRules';

describe('AwaleScoreHeuristic', () => {
    const rules: AwaleRules = AwaleRules.get();
    const defaultConfig: MancalaConfig = rules.getDefaultRulesConfig();
    let mancalaHeuristic: MancalaScoreHeuristic;
    let moveGenerator: MancalaMoveGenerator;

    beforeEach(() => {
        mancalaHeuristic = new MancalaScoreHeuristic();
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

        HeuristicUtils.expectSecondStateToBeBetterThanFirstFor(mancalaHeuristic,
                                                               weakState, MGPOptional.of(weakMove),
                                                               strongState, MGPOptional.of(strongMove),
                                                               state.getCurrentPlayer(),
                                                               defaultConfig);
    });
});
