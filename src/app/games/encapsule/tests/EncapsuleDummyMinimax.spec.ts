/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions } from '../../../jscaip/AI/AI';
import { DummyHeuristic, Minimax } from '../../../jscaip/AI/Minimax';
import { minimaxTest, SlowTest } from '../../../utils/tests/TestUtils.spec';
import { EncapsuleMove } from '../EncapsuleMove';
import { EncapsuleMoveGenerator } from '../EncapsuleMoveGenerator';
import { EncapsuleConfig, EncapsuleRules } from '../EncapsuleRules';
import { EncapsuleLegalityInformation } from '../EncapsuleRules';
import { EncapsuleState } from '../EncapsuleState';

class EncapsuleDummyMinimax
    extends Minimax<EncapsuleMove, EncapsuleState, EncapsuleConfig, EncapsuleLegalityInformation> {
    public constructor() {
        super('Dummy', EncapsuleRules.get(), new DummyHeuristic(), new EncapsuleMoveGenerator());
    }
}

describe('EncapsuleDummyMinimax', () => {

    const rules: EncapsuleRules = EncapsuleRules.get();
    const minimax: EncapsuleDummyMinimax = new EncapsuleDummyMinimax();
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: EncapsuleConfig = EncapsuleRules.get().getDefaultRulesConfig();

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
