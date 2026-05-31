/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions } from '../../../../jscaip/AI/AI';
import { Minimax } from '../../../../jscaip/AI/Minimax';
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

describe('Mancala score profile', () => {

    for (const mancalaRules of [AwaleRules, KalahRules, BaAwaRules]) {
        const minimaxOptions: AIDepthLimitOptions = { name: 'Level 2', maxDepth: 2 };

        SlowTest.it('should be able to play against itself', () => {
            const rules: MancalaRules = mancalaRules.get();
            const minimax: Minimax<MancalaMove, MancalaState, MancalaConfig> =
                new Minimax($localize`Score`,
                            rules,
                            new MancalaScoreHeuristic(),
                            new MancalaMoveGenerator(rules));
            minimax.configureFromConfig({ useTranspositionTables: false });
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
            const minimax: Minimax<MancalaMove, MancalaState, MancalaConfig> =
                new Minimax($localize`Score`,
                            rules,
                            new MancalaScoreHeuristic(),
                            new MancalaMoveGenerator(rules));
            minimax.configureFromConfig({ useTranspositionTables: false });
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
