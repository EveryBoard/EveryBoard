/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions } from '@everyboard/games';
import { Minimax } from '@everyboard/games';
import { EmptyRulesConfig } from '@everyboard/games';

import { minimaxTest, SlowTest } from '../../../utils/tests/TestUtils.spec';
import { SaharaMobilityHeuristic } from '../SaharaMobilityHeuristic';
import { SaharaMove } from '../SaharaMove';
import { SaharaMoveGenerator } from '../SaharaMoveGenerator';
import { SaharaRules } from '../SaharaRules';
import { SaharaState } from '../SaharaState';

class SaharaMobilityMinimax extends Minimax<SaharaMove, SaharaState> {
    public constructor() {
        super('Mobility', SaharaRules.get(), new SaharaMobilityHeuristic(SaharaRules.get()), new SaharaMoveGenerator());
    }
}

describe('SaharaMobilityMinimax', () => {

    const rules: SaharaRules = SaharaRules.get();
    const minimax: SaharaMobilityMinimax = new SaharaMobilityMinimax();
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
