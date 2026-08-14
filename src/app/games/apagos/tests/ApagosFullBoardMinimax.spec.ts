/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions } from '@everyboard/games';
import { Minimax } from '@everyboard/games';

import { minimaxTest, SlowTest } from '../../../utils/tests/TestUtils.spec';
import { ApagosFullBoardHeuristic } from '../ApagosFullBoardHeuristic';
import { ApagosMove } from '../ApagosMove';
import { ApagosMoveGenerator } from '../ApagosMoveGenerator';
import { ApagosConfig, ApagosRules } from '../ApagosRules';
import { ApagosState } from '../ApagosState';

class ApagosFullBoardMinimax extends Minimax<ApagosMove, ApagosState, ApagosConfig> {
    public constructor() {
        super('Full Board', ApagosRules.get(), new ApagosFullBoardHeuristic(), new ApagosMoveGenerator());
    }
}

describe('ApagosFullBoardMinimax', () => {

    const rules: ApagosRules = ApagosRules.get();
    const minimax: ApagosFullBoardMinimax = new ApagosFullBoardMinimax();
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: ApagosConfig = ApagosRules.get().getDefaultRulesConfig();

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
