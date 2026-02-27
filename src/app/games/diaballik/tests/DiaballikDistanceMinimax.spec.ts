/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions } from '../../../jscaip/AI/AI';
import { NoConfig } from '../../../jscaip/RulesConfigUtil';
import { minimaxTest, SlowTest } from '../../../utils/tests/TestUtils.spec';
import { DiaballikDistanceMinimax } from '../DiaballikDistanceMinimax';
import { DiaballikFilteredMoveGenerator } from '../DiaballikFilteredMoveGenerator';
import { DiaballikMoveGenerator } from '../DiaballikMoveGenerator';
import { DiaballikRules } from '../DiaballikRules';

describe('DiaballikDistanceMinimax', () => {

    const rules: DiaballikRules = DiaballikRules.get();
    const moveGenerator: DiaballikMoveGenerator = new DiaballikFilteredMoveGenerator(3, false);
    const minimax: DiaballikDistanceMinimax = new DiaballikDistanceMinimax('distance', moveGenerator);
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: NoConfig = DiaballikRules.get().getDefaultRulesConfig();

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
