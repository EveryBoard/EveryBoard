import { HeuristicUtils } from '../../../jscaip/AI/tests/HeuristicUtils.spec';
import { PlayerNumberMap } from '../../../jscaip/PlayerMap';
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
        const node: MancalaNode = MancalaNode.root(state);
        const strongMove: MancalaMove = MancalaMove.of(MancalaDistribution.of(2, 0));
        const weakMove: MancalaMove = moveGenerator.getListMoves(node, defaultConfig).find((move: MancalaMove) => {
            return move.equals(strongMove) === false;
        })!;
        const weakNode: MancalaNode = rules.choose(node, weakMove, defaultConfig).get();
        const strongNode: MancalaNode = rules.choose(node, strongMove, defaultConfig).get();

        HeuristicUtils.expectSecondNodeToBeBetterThanFirstFor(
            mancalaHeuristic,
            weakNode,
            strongNode,
            state.getCurrentPlayer(),
            defaultConfig,
        );
    });
});
