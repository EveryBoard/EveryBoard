/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions, MoveGenerator } from '@everyboard/games';
import { Minimax } from '@everyboard/games';

import { minimaxTest, SlowTest } from '../../../../utils/tests/TestUtils.spec';
import { AwaleRules } from '../../awale/AwaleRules';
import { BaAwaRules } from '../../ba-awa/BaAwaRules';
import { KalahRules } from '../../kalah/KalahRules';
import { MancalaConfig } from '../MancalaConfig';
import { MancalaMove } from '../MancalaMove';
import { MancalaMoveGenerator } from '../MancalaMoveGenerator';
import { MancalaRules } from '../MancalaRules';
import { MancalaScoreHeuristic } from '../MancalaScoreHeuristic';
import { MancalaState } from '../MancalaState';

export class MancalaScoreMinimax extends Minimax<MancalaMove, MancalaState, MancalaConfig> {
    public constructor(rules: MancalaRules, moveGenerator: MoveGenerator<MancalaMove, MancalaState, MancalaConfig>) {
        super('Score', rules, new MancalaScoreHeuristic(), moveGenerator);
    }
}

describe('MancalaScoreMinimax', () => {

    for (const mancalaRules of [AwaleRules, KalahRules, BaAwaRules]) {
        const minimaxOptions: AIDepthLimitOptions = { name: 'Level 2', maxDepth: 2 };

        SlowTest.it('should be able to play against itself', () => {
            const rules: MancalaRules = mancalaRules.get();
            const minimax: MancalaScoreMinimax = new MancalaScoreMinimax(rules, new MancalaMoveGenerator(rules));
            minimaxTest({
                rules,
                minimax,
                options: minimaxOptions,
                config: rules.getDefaultRulesConfig(),
                shouldFinish: true,
            });
        });

        SlowTest.it('should be able to play against itself (other config)', () => {
            const rules: MancalaRules = mancalaRules.get();
            const minimax: MancalaScoreMinimax = new MancalaScoreMinimax(rules, new MancalaMoveGenerator(rules));
            minimaxTest({
                rules,
                minimax,
                options: minimaxOptions,
                config: {
                    ...rules.getDefaultRulesConfig(),
                    width: 4,
                },
                shouldFinish: true,
            });
        });

    }

});
