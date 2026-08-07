/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions } from '../../../jscaip/AI/AI';
import { Minimax } from '../../../jscaip/AI/Minimax';
import { EmptyRulesConfig } from '../../../jscaip/RulesConfigUtil';
import { minimaxTest, SlowTest } from '../../../utils/tests/TestUtils.spec';
import { HiveHeuristic } from '../HiveHeuristic';
import { HiveMove } from '../HiveMove';
import { HiveMoveGenerator } from '../HiveMoveGenerator';
import { HiveRules } from '../HiveRules';
import { HiveState } from '../HiveState';

class HiveMinimax extends Minimax<HiveMove, HiveState> {
    public constructor() {
        super('Minimax', HiveRules.get(), new HiveHeuristic(), new HiveMoveGenerator());
    }
}

describe('HiveMinimax', () => {

    const rules: HiveRules = HiveRules.get();
    const minimax: HiveMinimax = new HiveMinimax();
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: EmptyRulesConfig = HiveRules.get().getDefaultRulesConfig();

    SlowTest.it('should be able play against itself', () => {
        minimaxTest({
            rules,
            minimax,
            options: minimaxOptions,
            config: defaultConfig,
            shouldFinish: false,
        });
    });

});
