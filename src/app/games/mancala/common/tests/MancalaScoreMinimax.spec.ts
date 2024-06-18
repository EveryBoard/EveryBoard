/* eslint-disable max-lines-per-function */

import { AIDepthLimitOptions } from 'src/app/jscaip/AI/AI';
import { minimaxTest, SlowTest } from 'src/app/utils/tests/TestUtils.spec';
import { AwaleRules } from '../../awale/AwaleRules';
import { BaAwaRules } from '../../ba-awa/BaAwaRules';
import { KalahRules } from '../../kalah/KalahRules';
import { MancalaMoveGenerator } from '../MancalaMoveGenerator';
import { MancalaRules } from '../MancalaRules';
import { MancalaScoreMinimax } from '../MancalaScoreMinimax';

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
    }

});
