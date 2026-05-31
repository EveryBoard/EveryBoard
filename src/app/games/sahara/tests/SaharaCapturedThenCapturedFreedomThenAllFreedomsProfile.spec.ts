/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions } from '../../../jscaip/AI/AI';
import { Minimax } from '../../../jscaip/AI/Minimax';
import { EmptyRulesConfig } from '../../../jscaip/RulesConfigUtil';
import { minimaxTest, SlowTest } from '../../../utils/tests/TestUtils.spec';
import { SaharaCapturedThenCapturedFreedomThenAllFreedomsHeuristic } from '../SaharaCapturedThenCapturedFreedomThenAllFreedomsHeuristic';
import { SaharaMove } from '../SaharaMove';
import { SaharaMoveGenerator } from '../SaharaMoveGenerator';
import { SaharaRules } from '../SaharaRules';
import { SaharaState } from '../SaharaState';

describe('Sahara captured/freedom profile', () => {

    const rules: SaharaRules = SaharaRules.get();
    const minimax: Minimax<SaharaMove, SaharaState> =
        new Minimax($localize`Capture > Captured Freedom > All Freedoms`,
                    rules,
                    new SaharaCapturedThenCapturedFreedomThenAllFreedomsHeuristic(rules),
                    new SaharaMoveGenerator());
    minimax.configureFromConfig({ useRandomness: true, useTranspositionTables: false });
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: EmptyRulesConfig = SaharaRules.get().getDefaultRulesConfig();

    SlowTest.it('should be able play against itself', () => {
        minimaxTest({
            rules,
            minimax,
            options: minimaxOptions,
            config: defaultConfig,
            shouldFinish: true,
        });
    });

});
